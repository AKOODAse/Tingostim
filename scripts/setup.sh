#!/usr/bin/env bash
# Tingostim first-run setup.
# Brings up Postgres + Odoo via docker compose, creates the MNtory database,
# installs the tingostim module, sets the admin password, and provisions the
# two factory users. Re-runnable: re-running re-applies passwords and re-installs
# the module without destroying data.
#
# Override defaults with env vars (see .env.example):
#   TINGOSTIM_DB                — database name (default: MNtory)
#   TINGOSTIM_ADMIN_PASSWORD    — skip the admin prompt
#   TINGOSTIM_FACTORY_PASSWORD  — skip the factory user prompt

set -euo pipefail

DB_NAME=${TINGOSTIM_DB:-MNtory}
ADMIN_PWD=${TINGOSTIM_ADMIN_PASSWORD:-}
FACTORY_PWD=${TINGOSTIM_FACTORY_PASSWORD:-}

cd "$(dirname "$0")/.."

# ── helpers ────────────────────────────────────────────────────────────────
prompt_password() {
    local label=$1 first second
    while true; do
        read -rsp "  Set ${label} password: " first; echo
        read -rsp "  Confirm ${label} password: " second; echo
        if [[ -z "$first" ]]; then
            echo "  ✗ empty password not allowed" >&2
            continue
        fi
        if [[ "$first" == "$second" ]]; then
            printf '%s' "$first"
            return
        fi
        echo "  ✗ passwords don't match, try again" >&2
    done
}

require() {
    command -v "$1" >/dev/null 2>&1 || { echo "✗ missing required command: $1" >&2; exit 1; }
}

# ── preflight ──────────────────────────────────────────────────────────────
require docker
require curl
if ! docker compose version >/dev/null 2>&1; then
    echo "✗ 'docker compose' v2 plugin not found. Install Docker Desktop or the compose v2 plugin." >&2
    exit 1
fi

echo "▸ Tingostim setup — database: ${DB_NAME}"

# ── credentials ────────────────────────────────────────────────────────────
if [[ -z "$ADMIN_PWD" ]]; then
    echo "▸ Odoo admin user (login: admin)"
    ADMIN_PWD=$(prompt_password "Odoo admin")
fi
if [[ -z "$FACTORY_PWD" ]]; then
    echo "▸ Factory users (logins: factory.a, factory.b — both get the same password)"
    FACTORY_PWD=$(prompt_password "factory user")
fi

# ── containers ─────────────────────────────────────────────────────────────
echo "▸ Bringing up Postgres + Odoo via docker compose…"
docker compose up -d

echo -n "▸ Waiting for Odoo HTTP… "
for _ in $(seq 1 60); do
    if curl -s -o /dev/null -w '%{http_code}' http://localhost:8069/web/login | grep -q 200; then
        echo "ready"
        break
    fi
    sleep 1
done

# ── database + module ──────────────────────────────────────────────────────
DB_EXISTS=$(docker compose exec -T db psql -U "${POSTGRES_USER:-odoo}" -lqt \
    | cut -d'|' -f1 \
    | tr -d ' ' \
    | grep -Fxq "$DB_NAME" && echo yes || echo no)

if [[ "$DB_EXISTS" == "no" ]]; then
    echo "▸ Creating database ${DB_NAME} and installing base…"
    docker compose exec -T odoo /entrypoint.sh odoo \
        -d "$DB_NAME" -i base --stop-after-init --no-http --without-demo=all \
        > /tmp/tingostim-init.log 2>&1 || { tail -40 /tmp/tingostim-init.log; exit 1; }
else
    echo "▸ Database ${DB_NAME} exists, skipping create"
fi

echo "▸ Installing / upgrading tingostim module…"
docker compose exec -T odoo /entrypoint.sh odoo \
    -d "$DB_NAME" -i tingostim --stop-after-init --no-http \
    > /tmp/tingostim-install.log 2>&1 || { tail -40 /tmp/tingostim-install.log; exit 1; }

# ── admin + factory users ──────────────────────────────────────────────────
echo "▸ Setting admin password and provisioning factory users…"
ADMIN_PWD="$ADMIN_PWD" FACTORY_PWD="$FACTORY_PWD" \
    docker compose exec -T -e ADMIN_PWD -e FACTORY_PWD odoo \
    /entrypoint.sh odoo shell -d "$DB_NAME" --no-http --log-level=warn <<'PYEOF' > /tmp/tingostim-users.log 2>&1 || { tail -40 /tmp/tingostim-users.log; exit 1; }
import os

admin_pwd = os.environ['ADMIN_PWD']
factory_pwd = os.environ['FACTORY_PWD']

env.ref('base.user_admin').password = admin_pwd

factory_group = env.ref('tingostim.group_tingostim_factory_user')
internal_group = env.ref('base.group_user')

def ensure_user(login, partner_name, password):
    partner = env['res.partner'].search(
        [('is_factory', '=', True), ('name', '=', partner_name)], limit=1)
    if not partner:
        raise RuntimeError(f'partner {partner_name!r} not found — was the module installed?')
    user = env['res.users'].search([('login', '=', login)], limit=1)
    if user:
        user.password = password
        user.groups_id = [(4, internal_group.id), (4, factory_group.id)]
        print(f'== reset {login}')
        return
    env['res.users'].create({
        'login': login,
        'partner_id': partner.id,
        'password': password,
        'groups_id': [(6, 0, [internal_group.id, factory_group.id])],
    })
    # res.users.create() rewrites the partner's name from the user dict;
    # restore the factory name we seeded.
    partner.name = partner_name
    print(f'++ created {login}')

ensure_user('factory.a', 'Factory A', factory_pwd)
ensure_user('factory.b', 'Factory B', factory_pwd)
env.cr.commit()
PYEOF

# ── restart so the live worker registers any new HTTP routes ──────────────
echo "▸ Restarting Odoo to load latest controllers…"
docker compose restart odoo >/dev/null

echo
echo "✓ Tingostim is up."
echo
echo "  Odoo backoffice : http://localhost:8069   (admin / <the password you set>)"
echo "  React frontend  : npm install && npm run dev   → http://localhost:5173"
echo "  Factory users   : factory.a, factory.b   (shared password you set)"
echo "  Simulator       : python3 -u tools/log_simulator.py"
echo
echo "Detailed logs : /tmp/tingostim-{init,install,users}.log"

# HANDOFF — Tingostim

This doc is for whoever picks up the server and security work on Tingostim. Architecture, models, and the Odoo module itself are in `README.md`; this file covers things you need to know that aren't obvious from the code.

---

## What you're inheriting

A working dev environment for a closed B2B platform that lets Ostim factories rent each other's idle machines. The app side (React + custom Odoo 18 module + Postgres) is done. What's still open:

- **Server side** — getting it onto a real machine with nginx + TLS + autostart + backups + log rotation.
- **Security** — hardening the Odoo install, auditing the access rules / record rules in the custom module, deciding how per-machine telemetry tokens get rotated, and tightening the master password / database manager surface.

---

## First-time setup

Five steps. Total time ~15 minutes once Docker is installed.

```bash
# 1. Install Docker (with the `docker compose` v2 plugin)
#    Linux:   https://docs.docker.com/engine/install/
#    macOS:   Docker Desktop
#    Windows: Docker Desktop with WSL2

# 2. Clone
git clone <repo-url> tingostim
cd tingostim

# 3. Bring up Postgres + Odoo, create DB, install module, provision users
./scripts/setup.sh
#    Prompts twice for the admin password and once (shared) for factory.a/factory.b

# 4. React frontend
npm install
npm run dev                            # http://localhost:5173

# 5. (Optional) live telemetry simulator
python3 -u tools/log_simulator.py      # demo speed
```

When `setup.sh` finishes it prints the URLs and login reminders. Walk through `TESTING.md` once to confirm everything works.

---

## What's not obvious from the code

- **Telemetry auth is a bearer token, not Odoo session.** Each `tingostim.machine` record has an `ingest_token` (32 random URL-safe bytes), generated on create, only readable by the Platform Admin group. The agent on the factory floor POSTs to `/tingostim/api/v1/machines/<id>/log` with `X-Ingest-Token: <token>`. There is no rotation policy yet — needs one for production.
- **The simulator (`tools/log_simulator.py`) is a placeholder.** It bootstraps machine tokens by shelling out to `docker exec db psql ...`. Real factory agents would have their token provisioned at install time.
- **No real factory agent exists.** Building one (PLC reader → POST loop) is out of scope for this repo.
- **Two security groups gate everything**: `group_tingostim_factory_user` (linked to one `res.partner` via `user.partner_id`) and `group_tingostim_platform_admin` (Tingostim staff). Definitions: `odoo-addon/tingostim/security/security_groups.xml`. ACL CSV: `odoo-addon/tingostim/security/ir.model.access.csv`.
- **Factories live as `res.partner` rows with `is_factory=True`**, not `res.company`. Means single-tenant Odoo, no multi-company permission machinery to fight with.
- **Machine status is computed from the latest log**, never edited via UI. The factory UI controls metadata (name, specs, hourly_rate, availability) — not state.
- **Frontend talks to Odoo via the Vite dev proxy** (`/api` → `localhost:8069`). In production, replace with nginx forwarding the same path.
- **DB name**: `MNtory`. Set in `src/api.js` (`DEFAULT_DB`) and `scripts/setup.sh`. Override per-machine via `TINGOSTIM_DB` env var (also gets injected into `--db-filter`).
- **`--db-filter` pins Odoo HTTP routing to one DB** (default `^MNtory$`, set in `docker-compose.yml`). This is required for the public telemetry endpoint to work — without a filter, Odoo can't auto-pick a database when more than one exists. To temporarily access a different DB (e.g. an old `E-fatura` for reference), stop the odoo container, remove the `--db-filter` from the compose command, restart, do your thing, then restore.

---

## What you're owning

### Server side (the deployment story)

The current `docker-compose.yml` is dev-only: bind-mounts the addon dir, exposes Odoo on `:8069`, no TLS, no nginx. Production targets, roughly:

- `docker-compose.prod.yml` overrides: drop the addon bind-mount (bake the module into the image instead — see Dockerfile sketch below), drop the public `:8069` port, add an `nginx` service that forwards `:443` → `odoo:8069` internally.
- Custom Odoo image:
  ```dockerfile
  FROM odoo:18
  COPY odoo-addon/tingostim /mnt/extra-addons/tingostim
  ```
  Tag, push to your registry, reference in `docker-compose.prod.yml`. Module updates become image rebuilds — better audit trail than live bind-mount.
- TLS: nginx + certbot sidecar (e.g. `jonasal/nginx-certbot`), terminate at nginx, forward to internal odoo.
- Secrets: move `POSTGRES_PASSWORD`, `TINGOSTIM_ADMIN_PASSWORD`, `TINGOSTIM_FACTORY_PASSWORD` to a real secrets store (Docker secrets, env file outside repo, or your provider's secret manager). The `.env.example` in the repo lists every var Tingostim reads.
- Autostart: `restart: unless-stopped` is already set on both services. For non-Docker hosts, wrap in systemd unit.
- Backups: nightly `pg_dump` of the `MNtory` database + periodic snapshot of the `odoo-data` volume (Odoo's filestore). Restore drill before you go live.
- Logs: Odoo logs to stdout; let your provider's log shipper handle it (or `journald` if running under systemd).

### Security side (the hardening story)

- **Filter master password**: `admin_passwd` in `odoo.conf` controls `/web/database/manager`. Set it to a long random string and **disable the manager UI in production** (`list_db = False` in `odoo.conf`).
- **Set `proxy_mode = True`** in `odoo.conf` once Odoo sits behind nginx, so it trusts `X-Forwarded-*` headers.
- **Rotate the admin password** post-deploy. The default from `setup.sh` is whatever you typed; nothing forces rotation.
- **Audit ACLs** in `odoo-addon/tingostim/security/`. The two record rules to triple-check:
  - `rule_machine_write_own_factory` — factory users can write machines only where `factory_id == user.partner_id`. Confirm this in a live session by logging in as `factory.a` and trying to edit a Factory B machine in the Odoo backoffice.
  - `rule_rental_request_visible` — factory users see only requests their partner is the requester or provider for.
- **Telemetry token strategy** — currently per-machine random tokens, no expiry. Decide on a rotation policy (e.g. on rotation, generate new token, agent re-registers within N hours; old token still works during overlap). The `action_regenerate_token` button on `tingostim.machine` does the single-machine rotation today.
- **Consider mTLS or HMAC-signed payloads** on the telemetry endpoint for production. Static bearer tokens over TLS are fine for the contract but vulnerable to leaked tokens.
- **Firewall**: only `:443` (and `:22` for SSH) open externally. `:8069` and `:5432` should not be reachable from the public internet.
- **Database access**: don't expose `:5432`. The Postgres user `odoo` should be unprivileged outside its own DB — review `pg_hba.conf` defaults.

---

## Useful commands

```bash
# View Odoo logs (last 200 lines)
docker compose logs --tail=200 odoo

# Apply a module change after editing files in odoo-addon/tingostim/
docker compose exec odoo /entrypoint.sh odoo -d MNtory -u tingostim --stop-after-init --no-http
docker compose restart odoo

# Open the Odoo shell (Python REPL with `env`, `self` bindings)
docker compose exec odoo /entrypoint.sh odoo shell -d MNtory --no-http

# Postgres shell
docker compose exec db psql -U odoo -d MNtory

# Inspect a machine's ingest token (admin-only field, queried directly)
docker compose exec db psql -U odoo -d MNtory -c \
  "select id, name, ingest_token from tingostim_machine order by id;"

# Reset everything (DESTRUCTIVE — wipes DB and filestore)
docker compose down -v
./scripts/setup.sh
```

---

## Migrating from the legacy `E-fatura` name

If you ever inherit a deployment that used the old `E-fatura` DB name (the original dev box did), rename in place — no data loss:

```bash
docker compose exec db psql -U odoo -c \
  'ALTER DATABASE "E-fatura" RENAME TO "MNtory";'
```

Then restart Odoo to pick up the rename. The simulator and frontend already default to `MNtory`.

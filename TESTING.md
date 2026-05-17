# TESTING — manual end-to-end checklist

Walk through this once after any non-trivial change. Time: ~15 minutes. Each step: do the thing, mark ✅ or ✏️ note what was off.

Assumes you've run `./scripts/setup.sh` and `npm install` at least once. Replace `<factory_password>` with whatever you set in setup. Replace `<admin_password>` similarly.

> **Container names**: this checklist uses `tingostim-db` / `tingostim-odoo` (the names set by `docker-compose.yml`). If you're on a legacy dev box where the containers are still named `db` / `odoo`, swap those names in any `docker compose` command for plain `docker exec <name>`.

---

## 1 · Preflight (3)

| # | Check | Expected | OK |
|---|---|---|---|
| 1.1 | `docker compose ps` | Both `tingostim-db` and `tingostim-odoo` show `running` | ☐ |
| 1.2 | `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8069/web/login` | `200` | ☐ |
| 1.3 | `docker compose exec -T db psql -U odoo -d MNtory -c "select state from ir_module_module where name='tingostim';"` | `installed` | ☐ |

---

## 2 · Login flow (3)

| # | Check | Expected | OK |
|---|---|---|---|
| 2.1 | Open http://localhost:5173 in a fresh tab (or after sign-out) | Black login card titled "Tingostim — Authorized Access"; only **Login** + **Password** fields visible (no Database field) | ☐ |
| 2.2 | Type `factory.a` + `wrongpassword` → Enter Platform | Red error "invalid credentials" appears inline; you stay on login | ☐ |
| 2.3 | Click `▾ Use a different database` | Database field expands inline showing `MNtory`; clicking the link again collapses it | ☐ |

---

## 3 · Dashboard data (3)

Sign in as `factory.a` / `<factory_password>` and stay there for sections 3-5.

| # | Check | Expected | OK |
|---|---|---|---|
| 3.1 | Header shows your username top-right with a **Sign Out** button | Username visible; sign-out hover turns red | ☐ |
| 3.2 | **Dashboard** view loads 12 machine cards within ~2 seconds | 12 cards across Factory A + Factory B; status badges colored (green=idle, red=busy, amber=maintenance) | ☐ |
| 3.3 | Filter by Factory A only | Card count drops to 6 (Factory A machines only) | ☐ |

---

## 4 · Cross-views (4)

| # | Check | Expected | OK |
|---|---|---|---|
| 4.1 | **Capacity** view | Two factory cards with utilization bars; non-zero | ☐ |
| 4.2 | **Trending** view | At least 6 categories ranked by demand score | ☐ |
| 4.3 | **Leaderboard** view | Factory A and Factory B with KPIs (jobs, revenue, uptime, rating, streak) populated | ☐ |
| 4.4 | **Compare** view, click 2 idle machines | Both selected, side-by-side table rendered with their specs/rates | ☐ |

---

## 5 · Rental flow (3)

| # | Check | Expected | OK |
|---|---|---|---|
| 5.1 | **Rentals** → pick any **Factory B** idle machine → fill date + duration → "Request This Machine" | Success card "Rental Request #N Submitted" with machine, requester=Factory A, provider=Factory B, estimated cost | ☐ |
| 5.2 | Back to listings → pick any **Factory A** idle machine → same form → submit | Inline red error "cannot rent a machine from your own factory" (server-enforced, no UI guard) | ☐ |
| 5.3 | Open http://localhost:8069 in a new tab → log in as `admin` / `<admin_password>` → **Tingostim → Rental Requests** | The request from 5.1 is visible with state `pending`, requester Factory A, machine TL-7 (or whichever you picked) | ☐ |

---

## 6 · Telemetry simulator (2)

| # | Check | Expected | OK |
|---|---|---|---|
| 6.1 | `python3 -u tools/log_simulator.py` in a side terminal | Header prints "min idle : 5"; events start flowing as `HTTP 201` lines, status badges in the React Dashboard flip within ~10s | ☐ |
| 6.2 | Let it run 60 seconds, then `docker compose exec -T db psql -U odoo -d MNtory -c "select status, count(*) from tingostim_machine group by status;"` | `idle` count is `>= 5`; the `--min-idle` floor held | ☐ |

Ctrl-C the simulator before moving on.

---

## 7 · API smoke tests (5)

Backend-only checks via curl — catches issues even when the UI looks healthy. Each command on one line; copy-paste straight into the terminal.

Setup a cookie jar:

```bash
JAR=$(mktemp)
```

| # | Check | Expected | OK |
|---|---|---|---|
| 7.1 | `curl -s -c "$JAR" -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","params":{"db":"MNtory","login":"factory.a","password":"<factory_password>"}}' http://localhost:8069/web/session/authenticate \| python3 -c "import sys,json; r=json.load(sys.stdin); print('uid=', r['result']['uid'], 'partner=', r['result']['partner_id'])"` | `uid= 26 partner= 97` (numbers may differ; both should be non-null) | ☐ |
| 7.2 | `curl -s -b "$JAR" http://localhost:8069/tingostim/api/v1/machines \| python3 -c "import sys,json; print('machine_count=', len(json.load(sys.stdin)))"` | `machine_count= 12` | ☐ |
| 7.3 | `MID=$(docker compose exec -T db psql -U odoo -d MNtory -t -A -c "select m.id from tingostim_machine m join res_partner p on p.id=m.factory_id where p.name='Factory B' and m.status='idle' order by m.id limit 1;") && TOKEN=$(docker compose exec -T db psql -U odoo -d MNtory -t -A -c "select ingest_token from tingostim_machine where id=$MID;") && curl -s -X POST -H "X-Ingest-Token: $TOKEN" -H 'Content-Type: application/json' -d '{"status":"busy","capacity":77}' "http://localhost:8069/tingostim/api/v1/machines/$MID/log"` | `{"ok": true, "log_id": ..., "machine_status": "busy"}` | ☐ |
| 7.4 | `curl -s -b "$JAR" -H 'Content-Type: application/json' -d "{\"machine_id\":$MID,\"requested_date\":\"2026-07-01\",\"duration_hours\":2,\"notes\":\"smoke test\"}" http://localhost:8069/tingostim/api/v1/rental_requests` | JSON with `"id"`, `"state": "pending"`, `"estimated_cost"` matching `2 × hourly_rate` | ☐ |
| 7.5 | Find an idle Factory A machine and try to rent it as factory.a: `MID_A=$(docker compose exec -T db psql -U odoo -d MNtory -t -A -c "select m.id from tingostim_machine m join res_partner p on p.id=m.factory_id where p.name='Factory A' and m.status='idle' order by m.id limit 1;") && curl -s -b "$JAR" -H 'Content-Type: application/json' -d "{\"machine_id\":$MID_A,\"requested_date\":\"2026-07-01\",\"duration_hours\":1}" http://localhost:8069/tingostim/api/v1/rental_requests` | `{"error": "cannot rent a machine from your own factory"}` | ☐ |

Cleanup: `rm "$JAR"`

---

## Done

If every box is ✅, the build is healthy. If any are ✏️ or ☒, file what was wrong and fix before continuing.

# Tingostim

**B2B platform for industrial capacity sharing in Ostim, Ankara.** Closed system connecting contracted factories so they can rent each other's idle machines and share manufacturing capacity. Every factory is both renter and provider.

---

## Architecture

```
Browser  ──►  React + Vite (port 5173)
                     │
                     │  /api/*  (Vite dev proxy)
                     ▼
              Odoo 18 (port 8069)  ──►  Postgres 15
                     │
                     ├─ custom module: tingostim
                     │    ├─ models: machine, machine_log, rental_request, trending
                     │    └─ controllers: /tingostim/api/v1/*
                     │
                     └─ admin-provisioned users (closed system)

Factory floor ─POST /machines/<id>/log─►  Odoo  (real agent — future work)
   (simulator stands in for the agent today)
```

---

## Project structure

```
.
├── src/                        # React frontend
│   ├── App.jsx                 # auth state + fetch loop
│   ├── api.js                  # session + REST helpers
│   ├── components/
│   │   ├── LoginScreen.jsx
│   │   ├── Header.jsx          # nav + sign-out
│   │   ├── Dashboard.jsx
│   │   ├── MachineCard.jsx
│   │   ├── CapacityView.jsx
│   │   ├── RentalView.jsx      # posts to /api/tingostim/api/v1/rental_requests
│   │   ├── TrendingView.jsx
│   │   ├── LeaderboardView.jsx
│   │   └── MachineComparison.jsx
│   └── main.jsx
├── odoo-addon/tingostim/       # custom Odoo 18 module
│   ├── __manifest__.py
│   ├── models/                 # res.partner ext + machine, machine_log, rental_request, trending
│   ├── security/               # 2 groups, ACLs, record rules
│   ├── views/                  # tree, form, kanban, menus
│   ├── controllers/api.py      # REST endpoints under /tingostim/api/v1/
│   └── data/demo_factories.xml # seed: 2 factories + 12 machines + initial logs
├── tools/
│   └── log_simulator.py        # telemetry agent stand-in for the demo
└── vite.config.js              # /api proxy → :8069
```

---

## Quick start

**Prereqs**: Docker (with `docker compose`), Node 18+, Python 3.10+. Nothing else needs to be pre-installed — `scripts/setup.sh` brings up Postgres + Odoo + the custom module from scratch.

```bash
# 1. Bring up containers, create DB, install module, provision factory users
./scripts/setup.sh                       # prompts for admin + factory passwords

# 2. Run the React app
npm install
npm run dev                              # http://localhost:5173

# 3. Log in (LoginScreen — closed system, no signup)
#    factory.a / <password you just set>  → Factory A user
#    factory.b / <password you just set>  → Factory B user

# 4. Watch live status flips during the demo
python3 -u tools/log_simulator.py        # demo speed (seconds)
python3 -u tools/log_simulator.py --slow # realistic minute-scale
```

Odoo backoffice (Tingostim → Machines / Rental Requests / Factories) is at `http://localhost:8069`.

For a friend taking over server / security work, see **`HANDOFF.md`**. For a manual end-to-end test pass, see **`TESTING.md`**.

---

## API surface

All endpoints under `/tingostim/api/v1/` (proxied from React as `/api/tingostim/api/v1/`).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET  | `/machines`                | session  | All machines across all factories |
| GET  | `/machines/<id>`           | session  | Single machine |
| GET  | `/trending`                | session  | Category demand snapshots |
| GET  | `/leaderboard`             | session  | Per-factory KPI rollup |
| GET  | `/rental_requests`         | session  | All visible requests (`?mine=1` for the user's factory only) |
| POST | `/rental_requests`         | session  | Submit a request (rejects own-factory) |
| POST | `/machines/<id>/log`       | token    | Telemetry ingest — `X-Ingest-Token` header |

Auth: Odoo session via `POST /web/session/authenticate {db, login, password}`. Telemetry endpoint uses a per-machine token stored on `tingostim.machine.ingest_token` (admin-only readable).

---

## Demo script

1. Show `docker ps` — Odoo + Postgres running.
2. Open http://localhost:5173 → **LoginScreen** ("closed system / authorized access").
3. Log in as `factory.a`. Header shows your username; dashboard loads machines from Odoo.
4. **Dashboard** → filter by status, by factory.
5. **Rentals** → pick a Factory B idle machine → fill date + duration → submit. Success card shows request ID, estimated cost.
6. Try to rent a Factory A machine while logged in as factory.a → inline red error "cannot rent a machine from your own factory" (server-enforced).
7. **Telemetry**: run `python3 -u tools/log_simulator.py` in a side terminal — say:
   > "This is the API contract a factory's machine agent uses. The simulator sends the same payload a real CNC controller would. In production this is replaced per factory; the platform contract doesn't change."
8. Watch badges flip in the React dashboard within 10s (poll interval). Each event line shows the API responded `HTTP 201`.
9. Open Odoo at :8069 as admin → **Tingostim → Rental Requests** → see the request submitted in step 5.

---

## Roles & permissions

| Group | Scope |
|---|---|
| **Platform Admin** (`group_tingostim_platform_admin`) | Tingostim staff. Creates `res.partner` factories, provisions users, issues per-machine ingest tokens. Sees everything. |
| **Factory User** (`group_tingostim_factory_user`) | Linked to one `res.partner` via `user.partner_id`. Reads all machines; edits **only their own factory's** machine metadata (status is automated, never UI). Creates rental requests on other factories' idle machines; sees requests their factory is involved in. |

Closed system: no anonymous browse, no self-signup, admin provisions credentials.

---

## Stack

- **Backend**: Odoo 18 (custom module `tingostim`), Postgres 15
- **Frontend**: React 18, Vite 5
- **Telemetry simulator**: stdlib Python (no deps)
- **Containers**: Docker (`odoo`, `db` containers on host)

---

## Future work (real telemetry)

The platform contract for `POST /machines/<id>/log` is built and proven by the simulator. To replace the simulator with a real factory-floor agent:

- Python agent running on each factory's network, reading PLCs via OPC-UA / Modbus / vendor SDK
- Each machine provisioned with its `ingest_token` from the Tingostim admin UI
- Agent POSTs to the same endpoint; no platform-side changes needed
- Reference: EquipmentShare's telemetry-driven status model

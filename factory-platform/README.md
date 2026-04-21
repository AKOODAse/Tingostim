# FactoryLink — B2B Industrial Capacity Platform
## Graduation Project Demo

---

## Project structure

```
factory-platform/
├── src/                        # React frontend (Vite)
│   ├── App.jsx                 # Main app, data fetching, routing
│   ├── components/
│   │   ├── Header.jsx          # Nav bar
│   │   ├── StatusBar.jsx       # Live server connection indicators
│   │   ├── Dashboard.jsx       # Machine dashboard + filters
│   │   ├── MachineCard.jsx     # Individual machine card + modal
│   │   ├── CapacityView.jsx    # Capacity sharing overview
│   │   └── RentalView.jsx      # Idle machine rental marketplace
├── server-factory-a/
│   ├── machines.json           # Factory A machine data
│   └── setup.sh                # DevOps setup script
└── server-factory-b/
    ├── machines.json           # Factory B machine data
    └── setup.sh                # DevOps setup script
```

---

## Quick start (local demo — no servers needed)

```bash
# 1. Install dependencies
npm install

# 2. Start both fake servers (two terminals)
npx json-server --watch server-factory-a/machines.json --port 3001
npx json-server --watch server-factory-b/machines.json --port 3002

# 3. Start React app (third terminal)
npm run dev

# Open http://localhost:5173
```

---

## Real server setup (DevOps)

### On each factory machine (Ubuntu/Debian):
```bash
cd server-factory-a   # or server-factory-b
chmod +x setup.sh
./setup.sh
```

The script installs and configures:
- **json-server** — serves machines.json as a REST API
- **pm2** — keeps the server running, auto-restarts on reboot
- **Nginx** — reverse proxy with CORS headers
- **ufw** — firewall: blocks direct port access, allows only HTTPS
- **certbot** — free SSL from Let's Encrypt

### After setup, update App.jsx:
```js
// src/App.jsx — line 8
const FACTORY_SOURCES = [
  { id: 'a', name: 'Factory A', url: 'https://factory-a.yourdomain.com/machines', color: '#00e5a0' },
  { id: 'b', name: 'Factory B', url: 'https://factory-b.yourdomain.com/machines', color: '#4d9fff' },
]
```

---

## Deploy the website

```bash
npm run build
npx vercel   # or: npx netlify deploy --prod --dir=dist
```

---

## Demo script (for the presentation)

1. Open the website — show the **Status Bar** at the top: Factory A online, Factory B online
2. Go to **Machine Dashboard** — filter by factory, filter by "idle"
3. Click a machine card — show the detail modal + rental request button
4. Go to **Capacity Sharing** — show utilization bars per factory
5. Go to **Idle Rentals** — submit a rental form to show the booking flow
6. **The live proof**: SSH into factory-a server, open `machines.json`,
   change one machine's status from `"idle"` to `"busy"`, save.
   Wait 30 seconds → the website updates automatically.

---

## Machine status values

| Status | Meaning |
|--------|---------|
| `idle` | Machine is free — available for rental |
| `busy` | Machine is running a job — not available |
| `maintenance` | Down for maintenance — unavailable |

---

## Report sections this covers

- System architecture (2+ factory servers → API Gateway → React frontend)
- DevOps: server setup, process management (pm2), reverse proxy (Nginx)
- Cybersecurity: firewall rules (ufw), SSL/TLS encryption, CORS policy
- B2B platform: machine discovery, capacity visibility, rental workflow
- Agile: 3-week sprint, iterative delivery, MVP scope
- Future work: real Odoo ERP sync, authentication, booking database

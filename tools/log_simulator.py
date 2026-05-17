#!/usr/bin/env python3
"""Tingostim machine telemetry simulator.

Pretends to be the factory-floor agent that would, in production, read each
machine's PLC and POST a status log to the Tingostim API. Hits the real
endpoint with the real per-machine ingest token — only the data is simulated.

Bootstraps machine list + tokens from the Postgres container by default
(via `docker exec db psql ...`), or from a JSON config when running outside
the dev host.

Usage:
    python tools/log_simulator.py
    python tools/log_simulator.py --base-url http://localhost:8069 --tick 1.0
    python tools/log_simulator.py --tokens-file mytokens.json

Stop with Ctrl-C.
"""
from __future__ import annotations

import argparse
import json
import random
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field

API_PATH = '/tingostim/api/v1/machines/{machine_id}/log'

# Per-state next-state probabilities — chosen so demos have visible flips but
# machines still spend most time in plausible states.
TRANSITIONS = {
    'idle':        [('busy', 0.75),        ('maintenance', 0.05), ('idle', 0.20)],
    'busy':        [('idle', 0.80),        ('maintenance', 0.05), ('busy', 0.15)],
    'maintenance': [('idle', 0.90),        ('maintenance', 0.10)],
    'unknown':     [('idle', 1.0)],
}

# Duration ranges (seconds) per state. Demo-fast by default — change with --slow.
DURATION_DEMO = {
    'idle':        (8, 30),
    'busy':        (15, 60),
    'maintenance': (20, 90),
}
DURATION_REALISTIC = {
    'idle':        (180, 900),     # 3–15 min
    'busy':        (600, 2700),    # 10–45 min
    'maintenance': (1800, 7200),   # 30–120 min
}

# Capacity range (%) per state.
CAPACITY = {
    'idle':        (0, 12),
    'busy':        (55, 96),
    'maintenance': (0, 0),
    'unknown':     (0, 0),
}

ANSI = {
    'idle':        '\033[92m',  # green
    'busy':        '\033[91m',  # red
    'maintenance': '\033[93m',  # yellow
    'unknown':     '\033[90m',  # grey
    'reset':       '\033[0m',
    'dim':         '\033[2m',
    'bold':        '\033[1m',
}


@dataclass
class Machine:
    id: int
    name: str
    machine_type: str
    token: str
    status: str = 'idle'
    capacity: float = 0.0
    next_flip_at: float = 0.0


def weighted_pick(choices: list[tuple[str, float]]) -> str:
    r = random.random()
    cumulative = 0.0
    for value, weight in choices:
        cumulative += weight
        if r <= cumulative:
            return value
    return choices[-1][0]


def bootstrap_from_db(db_container: str, db_user: str, db_name: str) -> list[Machine]:
    sql = (
        "select m.id, m.name, m.machine_type, m.ingest_token "
        "from tingostim_machine m where m.active=true and m.ingest_token is not null "
        "order by m.id;"
    )
    cmd = ['docker', 'exec', db_container, 'psql', '-U', db_user, '-d', db_name,
           '-t', '-A', '-F', '|', '-c', sql]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=10)
    except FileNotFoundError:
        sys.exit('error: `docker` not found on PATH; use --tokens-file instead')
    except subprocess.CalledProcessError as e:
        sys.exit(f'error: postgres query failed:\n{e.stderr}')
    machines = []
    for line in proc.stdout.strip().splitlines():
        parts = line.split('|')
        if len(parts) != 4:
            continue
        mid, name, mtype, token = parts
        machines.append(Machine(id=int(mid), name=name, machine_type=mtype, token=token))
    if not machines:
        sys.exit('error: no machines with ingest tokens found in DB')
    return machines


def bootstrap_from_file(path: str) -> list[Machine]:
    with open(path) as fh:
        data = json.load(fh)
    machines = []
    for entry in data:
        machines.append(Machine(
            id=int(entry['id']),
            name=entry.get('name', f'machine-{entry["id"]}'),
            machine_type=entry.get('machine_type', 'other'),
            token=entry['token'],
        ))
    return machines


def post_log(base_url: str, machine: Machine, status: str, capacity: float, timeout: float) -> tuple[bool, str]:
    url = base_url.rstrip('/') + API_PATH.format(machine_id=machine.id)
    body = json.dumps({'status': status, 'capacity': capacity}).encode('utf-8')
    req = urllib.request.Request(
        url, data=body, method='POST',
        headers={'Content-Type': 'application/json', 'X-Ingest-Token': machine.token},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return True, f'HTTP {resp.status}'
    except urllib.error.HTTPError as e:
        return False, f'HTTP {e.code} {e.reason}'
    except urllib.error.URLError as e:
        return False, f'connection failed: {e.reason}'


def schedule_next_flip(machine: Machine, durations: dict, now: float) -> None:
    lo, hi = durations.get(machine.status, (10, 30))
    machine.next_flip_at = now + random.uniform(lo, hi)


def step(machine: Machine, machines: list[Machine], min_idle: int) -> tuple[str, float]:
    """Return the next (status, capacity) for the machine, enforcing the idle floor."""
    new_status = weighted_pick(TRANSITIONS.get(machine.status, [('idle', 1.0)]))

    # Demo guard: refuse a flip that would leave fewer than `min_idle` machines idle.
    if machine.status == 'idle' and new_status != 'idle':
        idle_count = sum(1 for m in machines if m.status == 'idle')
        if idle_count <= min_idle:
            new_status = 'idle'

    cap_lo, cap_hi = CAPACITY[new_status]
    new_capacity = round(random.uniform(cap_lo, cap_hi), 1) if cap_hi > 0 else 0.0
    return new_status, new_capacity


def format_event(machine: Machine, old_status: str, new_status: str, new_capacity: float, result: str) -> str:
    arrow = '─→' if old_status == new_status else '⇒'
    color = ANSI.get(new_status, '')
    return (
        f'{ANSI["dim"]}[{time.strftime("%H:%M:%S")}]{ANSI["reset"]} '
        f'{ANSI["bold"]}{machine.name:<28}{ANSI["reset"]} '
        f'{ANSI.get(old_status, "")}{old_status:>11}{ANSI["reset"]} {arrow} '
        f'{color}{new_status:<11}{ANSI["reset"]} '
        f'cap={ANSI["bold"]}{new_capacity:5.1f}%{ANSI["reset"]}  '
        f'{ANSI["dim"]}{result}{ANSI["reset"]}'
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://localhost:8069',
                        help='Tingostim API base URL (default: %(default)s)')
    parser.add_argument('--tokens-file',
                        help='JSON file with [{id, token, name?, machine_type?}, ...] instead of DB bootstrap')
    parser.add_argument('--db-container', default='db', help='Postgres container name (default: db)')
    parser.add_argument('--db-user', default='odoo')
    parser.add_argument('--db-name', default='MNtory')
    parser.add_argument('--tick', type=float, default=1.0,
                        help='Seconds between scheduler ticks (default: %(default)s)')
    parser.add_argument('--slow', action='store_true',
                        help='Use realistic minute-scale durations instead of demo-fast seconds')
    parser.add_argument('--min-idle', type=int, default=5,
                        help='Demo guard: never flip a machine out of idle if doing so would drop '
                             'the idle count below this (default: %(default)s). Pass 0 to disable.')
    parser.add_argument('--request-timeout', type=float, default=5.0)
    parser.add_argument('--seed', type=int)
    args = parser.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    if args.tokens_file:
        machines = bootstrap_from_file(args.tokens_file)
        source = args.tokens_file
    else:
        machines = bootstrap_from_db(args.db_container, args.db_user, args.db_name)
        source = f'docker exec {args.db_container}'

    durations = DURATION_REALISTIC if args.slow else DURATION_DEMO

    min_idle = max(0, min(args.min_idle, len(machines)))

    print(f'{ANSI["bold"]}Tingostim telemetry simulator{ANSI["reset"]}')
    print(f'  base url : {args.base_url}')
    print(f'  source   : {source}')
    print(f'  mode     : {"realistic (minutes)" if args.slow else "demo (seconds)"}')
    print(f'  machines : {len(machines)}')
    print(f'  min idle : {min_idle}{" (disabled)" if min_idle == 0 else ""}')
    print(f'  press Ctrl-C to stop\n')

    now = time.time()
    for m in machines:
        # Stagger the first flip so they don't all flip at once on startup.
        m.next_flip_at = now + random.uniform(2, 10)

    stopped = False
    def handle_sigint(*_):
        nonlocal stopped
        stopped = True
        print(f'\n{ANSI["dim"]}stopping…{ANSI["reset"]}')
    signal.signal(signal.SIGINT, handle_sigint)

    while not stopped:
        now = time.time()
        due = [m for m in machines if now >= m.next_flip_at]
        for m in due:
            old_status = m.status
            new_status, new_capacity = step(m, machines, min_idle)
            ok, result = post_log(args.base_url, m, new_status, new_capacity, args.request_timeout)
            if ok:
                m.status = new_status
                m.capacity = new_capacity
            print(format_event(m, old_status, new_status, new_capacity, result))
            schedule_next_flip(m, durations, now)
        time.sleep(args.tick)


if __name__ == '__main__':
    main()

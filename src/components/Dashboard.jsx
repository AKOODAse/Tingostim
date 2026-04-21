import { useState } from 'react'
import MachineCard from './MachineCard.jsx'
import FactorySpotlight from './FactorySpotlight.jsx'

const STATUS_COLORS = {
  idle:        { bg: 'rgba(0,229,160,0.08)',  border: 'rgba(0,229,160,0.25)',  dot: '#00e5a0', label: 'Idle'        },
  busy:        { bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.25)', dot: '#f5a623', label: 'Busy'        },
  maintenance: { bg: 'rgba(255,77,77,0.08)',  border: 'rgba(255,77,77,0.25)',  dot: '#ff4d4d', label: 'Maintenance' },
}

export default function Dashboard({ machines, factories }) {
  const [filterFactory, setFilterFactory] = useState('all')
  const [filterStatus,  setFilterStatus]  = useState('all')
  const [filterType,    setFilterType]    = useState('all')
  const [search,        setSearch]        = useState('')

  const types = [...new Set(machines.map(m => m.type))].sort()

  const filtered = machines.filter(m => {
    if (filterFactory !== 'all' && m._factory?.id !== filterFactory) return false
    if (filterStatus  !== 'all' && m.status !== filterStatus)         return false
    if (filterType    !== 'all' && m.type   !== filterType)           return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) &&
        !m.type.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = {
    idle:        machines.filter(m => m.status === 'idle').length,
    busy:        machines.filter(m => m.status === 'busy').length,
    maintenance: machines.filter(m => m.status === 'maintenance').length,
  }

  return (
    <div>
      {/* Factory Spotlight */}
      <FactorySpotlight machines={machines} factories={factories} />

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total machines', value: machines.length, color: '#e8e8f0' },
          { label: 'Idle / available', value: counts.idle, color: '#00e5a0' },
          { label: 'Currently busy', value: counts.busy, color: '#f5a623' },
          { label: 'In maintenance', value: counts.maintenance, color: '#ff4d4d' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#111114',
            border: '1px solid #2a2a32',
            borderRadius: 12,
            padding: '20px 24px',
          }}>
            <div style={{ fontSize: 12, color: '#7a7a8e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {s.label}
            </div>
            <div style={{ fontSize: 36, fontWeight: 600, color: s.color, fontFamily: 'Space Mono, monospace' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search machines..."
          style={{
            background: '#111114', border: '1px solid #2a2a32', borderRadius: 8,
            padding: '8px 14px', color: '#e8e8f0', fontSize: 13, outline: 'none',
            width: 200,
          }}
        />
        {[
          { label: 'Factory', value: filterFactory, set: setFilterFactory,
            options: [['all','All factories'], ...factories.map(f => [f.id, f.name])] },
          { label: 'Status', value: filterStatus, set: setFilterStatus,
            options: [['all','All statuses'], ['idle','Idle'], ['busy','Busy'], ['maintenance','Maintenance']] },
          { label: 'Type', value: filterType, set: setFilterType,
            options: [['all','All types'], ...types.map(t => [t, t])] },
        ].map(f => (
          <select
            key={f.label}
            value={f.value}
            onChange={e => f.set(e.target.value)}
            style={{
              background: '#111114', border: '1px solid #2a2a32', borderRadius: 8,
              padding: '8px 14px', color: '#e8e8f0', fontSize: 13, outline: 'none', cursor: 'pointer',
            }}
          >
            {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <span style={{ marginLeft: 'auto', color: '#7a7a8e', fontSize: 13 }}>
          {filtered.length} of {machines.length} machines
        </span>
      </div>

      {/* Cards grid */}
      {machines.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#3a3a46' }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, marginBottom: 8 }}>
            Connecting to factory servers...
          </div>
          <div style={{ fontSize: 12, color: '#2a2a32' }}>
            Make sure json-server is running on ports 3001 and 3002
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#3a3a46' }}>
          No machines match the current filters.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(m => <MachineCard key={m.id} machine={m} statusColors={STATUS_COLORS} />)}
        </div>
      )}
    </div>
  )
}

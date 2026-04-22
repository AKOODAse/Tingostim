import { useState } from 'react'
import MachineCard from './MachineCard.jsx'

const STATUS_COLORS = {
  idle:        { bg: '#4FB39F', border: '#4FB39F', dot: '#4FB39F', label: 'Idle'        },
  busy:        { bg: '#E83828', border: '#E83828', dot: '#E83828', label: 'Busy'        },
  maintenance: { bg: '#E8A33B', border: '#E8A33B', dot: '#E8A33B', label: 'Maintenance' },
}

export default function LeaderboardView({ leaderboard, machines, factories = [] }) {
  const [filterFactory, setFilterFactory] = useState('all')
  const [filterStatus,  setFilterStatus]  = useState('all')
  const [filterType,    setFilterType]    = useState('all')
  const [search,        setSearch]        = useState('')

  const enriched = leaderboard
    .map(entry => {
      const factoryMachines = machines.filter(m => m.factory === entry.factory_name)
      const totalCapacity = factoryMachines.length
        ? Math.round(factoryMachines.reduce((s, m) => s + m.capacity, 0) / factoryMachines.length)
        : 0
      return { ...entry, machine_count: factoryMachines.length, avg_capacity: totalCapacity }
    })
    .sort((a, b) => b.jobs_completed - a.jobs_completed)

  const medals = ['#E83828', '#E8A33B', '#4FB39F']
  const rankLabels = ['1st', '2nd', '3rd']
  const factoryColors = ['#E83828', '#4FB39F', '#E8A33B']

  const metrics = [
    { key: 'jobs_completed', label: 'Jobs Completed', format: v => v.toLocaleString(), max: Math.max(...enriched.map(e => e.jobs_completed)) },
    { key: 'revenue', label: 'Revenue Earned', format: v => `€${(v / 1000).toFixed(1)}K`, max: Math.max(...enriched.map(e => e.revenue)) },
    { key: 'uptime', label: 'Uptime', format: v => `${v}%`, max: 100 },
    { key: 'rating', label: 'Rating', format: v => `${v}/5.0`, max: 5 },
  ]

  // Derive available factories from machines if not passed in
  const factoryOptions = factories.length
    ? factories
    : [...new Map(machines.map(m => [m._factory?.id, m._factory])).values()].filter(Boolean)

  const types = [...new Set(machines.map(m => m.type))].sort()

  const filtered = machines.filter(m => {
    if (filterFactory !== 'all' && m._factory?.id !== filterFactory) return false
    if (filterStatus  !== 'all' && m.status !== filterStatus)         return false
    if (filterType    !== 'all' && m.type   !== filterType)           return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) &&
        !m.type.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const inputStyle = {
    background: '#18181B',
    border: '2px solid #2D2A30',
    padding: '8px 14px',
    color: '#F4F2F0',
    fontSize: 12,
    outline: 'none',
    fontFamily: 'Space Mono, monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{
          fontSize: 22, fontWeight: 700, color: '#F4F2F0', marginBottom: 8,
          fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          ▣ Factory Leaderboard
        </h2>
        <p style={{ fontSize: 12, color: '#8A8688', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Tracking competition · jobs · revenue · uptime · ratings.
        </p>
      </div>

      {/* Podium cards */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${enriched.length}, 1fr)`, gap: 18, marginBottom: 32 }}>
        {enriched.map((entry, i) => (
          <div key={entry.id} style={{
            background: '#18181B',
            border: '2px solid #2D2A30',
            borderTop: `6px solid ${medals[i] || '#8A8688'}`,
            padding: 28,
            textAlign: 'center',
            position: 'relative',
            boxShadow: i === 0 ? '6px 6px 0 #E83828' : '4px 4px 0 #18181B',
          }}>
            <div style={{
              width: 60, height: 60,
              background: medals[i] || '#8A8688',
              border: '3px solid #18181B',
              boxShadow: `0 0 0 2px ${medals[i] || '#8A8688'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <span style={{
                fontSize: 18, fontWeight: 700, fontFamily: 'Space Mono, monospace',
                color: '#18181B', textTransform: 'uppercase',
              }}>
                {rankLabels[i] || `${i + 1}TH`}
              </span>
            </div>

            <div style={{
              fontSize: 20, fontWeight: 700, color: '#F4F2F0', marginBottom: 6,
              fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {entry.factory_name}
            </div>
            <div style={{ fontSize: 11, color: '#8A8688', marginBottom: 8, fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {entry.specialty}
            </div>
            <div style={{
              fontSize: 10, color: '#18181B', marginBottom: 20,
              background: '#4FB39F', display: 'inline-block',
              padding: '4px 12px',
              fontFamily: 'Space Mono, monospace', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              ▶ {entry.streak} day streak
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Jobs', value: entry.jobs_completed, color: '#F4F2F0' },
                { label: 'Revenue', value: `€${(entry.revenue / 1000).toFixed(1)}K`, color: '#E83828' },
                { label: 'Uptime', value: `${entry.uptime}%`, color: entry.uptime > 95 ? '#4FB39F' : '#E83828' },
                { label: 'Rating', value: `${entry.rating}/5`, color: '#E8A33B' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: '#25252A', border: '2px solid #2D2A30', padding: '12px 10px',
                }}>
                  <div style={{
                    fontSize: 9, color: '#8A8688', textTransform: 'uppercase', letterSpacing: '0.1em',
                    marginBottom: 4, fontFamily: 'Space Mono, monospace', fontWeight: 700,
                  }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Metrics comparison */}
      <div style={{ background: '#18181B', border: '2px solid #2D2A30', padding: 24, marginBottom: 32 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: '#F4F2F0', marginBottom: 24,
          fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          ▣ Head-To-Head Comparison
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {metrics.map(metric => (
            <div key={metric.key}>
              <div style={{
                fontSize: 11, color: '#8A8688', textTransform: 'uppercase', letterSpacing: '0.1em',
                marginBottom: 12, fontFamily: 'Space Mono, monospace', fontWeight: 700,
              }}>
                ▸ {metric.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {enriched.map((entry, i) => {
                  const value = entry[metric.key]
                  const pct = (value / metric.max) * 100
                  return (
                    <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        width: 90, fontSize: 11, color: '#F4F2F0', flexShrink: 0,
                        fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700,
                      }}>
                        {entry.factory_name}
                      </span>
                      <div style={{ flex: 1, height: 12, background: '#0A0A0C', border: '2px solid #2D2A30', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: factoryColors[i] || '#8A8688',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                      <span style={{
                        fontSize: 13, fontFamily: 'Space Mono, monospace', fontWeight: 700,
                        color: '#F4F2F0', minWidth: 70, textAlign: 'right',
                      }}>
                        {metric.format(value)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================= */}
      {/* MACHINE BROWSER (moved from Dashboard)                  */}
      {/* ======================================================= */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{
          fontSize: 20, fontWeight: 700, color: '#F4F2F0', marginBottom: 6,
          fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          ▣ Browse All Machines
        </h2>
        <p style={{ fontSize: 12, color: '#8A8688', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Filter the full fleet across every factory on the leaderboard.
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center',
        background: '#18181B', border: '2px solid #2D2A30', padding: 14,
      }}>
        <span style={{
          fontSize: 10, color: '#E83828', fontFamily: 'Space Mono, monospace',
          textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
        }}>
          ▸ Filter
        </span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="SEARCH..."
          style={{ ...inputStyle, width: 200 }}
        />
        {[
          { label: 'Factory', value: filterFactory, set: setFilterFactory,
            options: [['all','All Factories'], ...factoryOptions.map(f => [f.id, f.name])] },
          { label: 'Status', value: filterStatus, set: setFilterStatus,
            options: [['all','All Statuses'], ['idle','Idle'], ['busy','Busy'], ['maintenance','Maintenance']] },
          { label: 'Type', value: filterType, set: setFilterType,
            options: [['all','All Types'], ...types.map(t => [t, t])] },
        ].map(f => (
          <select
            key={f.label}
            value={f.value}
            onChange={e => f.set(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <span style={{
          marginLeft: 'auto', color: '#8A8688', fontSize: 11,
          fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          [{filtered.length}/{machines.length}] Machines
        </span>
      </div>

      {/* Cards grid */}
      {machines.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 0', color: '#8A8688',
          background: '#18181B', border: '2px dashed #2D2A30',
          fontFamily: 'Space Mono, monospace', fontSize: 12,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          ⟳ Connecting to factory servers...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 0', color: '#8A8688',
          background: '#18181B', border: '2px dashed #2D2A30',
          fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 12,
        }}>
          ⌧ No machines match the current filters.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {filtered.map(m => <MachineCard key={m.id} machine={m} statusColors={STATUS_COLORS} />)}
        </div>
      )}
    </div>
  )
}

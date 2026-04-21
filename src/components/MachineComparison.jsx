import { useState } from 'react'

export default function MachineComparison({ machines }) {
  const [selected, setSelected] = useState([])
  const [showPanel, setShowPanel] = useState(false)

  const toggleMachine = (machine) => {
    setSelected(prev => {
      const exists = prev.find(m => m.id === machine.id)
      if (exists) return prev.filter(m => m.id !== machine.id)
      if (prev.length >= 3) return prev // max 3
      return [...prev, machine]
    })
  }

  const isSelected = (id) => selected.some(m => m.id === id)

  const comparisonFields = [
    { key: 'factory', label: 'Factory' },
    { key: 'type', label: 'Type' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' },
    { key: 'capacity', label: 'Capacity', format: v => `${v}%`, isBar: true },
    { key: 'hourly_rate', label: 'Rate', format: v => `€${v}/hr` },
    { key: 'available_from', label: 'Available From' },
    { key: 'specs', label: 'Specs' },
  ]

  const statusColor = (status) => {
    if (status === 'idle') return '#00e5a0'
    if (status === 'busy') return '#f5a623'
    return '#ff4d4d'
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#e8e8f0', marginBottom: 6 }}>
          Compare Machines
        </h2>
        <p style={{ fontSize: 13, color: '#7a7a8e' }}>
          Select up to 3 machines to compare specs, rates, and capacity side by side.
          {selected.length > 0 && (
            <span style={{ color: '#00e5a0', marginLeft: 8 }}>
              {selected.length}/3 selected
            </span>
          )}
        </p>
      </div>

      {/* Machine selector grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 10, marginBottom: 24,
      }}>
        {machines.map(m => (
          <button
            key={m.id}
            onClick={() => toggleMachine(m)}
            style={{
              background: isSelected(m.id) ? 'rgba(0,229,160,0.08)' : '#111114',
              border: `1px solid ${isSelected(m.id) ? 'rgba(0,229,160,0.4)' : '#2a2a32'}`,
              borderRadius: 10,
              padding: '12px 14px',
              textAlign: 'left',
              cursor: selected.length >= 3 && !isSelected(m.id) ? 'not-allowed' : 'pointer',
              opacity: selected.length >= 3 && !isSelected(m.id) ? 0.4 : 1,
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#e8e8f0' }}>{m.name}</span>
              {isSelected(m.id) && (
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#00e5a0', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#0a0a0b', fontWeight: 700,
                }}>
                  {selected.findIndex(s => s.id === m.id) + 1}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: '#7a7a8e', marginTop: 4 }}>
              {m.type} · {m.factory}
            </div>
          </button>
        ))}
      </div>

      {/* Comparison table */}
      {selected.length >= 2 ? (
        <div style={{ background: '#111114', border: '1px solid #2a2a32', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #2a2a32', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#e8e8f0' }}>Side-by-side comparison</span>
            <button
              onClick={() => setSelected([])}
              style={{ fontSize: 12, color: '#7a7a8e', padding: '4px 12px', border: '1px solid #2a2a32', borderRadius: 6, cursor: 'pointer' }}
            >
              Clear all
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {/* Machine name headers */}
            <thead>
              <tr style={{ borderBottom: '1px solid #1e1e26' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', width: 140, fontSize: 11, color: '#3a3a46', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Metric
                </th>
                {selected.map(m => (
                  <th key={m.id} style={{ padding: '16px 20px', textAlign: 'left' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f0' }}>{m.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: 2,
                        background: m._factory?.color || '#7a7a8e',
                        display: 'inline-block',
                      }} />
                      <span style={{ fontSize: 11, color: '#7a7a8e' }}>{m.factory}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFields.map(field => {
                const values = selected.map(m => m[field.key])
                // Find the "best" value for highlighting
                let bestIdx = -1
                if (field.key === 'capacity') bestIdx = values.indexOf(Math.max(...values))
                if (field.key === 'hourly_rate') bestIdx = values.indexOf(Math.min(...values))

                return (
                  <tr key={field.key} style={{ borderBottom: '1px solid #1e1e26' }}>
                    <td style={{
                      padding: '14px 20px', fontSize: 12, color: '#7a7a8e',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {field.label}
                    </td>
                    {selected.map((m, idx) => {
                      const val = m[field.key]
                      const formatted = field.format ? field.format(val) : val
                      const isBest = idx === bestIdx

                      return (
                        <td key={m.id} style={{ padding: '14px 20px' }}>
                          {field.key === 'status' ? (
                            <span style={{
                              fontSize: 12, fontWeight: 500, color: statusColor(val),
                              background: `${statusColor(val)}12`,
                              padding: '3px 10px', borderRadius: 12,
                            }}>
                              {val}
                            </span>
                          ) : field.isBar ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ flex: 1, height: 6, background: '#1e1e26', borderRadius: 3, overflow: 'hidden', maxWidth: 120 }}>
                                <div style={{
                                  height: '100%', borderRadius: 3,
                                  width: `${val}%`,
                                  background: isBest ? '#00e5a0' : '#7a7a8e',
                                }} />
                              </div>
                              <span style={{
                                fontSize: 13, fontFamily: 'Space Mono, monospace',
                                color: isBest ? '#00e5a0' : '#e8e8f0',
                                fontWeight: isBest ? 700 : 400,
                              }}>
                                {formatted}
                              </span>
                            </div>
                          ) : field.key === 'specs' ? (
                            <span style={{
                              fontSize: 12, color: '#7a7a8e',
                              fontFamily: 'Space Mono, monospace',
                            }}>
                              {val}
                            </span>
                          ) : (
                            <span style={{
                              fontSize: 13,
                              color: isBest ? '#00e5a0' : '#e8e8f0',
                              fontWeight: isBest ? 600 : 400,
                              fontFamily: field.format ? 'Space Mono, monospace' : 'inherit',
                            }}>
                              {formatted}
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : selected.length === 1 ? (
        <div style={{
          textAlign: 'center', padding: '40px 0', color: '#3a3a46',
          background: '#111114', border: '1px solid #2a2a32', borderRadius: 16,
        }}>
          <div style={{ fontSize: 14, marginBottom: 4 }}>Select at least one more machine to compare</div>
          <div style={{ fontSize: 12 }}>You can select up to 3 machines</div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '40px 0', color: '#3a3a46',
          background: '#111114', border: '1px solid #2a2a32', borderRadius: 16,
        }}>
          <div style={{ fontSize: 14, marginBottom: 4 }}>Select 2-3 machines above to compare</div>
          <div style={{ fontSize: 12 }}>Click on machine cards to begin</div>
        </div>
      )}
    </div>
  )
}

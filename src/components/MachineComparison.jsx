import { useState } from 'react'

export default function MachineComparison({ machines }) {
  const [selected, setSelected] = useState([])

  const toggleMachine = (machine) => {
    setSelected(prev => {
      const exists = prev.find(m => m.id === machine.id)
      if (exists) return prev.filter(m => m.id !== machine.id)
      if (prev.length >= 3) return prev
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
    { key: 'hourly_rate', label: 'Rate', format: v => `€${v}/HR` },
    { key: 'available_from', label: 'Available From' },
    { key: 'specs', label: 'Specs' },
  ]

  const statusColor = (status) => {
    if (status === 'idle') return '#4FB39F'
    if (status === 'busy') return '#E83828'
    return '#E8A33B'
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{
          fontSize: 22, fontWeight: 700, color: '#F4F2F0', marginBottom: 8,
          fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          ▣ Compare Machines
        </h2>
        <p style={{ fontSize: 12, color: '#8A8688', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Select up to 3 machines · compare specs, rates, capacity side-by-side.
          {selected.length > 0 && (
            <span style={{ color: '#E83828', marginLeft: 10, fontWeight: 700 }}>
              [{selected.length}/3] selected
            </span>
          )}
        </p>
      </div>

      {/* Machine selector grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 10, marginBottom: 24,
      }}>
        {machines.map(m => {
          const sel = isSelected(m.id)
          const disabled = selected.length >= 3 && !sel
          return (
            <button
              key={m.id}
              onClick={() => toggleMachine(m)}
              style={{
                background: sel ? '#E83828' : '#18181B',
                border: `2px solid ${sel ? '#E83828' : '#2D2A30'}`,
                padding: '12px 14px',
                textAlign: 'left',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.4 : 1,
                transition: 'all 0.1s',
                fontFamily: 'Space Mono, monospace',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: sel ? '#18181B' : '#F4F2F0',
                  textTransform: 'uppercase', letterSpacing: '0.02em',
                }}>
                  {m.name}
                </span>
                {sel && (
                  <span style={{
                    width: 22, height: 22,
                    background: '#18181B',
                    border: '2px solid #18181B',
                    display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#E83828', fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {selected.findIndex(s => s.id === m.id) + 1}
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 10,
                color: sel ? '#18181B' : '#8A8688',
                marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {m.type} · {m.factory}
              </div>
            </button>
          )
        })}
      </div>

      {/* Comparison table */}
      {selected.length >= 2 ? (
        <div style={{ background: '#18181B', border: '2px solid #2D2A30' }}>
          <div style={{
            padding: '16px 24px', borderBottom: '2px solid #2D2A30',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#25252A',
          }}>
            <span style={{
              fontSize: 13, fontWeight: 700, color: '#F4F2F0',
              fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              ▣ Side-By-Side
            </span>
            <button
              onClick={() => setSelected([])}
              style={{
                fontSize: 11, color: '#F4F2F0', padding: '4px 12px',
                border: '2px solid #2D2A30', background: 'transparent', cursor: 'pointer',
                fontFamily: 'Space Mono, monospace', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E83828'; e.currentTarget.style.borderColor = '#E83828' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#2D2A30' }}
            >
              ✕ Clear All
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #2D2A30', background: '#0A0A0C' }}>
                <th style={{
                  padding: '14px 20px', textAlign: 'left', width: 150,
                  fontSize: 10, color: '#8A8688', textTransform: 'uppercase', letterSpacing: '0.1em',
                  fontFamily: 'Space Mono, monospace', fontWeight: 700,
                }}>
                  Metric
                </th>
                {selected.map(m => (
                  <th key={m.id} style={{ padding: '14px 20px', textAlign: 'left' }}>
                    <div style={{
                      fontSize: 14, fontWeight: 700, color: '#F4F2F0',
                      fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.02em',
                    }}>
                      {m.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      <span style={{
                        width: 10, height: 10,
                        background: m._factory?.color || '#8A8688',
                        display: 'inline-block', border: '1px solid #18181B',
                      }} />
                      <span style={{ fontSize: 10, color: '#8A8688', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {m.factory}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFields.map(field => {
                const values = selected.map(m => m[field.key])
                let bestIdx = -1
                if (field.key === 'capacity') bestIdx = values.indexOf(Math.max(...values))
                if (field.key === 'hourly_rate') bestIdx = values.indexOf(Math.min(...values))

                return (
                  <tr key={field.key} style={{ borderBottom: '1px solid #2D2A30' }}>
                    <td style={{
                      padding: '14px 20px', fontSize: 11, color: '#8A8688',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      fontFamily: 'Space Mono, monospace', fontWeight: 700,
                    }}>
                      ▸ {field.label}
                    </td>
                    {selected.map((m, idx) => {
                      const val = m[field.key]
                      const formatted = field.format ? field.format(val) : val
                      const isBest = idx === bestIdx

                      return (
                        <td key={m.id} style={{ padding: '14px 20px' }}>
                          {field.key === 'status' ? (
                            <span style={{
                              fontSize: 11, fontWeight: 700, color: '#18181B',
                              background: statusColor(val),
                              padding: '4px 10px',
                              fontFamily: 'Space Mono, monospace',
                              textTransform: 'uppercase', letterSpacing: '0.08em',
                            }}>
                              ■ {val}
                            </span>
                          ) : field.isBar ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ flex: 1, height: 8, background: '#0A0A0C', border: '1px solid #2D2A30', overflow: 'hidden', maxWidth: 130 }}>
                                <div style={{
                                  height: '100%',
                                  width: `${val}%`,
                                  background: isBest ? '#E83828' : '#4FB39F',
                                }} />
                              </div>
                              <span style={{
                                fontSize: 13, fontFamily: 'Space Mono, monospace',
                                color: isBest ? '#E83828' : '#F4F2F0',
                                fontWeight: 700,
                              }}>
                                {formatted}
                              </span>
                            </div>
                          ) : field.key === 'specs' ? (
                            <span style={{
                              fontSize: 11, color: '#F4F2F0',
                              fontFamily: 'Space Mono, monospace',
                            }}>
                              {val}
                            </span>
                          ) : (
                            <span style={{
                              fontSize: 13,
                              color: isBest ? '#E83828' : '#F4F2F0',
                              fontWeight: isBest ? 700 : 500,
                              fontFamily: 'Space Mono, monospace',
                              textTransform: field.format || field.key === 'factory' || field.key === 'type' ? 'uppercase' : 'none',
                              letterSpacing: '0.02em',
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
          textAlign: 'center', padding: '40px 0', color: '#8A8688',
          background: '#18181B', border: '2px dashed #2D2A30',
          fontFamily: 'Space Mono, monospace',
        }}>
          <div style={{ fontSize: 13, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            ▸ Select At Least One More Machine
          </div>
          <div style={{ fontSize: 11, color: '#5A5658', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            You can select up to 3 machines
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '40px 0', color: '#8A8688',
          background: '#18181B', border: '2px dashed #2D2A30',
          fontFamily: 'Space Mono, monospace',
        }}>
          <div style={{ fontSize: 13, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            ▸ Select 2-3 Machines To Compare
          </div>
          <div style={{ fontSize: 11, color: '#5A5658', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Click on machine cards to begin
          </div>
        </div>
      )}
    </div>
  )
}

export default function CapacityView({ machines, factories }) {
  const byFactory = factories.map(f => {
    const fMachines = machines.filter(m => m._factory?.id === f.id)
    const avg = fMachines.length
      ? Math.round(fMachines.reduce((s, m) => s + m.capacity, 0) / fMachines.length)
      : 0
    const idle = fMachines.filter(m => m.status === 'idle').length
    const busy = fMachines.filter(m => m.status === 'busy').length
    const maint = fMachines.filter(m => m.status === 'maintenance').length
    return { ...f, machines: fMachines, avg, idle, busy, maint }
  })

  const allTypes = [...new Set(machines.map(m => m.type))].sort()

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{
          fontSize: 22, fontWeight: 700, color: '#F4F2F0', marginBottom: 8,
          fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          ▣ Capacity Sharing Overview
        </h2>
        <p style={{ fontSize: 12, color: '#8A8688', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Real-time utilisation · factories with spare capacity offer machine time to B2B partners.
        </p>
      </div>

      {/* Per-factory panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18, marginBottom: 32 }}>
        {byFactory.map(f => (
          <div key={f.id} style={{
            background: '#18181B', border: '2px solid #2D2A30',
            borderTop: `5px solid ${f.color}`,
            padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ width: 14, height: 14, background: f.color, display: 'inline-block', border: '1px solid #18181B' }} />
              <span style={{
                fontSize: 16, fontWeight: 700, color: '#F4F2F0',
                fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {f.name}
              </span>
              <span style={{
                marginLeft: 'auto', fontFamily: 'Space Mono, monospace', fontSize: 11,
                color: '#8A8688', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                [{f.machines.length}] machines
              </span>
            </div>

            {/* Big avg capacity */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 10, color: '#8A8688', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
                fontFamily: 'Space Mono, monospace', fontWeight: 700,
              }}>
                ▓ Avg Capacity Load
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 52, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: f.color, lineHeight: 1 }}>
                  {String(f.avg).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 18, color: '#8A8688', marginBottom: 8, fontFamily: 'Space Mono, monospace' }}>%</span>
              </div>
              <div style={{ height: 12, background: '#0A0A0C', border: '2px solid #2D2A30', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${f.avg}%`,
                  background: f.color, transition: 'width 0.6s ease',
                }} />
              </div>
            </div>

            {/* Status breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { label: 'Idle', val: f.idle, color: '#4FB39F' },
                { label: 'Busy', val: f.busy, color: '#E83828' },
                { label: 'Maint.', val: f.maint, color: '#E8A33B' },
              ].map(item => (
                <div key={item.label} style={{
                  background: '#25252A', border: '2px solid #2D2A30',
                  padding: '12px 10px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: item.color }}>
                    {String(item.val).padStart(2, '0')}
                  </div>
                  <div style={{
                    fontSize: 10, color: '#8A8688', marginTop: 4,
                    fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Per-machine-type breakdown */}
      <div style={{ background: '#18181B', border: '2px solid #2D2A30', padding: 24 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: '#F4F2F0', marginBottom: 20,
          fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          ▣ Capacity By Machine Type
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {allTypes.map(type => {
            const typeMachines = machines.filter(m => m.type === type)
            const avgCap = Math.round(typeMachines.reduce((s, m) => s + m.capacity, 0) / typeMachines.length)
            const idleCount = typeMachines.filter(m => m.status === 'idle').length
            return (
              <div key={type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <span style={{
                      fontSize: 13, color: '#F4F2F0', fontWeight: 700,
                      fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {type}
                    </span>
                    <span style={{
                      fontSize: 10, color: '#8A8688', marginLeft: 10,
                      fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      [{typeMachines.length}] · {idleCount} idle
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontFamily: 'Space Mono, monospace', color: '#F4F2F0', fontWeight: 700 }}>
                    {avgCap}%
                  </span>
                </div>
                <div style={{ height: 8, background: '#0A0A0C', border: '1px solid #2D2A30', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${avgCap}%`,
                    background: avgCap > 80 ? '#E83828' : avgCap > 50 ? '#E8A33B' : '#4FB39F',
                    transition: 'width 0.4s',
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

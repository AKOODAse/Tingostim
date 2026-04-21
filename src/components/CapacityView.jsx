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
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#e8e8f0', marginBottom: 6 }}>Capacity sharing overview</h2>
        <p style={{ fontSize: 13, color: '#7a7a8e' }}>
          Real-time capacity utilisation across all connected factories. Factories with spare capacity can offer machine time to B2B partners.
        </p>
      </div>

      {/* Per-factory panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 32 }}>
        {byFactory.map(f => (
          <div key={f.id} style={{ background: '#111114', border: '1px solid #2a2a32', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: f.color, display: 'inline-block' }} />
              <span style={{ fontSize: 16, fontWeight: 600, color: '#e8e8f0' }}>{f.name}</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#7a7a8e' }}>
                {f.machines.length} machines
              </span>
            </div>

            {/* Big avg capacity */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#7a7a8e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Avg capacity load
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 48, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: f.color, lineHeight: 1 }}>
                  {f.avg}
                </span>
                <span style={{ fontSize: 18, color: '#7a7a8e', marginBottom: 6 }}>%</span>
              </div>
              <div style={{ height: 8, background: '#1e1e26', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4, width: `${f.avg}%`,
                  background: f.color, transition: 'width 0.6s ease',
                }} />
              </div>
            </div>

            {/* Status breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { label: 'Idle', val: f.idle, color: '#00e5a0' },
                { label: 'Busy', val: f.busy, color: '#f5a623' },
                { label: 'Maint.', val: f.maint, color: '#ff4d4d' },
              ].map(item => (
                <div key={item.label} style={{ background: '#0d0d10', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: item.color }}>{item.val}</div>
                  <div style={{ fontSize: 11, color: '#7a7a8e', marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Per-machine-type breakdown */}
      <div style={{ background: '#111114', border: '1px solid #2a2a32', borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#e8e8f0', marginBottom: 20 }}>Capacity by machine type</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {allTypes.map(type => {
            const typeMachines = machines.filter(m => m.type === type)
            const avgCap = Math.round(typeMachines.reduce((s, m) => s + m.capacity, 0) / typeMachines.length)
            const idleCount = typeMachines.filter(m => m.status === 'idle').length
            return (
              <div key={type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 13, color: '#e8e8f0' }}>{type}</span>
                    <span style={{ fontSize: 11, color: '#3a3a46', marginLeft: 10 }}>
                      {typeMachines.length} machine{typeMachines.length !== 1 ? 's' : ''} · {idleCount} idle
                    </span>
                  </div>
                  <span style={{ fontSize: 12, fontFamily: 'Space Mono, monospace', color: '#7a7a8e' }}>{avgCap}%</span>
                </div>
                <div style={{ height: 5, background: '#1e1e26', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3, width: `${avgCap}%`,
                    background: avgCap > 80 ? '#ff4d4d' : avgCap > 50 ? '#f5a623' : '#00e5a0',
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

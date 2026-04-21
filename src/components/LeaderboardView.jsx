export default function LeaderboardView({ leaderboard, machines }) {
  // Enrich leaderboard with computed stats from machines
  const enriched = leaderboard
    .map(entry => {
      const factoryMachines = machines.filter(m => m.factory === entry.factory_name)
      const totalCapacity = factoryMachines.length
        ? Math.round(factoryMachines.reduce((s, m) => s + m.capacity, 0) / factoryMachines.length)
        : 0
      return { ...entry, machine_count: factoryMachines.length, avg_capacity: totalCapacity }
    })
    .sort((a, b) => b.jobs_completed - a.jobs_completed)

  const medals = ['#FFD700', '#C0C0C0', '#CD7F32']
  const rankLabels = ['1st', '2nd', '3rd']

  const metrics = [
    { key: 'jobs_completed', label: 'Jobs Completed', format: v => v.toLocaleString(), max: Math.max(...enriched.map(e => e.jobs_completed)) },
    { key: 'revenue', label: 'Revenue Earned', format: v => `€${(v / 1000).toFixed(1)}K`, max: Math.max(...enriched.map(e => e.revenue)) },
    { key: 'uptime', label: 'Uptime', format: v => `${v}%`, max: 100 },
    { key: 'rating', label: 'Rating', format: v => `${v}/5.0`, max: 5 },
  ]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#e8e8f0', marginBottom: 6 }}>
          Factory Leaderboard
        </h2>
        <p style={{ fontSize: 13, color: '#7a7a8e' }}>
          Tracking competition and success across Ostim factories. Rankings based on jobs, revenue, uptime, and ratings.
        </p>
      </div>

      {/* Podium cards */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${enriched.length}, 1fr)`, gap: 20, marginBottom: 32 }}>
        {enriched.map((entry, i) => (
          <div key={entry.id} style={{
            background: '#111114',
            border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.3)' : '#2a2a32'}`,
            borderRadius: 18,
            padding: 28,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Top accent */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: medals[i] || '#7a7a8e',
            }} />

            {/* Rank badge */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: `${medals[i] || '#7a7a8e'}18`,
              border: `2px solid ${medals[i] || '#7a7a8e'}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <span style={{
                fontSize: 20, fontWeight: 700, fontFamily: 'Space Mono, monospace',
                color: medals[i] || '#7a7a8e',
              }}>
                {rankLabels[i] || `${i + 1}th`}
              </span>
            </div>

            <div style={{ fontSize: 20, fontWeight: 700, color: '#e8e8f0', marginBottom: 4 }}>
              {entry.factory_name}
            </div>
            <div style={{ fontSize: 12, color: '#7a7a8e', marginBottom: 4 }}>
              {entry.specialty}
            </div>
            <div style={{
              fontSize: 11, color: '#00e5a0', marginBottom: 20,
              background: 'rgba(0,229,160,0.08)', display: 'inline-block',
              padding: '3px 10px', borderRadius: 12,
            }}>
              {entry.streak} day streak
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Jobs', value: entry.jobs_completed, color: '#e8e8f0' },
                { label: 'Revenue', value: `€${(entry.revenue / 1000).toFixed(1)}K`, color: '#00e5a0' },
                { label: 'Uptime', value: `${entry.uptime}%`, color: entry.uptime > 95 ? '#00e5a0' : '#f5a623' },
                { label: 'Rating', value: `${entry.rating}/5`, color: '#FFD700' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: '#0d0d10', borderRadius: 10, padding: '12px 10px',
                }}>
                  <div style={{ fontSize: 10, color: '#3a3a46', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
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
      <div style={{ background: '#111114', border: '1px solid #2a2a32', borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#e8e8f0', marginBottom: 24 }}>
          Head-to-head comparison
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {metrics.map(metric => (
            <div key={metric.key}>
              <div style={{ fontSize: 12, color: '#7a7a8e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                {metric.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {enriched.map((entry, i) => {
                  const value = entry[metric.key]
                  const pct = (value / metric.max) * 100
                  return (
                    <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        width: 80, fontSize: 12, color: '#7a7a8e', flexShrink: 0,
                      }}>
                        {entry.factory_name}
                      </span>
                      <div style={{ flex: 1, height: 8, background: '#1e1e26', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 4,
                          width: `${pct}%`,
                          background: i === 0 ? '#00e5a0' : '#4d9fff',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                      <span style={{
                        fontSize: 13, fontFamily: 'Space Mono, monospace', fontWeight: 600,
                        color: '#e8e8f0', minWidth: 60, textAlign: 'right',
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
    </div>
  )
}

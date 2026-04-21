export default function TrendingView({ trending }) {
  const sorted = [...trending].sort((a, b) => b.demand_score - a.demand_score)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#e8e8f0', marginBottom: 6 }}>
          Trending in Ostim
        </h2>
        <p style={{ fontSize: 13, color: '#7a7a8e' }}>
          What factories across Ostim are working on right now. Categories ranked by demand score.
        </p>
      </div>

      {/* Top 3 highlight cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {sorted.slice(0, 3).map((item, i) => {
          const medals = ['#FFD700', '#C0C0C0', '#CD7F32']
          const labels = ['Hottest', '2nd', '3rd']
          return (
            <div key={item.id} style={{
              background: '#111114',
              border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.3)' : '#2a2a32'}`,
              borderRadius: 16,
              padding: 24,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Glow for #1 */}
              {i === 0 && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: 'linear-gradient(90deg, #FFD700, #ff8c00)',
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px',
                  borderRadius: 20, color: '#0a0a0b',
                  background: medals[i],
                }}>
                  {labels[i]}
                </span>
                <span style={{
                  fontSize: 11, color: item.change >= 0 ? '#00e5a0' : '#ff4d4d',
                  fontFamily: 'Space Mono, monospace',
                }}>
                  {item.change >= 0 ? '+' : ''}{item.change}%
                </span>
              </div>

              <div style={{ fontSize: 17, fontWeight: 600, color: '#e8e8f0', marginBottom: 6 }}>
                {item.category}
              </div>
              <div style={{ fontSize: 12, color: '#7a7a8e', marginBottom: 16, lineHeight: 1.5 }}>
                {item.description}
              </div>

              {/* Demand bar */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#7a7a8e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Demand score
                  </span>
                  <span style={{ fontSize: 14, fontFamily: 'Space Mono, monospace', fontWeight: 700, color: medals[i] }}>
                    {item.demand_score}
                  </span>
                </div>
                <div style={{ height: 6, background: '#1e1e26', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${item.demand_score}%`,
                    background: `linear-gradient(90deg, ${medals[i]}, ${i === 0 ? '#ff8c00' : medals[i]}88)`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#7a7a8e' }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', color: '#e8e8f0' }}>{item.total_requests}</span> requests
                </span>
                <span style={{ fontSize: 11, color: '#3a3a46' }}>
                  Top: {item.top_product}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Full ranking table */}
      <div style={{ background: '#111114', border: '1px solid #2a2a32', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #2a2a32' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#e8e8f0' }}>All trending categories</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e1e26' }}>
              {['#', 'Category', 'Top Product', 'Requests', 'Change', 'Demand'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: 11, color: '#3a3a46', textTransform: 'uppercase',
                  letterSpacing: '0.06em', fontWeight: 500,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, i) => (
              <tr key={item.id} style={{
                borderBottom: '1px solid #1e1e26',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              }}>
                <td style={{ padding: '14px 16px', fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#7a7a8e', width: 40 }}>
                  {i + 1}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#e8e8f0' }}>{item.category}</div>
                  <div style={{ fontSize: 11, color: '#3a3a46', marginTop: 2 }}>{item.description}</div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#7a7a8e' }}>
                  {item.top_product}
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#e8e8f0' }}>
                  {item.total_requests}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: 12, fontFamily: 'Space Mono, monospace', fontWeight: 600,
                    color: item.change >= 0 ? '#00e5a0' : '#ff4d4d',
                    background: item.change >= 0 ? 'rgba(0,229,160,0.08)' : 'rgba(255,77,77,0.08)',
                    padding: '3px 8px', borderRadius: 12,
                  }}>
                    {item.change >= 0 ? '+' : ''}{item.change}%
                  </span>
                </td>
                <td style={{ padding: '14px 16px', width: 140 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: '#1e1e26', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        width: `${item.demand_score}%`,
                        background: item.demand_score > 80 ? '#00e5a0' : item.demand_score > 60 ? '#f5a623' : '#7a7a8e',
                      }} />
                    </div>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#e8e8f0', minWidth: 24 }}>
                      {item.demand_score}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

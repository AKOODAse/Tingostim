export default function TrendingView({ trending }) {
  const sorted = [...trending].sort((a, b) => b.demand_score - a.demand_score)

  // Brutalism medals: orange = #1, tan = #2, sage = #3
  const medals = ['#E83828', '#E8A33B', '#4FB39F']
  const labels = ['1st', '2nd', '3rd']

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{
          fontSize: 22, fontWeight: 700, color: '#F4F2F0', marginBottom: 8,
          fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          ▲ Trending In Ostim
        </h2>
        <p style={{ fontSize: 12, color: '#8A8688', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          What Ostim factories are working on right now · ranked by demand score.
        </p>
      </div>

      {/* Top 3 highlight cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {sorted.slice(0, 3).map((item, i) => (
          <div key={item.id} style={{
            background: '#18181B',
            border: '2px solid #2D2A30',
            borderTop: `6px solid ${medals[i]}`,
            padding: 24,
            position: 'relative',
            boxShadow: i === 0 ? '6px 6px 0 #E83828' : '4px 4px 0 #18181B',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 12px',
                color: '#18181B',
                background: medals[i],
                fontFamily: 'Space Mono, monospace',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                ▲ {labels[i]}
              </span>
              <span style={{
                fontSize: 11, color: item.change >= 0 ? '#4FB39F' : '#E83828',
                fontFamily: 'Space Mono, monospace', fontWeight: 700,
              }}>
                {item.change >= 0 ? '▲ +' : '▼ '}{item.change}%
              </span>
            </div>

            <div style={{
              fontSize: 17, fontWeight: 700, color: '#F4F2F0', marginBottom: 8,
              fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.02em',
            }}>
              {item.category}
            </div>
            <div style={{ fontSize: 11, color: '#8A8688', marginBottom: 16, lineHeight: 1.6, fontFamily: 'Space Mono, monospace' }}>
              {item.description}
            </div>

            {/* Demand bar */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{
                  fontSize: 10, color: '#8A8688', textTransform: 'uppercase', letterSpacing: '0.1em',
                  fontFamily: 'Space Mono, monospace', fontWeight: 700,
                }}>
                  ▓ Demand Score
                </span>
                <span style={{ fontSize: 14, fontFamily: 'Space Mono, monospace', fontWeight: 700, color: medals[i] }}>
                  {item.demand_score}
                </span>
              </div>
              <div style={{ height: 10, background: '#0A0A0C', border: '2px solid #2D2A30', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${item.demand_score}%`,
                  background: medals[i],
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: 10, borderTop: '1px dashed #2D2A30',
            }}>
              <span style={{ fontSize: 11, color: '#8A8688', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <span style={{ color: '#F4F2F0', fontWeight: 700 }}>{item.total_requests}</span> req
              </span>
              <span style={{ fontSize: 10, color: '#5A5658', fontFamily: 'Space Mono, monospace', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ▸ {item.top_product}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Full ranking table */}
      <div style={{ background: '#18181B', border: '2px solid #2D2A30' }}>
        <div style={{ padding: '16px 24px', borderBottom: '2px solid #2D2A30', background: '#25252A' }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#F4F2F0',
            fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            ▣ All Trending Categories
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #2D2A30', background: '#0A0A0C' }}>
              {['#', 'Category', 'Top Product', 'Req', 'Change', 'Demand'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: 10, color: '#8A8688', textTransform: 'uppercase',
                  letterSpacing: '0.1em', fontWeight: 700,
                  fontFamily: 'Space Mono, monospace',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, i) => (
              <tr key={item.id} style={{
                borderBottom: '1px solid #2D2A30',
                background: i % 2 === 0 ? 'transparent' : 'rgba(229,209,184,0.02)',
              }}>
                <td style={{
                  padding: '14px 16px', fontFamily: 'Space Mono, monospace', fontSize: 13,
                  color: i < 3 ? medals[i] : '#8A8688', fontWeight: 700, width: 50,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: '#F4F2F0',
                    fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.02em',
                  }}>
                    {item.category}
                  </div>
                  <div style={{ fontSize: 10, color: '#5A5658', marginTop: 3, fontFamily: 'Space Mono, monospace' }}>
                    {item.description}
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: '#8A8688', fontFamily: 'Space Mono, monospace' }}>
                  {item.top_product}
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#F4F2F0', fontWeight: 700 }}>
                  {item.total_requests}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: 11, fontFamily: 'Space Mono, monospace', fontWeight: 700,
                    color: '#18181B',
                    background: item.change >= 0 ? '#4FB39F' : '#E83828',
                    padding: '3px 10px',
                  }}>
                    {item.change >= 0 ? '+' : ''}{item.change}%
                  </span>
                </td>
                <td style={{ padding: '14px 16px', width: 160 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: '#0A0A0C', border: '1px solid #2D2A30', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${item.demand_score}%`,
                        background: item.demand_score > 80 ? '#E83828' : item.demand_score > 60 ? '#E8A33B' : '#4FB39F',
                      }} />
                    </div>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#F4F2F0', minWidth: 24, fontWeight: 700 }}>
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

import { useState, useEffect } from 'react'

const FACTORY_BIOS = {
  'Factory A': {
    bio: 'Specializing in precision CNC machining and advanced prototyping, Factory A has been a cornerstone of Ostim\'s manufacturing ecosystem since 2018.',
    founded: 2018,
    employees: 45,
    highlight: 'Top-rated for CNC precision',
  },
  'Factory B': {
    bio: 'A leader in cutting-edge waterjet and surface finishing technologies, Factory B serves automotive, construction, and furniture industries across Turkey.',
    founded: 2020,
    employees: 32,
    highlight: 'Fastest-growing in Ostim',
  },
}

export default function FactorySpotlight({ machines, factories }) {
  const [featuredIdx, setFeaturedIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedIdx(i => (i + 1) % factories.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [factories.length])

  const factory = factories[featuredIdx]
  if (!factory) return null

  const bio = FACTORY_BIOS[factory.name] || {}
  const fMachines = machines.filter(m => m._factory?.id === factory.id)
  const idle = fMachines.filter(m => m.status === 'idle').length
  const avgCap = fMachines.length
    ? Math.round(fMachines.reduce((s, m) => s + m.capacity, 0) / fMachines.length)
    : 0
  const totalRate = fMachines.reduce((s, m) => s + m.hourly_rate, 0)

  return (
    <div style={{
      background: '#18181B',
      border: '2px solid #2D2A30',
      borderLeft: `8px solid ${factory.color}`,
      padding: 24,
      marginBottom: 24,
      position: 'relative',
      boxShadow: `6px 6px 0 ${factory.color}30`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
        {/* Left: info */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '4px 12px',
              background: factory.color, color: '#18181B',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              fontFamily: 'Space Mono, monospace',
            }}>
              ◆ Factory Spotlight
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {factories.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => setFeaturedIdx(i)}
                  style={{
                    width: 14, height: 14,
                    background: i === featuredIdx ? factory.color : '#0A0A0C',
                    border: `2px solid ${i === featuredIdx ? factory.color : '#2D2A30'}`,
                    cursor: 'pointer', padding: 0,
                    transition: 'background 0.2s',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{
            fontSize: 24, fontWeight: 700, color: '#F4F2F0', marginBottom: 6,
            fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            {factory.name}
          </div>
          {bio.highlight && (
            <div style={{
              fontSize: 12, color: factory.color, marginBottom: 12,
              fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700,
            }}>
              ▸ {bio.highlight}
            </div>
          )}
          <div style={{ fontSize: 13, color: '#8A8688', lineHeight: 1.6, maxWidth: 500 }}>
            {bio.bio || 'A manufacturing facility in Ostim Industrial Zone.'}
          </div>
        </div>

        {/* Right: quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, flexShrink: 0 }}>
          {[
            { label: 'Machines', value: fMachines.length, color: '#F4F2F0' },
            { label: 'Idle', value: idle, color: '#4FB39F' },
            { label: 'Avg Load', value: `${avgCap}%`, color: avgCap > 80 ? '#E83828' : avgCap > 50 ? '#E8A33B' : '#4FB39F' },
            { label: 'Total Rate', value: `€${totalRate}/HR`, color: factory.color },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#0A0A0C', border: '2px solid #2D2A30',
              padding: '12px 14px',
              minWidth: 110, textAlign: 'center',
            }}>
              <div style={{
                fontSize: 9, color: '#8A8688', textTransform: 'uppercase', letterSpacing: '0.1em',
                marginBottom: 4, fontFamily: 'Space Mono, monospace', fontWeight: 700,
              }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

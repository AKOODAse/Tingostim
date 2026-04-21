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

  // Rotate spotlight every 10s
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
      background: `linear-gradient(135deg, ${factory.color}08, ${factory.color}15)`,
      border: `1px solid ${factory.color}30`,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${factory.color}, transparent)`,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
        {/* Left: info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 12,
              background: `${factory.color}20`, color: factory.color,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Factory Spotlight
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {factories.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => setFeaturedIdx(i)}
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: i === featuredIdx ? factory.color : '#2a2a32',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'background 0.2s',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ fontSize: 18, fontWeight: 700, color: '#e8e8f0', marginBottom: 4 }}>
            {factory.name}
          </div>
          {bio.highlight && (
            <div style={{ fontSize: 12, color: factory.color, marginBottom: 10 }}>
              {bio.highlight}
            </div>
          )}
          <div style={{ fontSize: 13, color: '#7a7a8e', lineHeight: 1.6, maxWidth: 500 }}>
            {bio.bio || 'A manufacturing facility in Ostim Industrial Zone.'}
          </div>
        </div>

        {/* Right: quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, flexShrink: 0 }}>
          {[
            { label: 'Machines', value: fMachines.length, color: '#e8e8f0' },
            { label: 'Idle', value: idle, color: '#00e5a0' },
            { label: 'Avg load', value: `${avgCap}%`, color: avgCap > 80 ? '#ff4d4d' : avgCap > 50 ? '#f5a623' : '#00e5a0' },
            { label: 'Total rate', value: `€${totalRate}/hr`, color: factory.color },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#0a0a0b', borderRadius: 10, padding: '10px 14px',
              minWidth: 100, textAlign: 'center',
            }}>
              <div style={{ fontSize: 10, color: '#3a3a46', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
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

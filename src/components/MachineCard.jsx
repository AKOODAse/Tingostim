import { useState } from 'react'

export default function MachineCard({ machine: m, statusColors }) {
  const [hovered, setHovered] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const s = statusColors[m.status] || statusColors.idle

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? '#151518' : '#111114',
          border: `1px solid ${hovered ? s.border : '#2a2a32'}`,
          borderRadius: 14,
          padding: '20px 22px',
          cursor: 'pointer',
          transition: 'all 0.18s',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={() => setShowModal(true)}
      >
        {/* accent top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: s.dot, opacity: 0.6,
        }} />

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f0', marginBottom: 3 }}>{m.name}</div>
            <div style={{ fontSize: 12, color: '#7a7a8e' }}>{m.type}</div>
          </div>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 500, color: s.dot,
            flexShrink: 0,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
            {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
          </span>
        </div>

        {/* Factory badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <span style={{
            width: 8, height: 8, borderRadius: 2,
            background: m._factory?.color || '#7a7a8e',
            display: 'inline-block', flexShrink: 0,
          }} />
          <span style={{ fontSize: 12, color: '#7a7a8e' }}>{m.factory}</span>
          <span style={{ fontSize: 11, color: '#3a3a46', marginLeft: 4 }}>· {m.location}</span>
        </div>

        {/* Capacity bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#7a7a8e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Capacity load</span>
            <span style={{ fontSize: 12, fontFamily: 'Space Mono, monospace', color: '#e8e8f0' }}>{m.capacity}%</span>
          </div>
          <div style={{ height: 4, background: '#1e1e26', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${m.capacity}%`,
              background: m.capacity > 80 ? '#ff4d4d' : m.capacity > 50 ? '#f5a623' : '#00e5a0',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#7a7a8e' }}>
            From <span style={{ color: '#e8e8f0' }}>{m.available_from}</span>
          </span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#00e5a0', fontWeight: 700 }}>
            €{m.hourly_rate}/hr
          </span>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#111114', border: '1px solid #2a2a32',
              borderRadius: 18, padding: 32, maxWidth: 480, width: '100%',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#e8e8f0' }}>{m.name}</div>
                <div style={{ fontSize: 13, color: '#7a7a8e' }}>{m.factory} · {m.location}</div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ color: '#7a7a8e', fontSize: 20, cursor: 'pointer', padding: '0 8px' }}>×</button>
            </div>
            <div style={{ background: '#0d0d10', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#7a7a8e', fontFamily: 'Space Mono, monospace' }}>
              {m.specs}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                ['Status', <span style={{ color: s.dot }}>{m.status}</span>],
                ['Capacity', `${m.capacity}%`],
                ['Rate', `€${m.hourly_rate}/hr`],
                ['Available', m.available_from],
              ].map(([k, v]) => (
                <div key={k} style={{ background: '#0d0d10', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: '#3a3a46', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#e8e8f0' }}>{v}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setShowModal(false); alert(`Rental request sent for ${m.name}!\n\nIn a full system, this would create a booking in Tingostim.`) }}
              style={{
                width: '100%', padding: '12px 0',
                background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)',
                borderRadius: 10, color: '#00e5a0', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Request rental
            </button>
          </div>
        </div>
      )}
    </>
  )
}

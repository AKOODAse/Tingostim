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
          background: hovered ? '#25252A' : '#18181B',
          border: '2px solid #2D2A30',
          borderTop: `4px solid ${s.dot}`,
          padding: '18px 20px',
          cursor: 'pointer',
          transition: 'background 0.1s, transform 0.1s, box-shadow 0.1s',
          position: 'relative',
          transform: hovered ? 'translate(-3px, -3px)' : 'translate(0, 0)',
          boxShadow: hovered ? `6px 6px 0 ${s.dot}` : '4px 4px 0 #18181B',
        }}
        onClick={() => setShowModal(true)}
      >
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#F4F2F0', marginBottom: 4, fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              {m.name}
            </div>
            <div style={{ fontSize: 11, color: '#8A8688', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {m.type}
            </div>
          </div>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: s.dot,
            padding: '3px 10px', fontSize: 10, fontWeight: 700, color: '#18181B',
            flexShrink: 0,
            fontFamily: 'Space Mono, monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            ■ {m.status}
          </span>
        </div>

        {/* Factory badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{
            width: 12, height: 12,
            background: m._factory?.color || '#8A8688',
            display: 'inline-block', flexShrink: 0,
            border: '1px solid #18181B',
          }} />
          <span style={{ fontSize: 11, color: '#F4F2F0', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {m.factory}
          </span>
          <span style={{ fontSize: 10, color: '#5A5658', marginLeft: 4, fontFamily: 'Space Mono, monospace' }}>· {m.location}</span>
        </div>

        {/* Capacity bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: '#8A8688', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ▓ Capacity Load
            </span>
            <span style={{ fontSize: 12, fontFamily: 'Space Mono, monospace', color: '#F4F2F0', fontWeight: 700 }}>
              {m.capacity}%
            </span>
          </div>
          <div style={{ height: 8, background: '#18181B', border: '1px solid #2D2A30', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${m.capacity}%`,
              background: m.capacity > 80 ? '#E83828' : m.capacity > 50 ? '#E8A33B' : '#4FB39F',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 12, borderTop: '1px dashed #2D2A30',
        }}>
          <span style={{ fontSize: 11, color: '#8A8688', fontFamily: 'Space Mono, monospace' }}>
            From <span style={{ color: '#F4F2F0', fontWeight: 700 }}>{m.available_from}</span>
          </span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, color: '#E83828', fontWeight: 700 }}>
            €{m.hourly_rate}/HR
          </span>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(31,24,32,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#18181B',
              border: '3px solid #E83828',
              padding: 28, maxWidth: 520, width: '100%',
              boxShadow: '8px 8px 0 #0A0A0C',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#F4F2F0', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase' }}>
                  {m.name}
                </div>
                <div style={{ fontSize: 12, color: '#8A8688', fontFamily: 'Space Mono, monospace', marginTop: 4 }}>
                  {m.factory} · {m.location}
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  color: '#F4F2F0', fontSize: 20, cursor: 'pointer',
                  background: '#2D2A30', border: 'none',
                  width: 32, height: 32, lineHeight: 1,
                  fontFamily: 'Space Mono, monospace', fontWeight: 700,
                }}
              >×</button>
            </div>
            <div style={{
              background: '#25252A', border: '2px solid #2D2A30',
              padding: '12px 16px', marginBottom: 20,
              fontSize: 12, color: '#F4F2F0', fontFamily: 'Space Mono, monospace',
            }}>
              ▸ {m.specs}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {[
                ['Status', <span style={{ color: s.dot, textTransform: 'uppercase', fontWeight: 700 }}>{m.status}</span>],
                ['Capacity', `${m.capacity}%`],
                ['Rate', `€${m.hourly_rate}/HR`],
                ['Available', m.available_from],
              ].map(([k, v]) => (
                <div key={k} style={{ background: '#25252A', border: '2px solid #2D2A30', padding: '10px 14px' }}>
                  <div style={{ fontSize: 9, color: '#8A8688', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontFamily: 'Space Mono, monospace' }}>
                    {k}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#F4F2F0', fontFamily: 'Space Mono, monospace' }}>{v}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setShowModal(false); alert(`RENTAL REQUEST SENT for ${m.name}\n\nIn production, this would create a booking in MNtory.`) }}
              style={{
                width: '100%', padding: '14px 0',
                background: '#E83828', border: 'none',
                color: '#18181B', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Space Mono, monospace',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E8A33B' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#E83828' }}
            >
              ▶ Request Rental
            </button>
          </div>
        </div>
      )}
    </>
  )
}

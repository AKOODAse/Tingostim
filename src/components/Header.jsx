const views = [
  { id: 'dashboard',   label: 'Dashboard'   },
  { id: 'trending',    label: 'Trending'    },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'capacity',    label: 'Capacity'    },
  { id: 'rental',      label: 'Rentals'     },
  { id: 'compare',     label: 'Compare'     },
]

export default function Header({ view, setView }) {
  return (
    <header style={{
      background: '#000000',
      borderBottom: '3px solid #E83828',
      padding: '0 24px 0 0',
      display: 'flex',
      alignItems: 'stretch',
      gap: 0,
      height: 84,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo block — uses the real MNtory image */}
      <div
        onClick={() => setView('dashboard')}
        style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          paddingRight: 20,
          borderRight: '2px solid #2D2A30',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* The image is square with built-in padding around the wordmark.
            We oversize it then clip with overflow:hidden so the actual logo
            artwork fills the visible area at a usable size. */}
        <div style={{
          width: 240,
          height: 84,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <img
            src="/1.png"
            alt="MNtory — Innovate. Grow. Connect."
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              height: 220,
              width: 'auto',
              display: 'block',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* Connected nav blocks */}
      <nav style={{
        display: 'flex',
        marginLeft: 20,
        border: '2px solid #2D2A30',
        alignSelf: 'center',
        height: 46,
      }}>
        {views.map((v, i) => {
          const active = view === v.id
          return (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              style={{
                padding: '0 18px',
                fontFamily: 'Space Mono, monospace',
                fontSize: 11,
                fontWeight: 700,
                color: active ? '#0A0A0C' : '#8A8688',
                background: active ? '#E83828' : 'transparent',
                borderLeft: i === 0 ? 'none' : '2px solid #2D2A30',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                transition: 'background 0.1s, color 0.1s',
                height: '100%',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#18181B'; e.currentTarget.style.color = '#F4F2F0' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8A8688' } }}
            >
              {v.label}
            </button>
          )
        })}
      </nav>

      {/* Tagline block */}
      <div style={{
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        paddingLeft: 24,
        borderLeft: '2px solid #2D2A30',
      }}>
        <span style={{
          width: 10,
          height: 10,
          background: '#E83828',
          display: 'inline-block',
        }} />
        <span style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: 13,
          color: '#F4F2F0',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}>
          One Big Factory
        </span>
      </div>
    </header>
  )
}

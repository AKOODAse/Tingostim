const views = [
  { id: 'dashboard', label: 'Machine Dashboard' },
  { id: 'capacity',  label: 'Capacity Sharing'  },
  { id: 'rental',    label: 'Idle Rentals'       },
]

export default function Header({ view, setView }) {
  return (
    <header style={{
      background: '#0d0d10',
      borderBottom: '1px solid #2a2a32',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 40,
      height: 60,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="2" y="14" width="10" height="12" rx="2" fill="#00e5a0" opacity="0.9"/>
          <rect x="16" y="8" width="10" height="18" rx="2" fill="#00e5a0" opacity="0.5"/>
          <rect x="9" y="2" width="10" height="24" rx="2" fill="#00e5a0" opacity="0.7"/>
        </svg>
        <span style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: 16,
          fontWeight: 700,
          color: '#e8e8f0',
          letterSpacing: '-0.5px',
        }}>
          Factory<span style={{ color: '#00e5a0' }}>Link</span>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', gap: 4 }}>
        {views.map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: view === v.id ? '#00e5a0' : '#7a7a8e',
              background: view === v.id ? 'rgba(0,229,160,0.08)' : 'transparent',
              border: view === v.id ? '1px solid rgba(0,229,160,0.2)' : '1px solid transparent',
              transition: 'all 0.15s',
              cursor: 'pointer',
            }}
          >
            {v.label}
          </button>
        ))}
      </nav>

      {/* Tag */}
      <div style={{ marginLeft: 'auto' }}>
        <span style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: 10,
          color: '#3a3a46',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          B2B Industrial Platform
        </span>
      </div>
    </header>
  )
}

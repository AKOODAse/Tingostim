export default function StatusBar({ factories, syncStatus, lastSync, onRefresh }) {
  const fmt = d => d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'

  return (
    <div style={{
      background: '#0d0d10',
      borderBottom: '1px solid #1e1e26',
      padding: '6px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      fontSize: 12,
    }}>
      <span style={{ color: '#3a3a46', fontFamily: 'Space Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Live servers
      </span>

      {factories.map(f => {
        const s = syncStatus[f.id]
        const dot = s === 'ok' ? '#00e5a0' : s === 'error' ? '#ff4d4d' : '#f5a623'
        const label = s === 'ok' ? 'online' : s === 'error' ? 'offline' : 'syncing'
        return (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: dot,
              boxShadow: s === 'ok' ? `0 0 6px ${dot}` : 'none',
              display: 'inline-block',
              animation: s === 'loading' ? 'pulse 1s ease-in-out infinite' : 'none',
            }}/>
            <span style={{ color: '#7a7a8e' }}>{f.name}</span>
            <span style={{ color: dot, fontFamily: 'Space Mono, monospace', fontSize: 10 }}>{label}</span>
          </div>
        )
      })}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        {lastSync && (
          <span style={{ color: '#3a3a46', fontFamily: 'Space Mono, monospace', fontSize: 10 }}>
            last sync {fmt(lastSync)}
          </span>
        )}
        <button
          onClick={onRefresh}
          style={{
            fontSize: 11,
            color: '#7a7a8e',
            padding: '3px 10px',
            border: '1px solid #2a2a32',
            borderRadius: 6,
            background: 'transparent',
            cursor: 'pointer',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.target.style.color = '#00e5a0'; e.target.style.borderColor = 'rgba(0,229,160,0.3)' }}
          onMouseLeave={e => { e.target.style.color = '#7a7a8e'; e.target.style.borderColor = '#2a2a32' }}
        >
          ↻ refresh
        </button>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  )
}

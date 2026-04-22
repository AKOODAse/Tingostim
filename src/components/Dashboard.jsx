import FactorySpotlight from './FactorySpotlight.jsx'

export default function Dashboard({ machines, factories, setView }) {
  const counts = {
    idle:        machines.filter(m => m.status === 'idle').length,
    busy:        machines.filter(m => m.status === 'busy').length,
    maintenance: machines.filter(m => m.status === 'maintenance').length,
  }

  const stepCardStyle = {
    background: '#18181B',
    border: '2px solid #2D2A30',
    padding: '20px 22px',
    position: 'relative',
  }

  const navButtonStyle = (color) => ({
    flex: 1,
    minWidth: 200,
    background: '#18181B',
    border: '2px solid #2D2A30',
    borderLeft: `5px solid ${color}`,
    padding: '20px 22px',
    color: '#F4F2F0',
    cursor: 'pointer',
    fontFamily: 'Space Mono, monospace',
    textAlign: 'left',
    transition: 'all 0.1s',
    textTransform: 'none',
    letterSpacing: 'normal',
  })

  return (
    <div>
      {/* HERO */}
      <div style={{
        background: '#18181B',
        border: '2px solid #2D2A30',
        borderTop: '8px solid #E83828',
        padding: '36px 32px',
        marginBottom: 24,
        position: 'relative',
        boxShadow: '8px 8px 0 #25252A',
      }}>
        <div style={{
          fontSize: 11, color: '#E83828',
          fontFamily: 'Space Mono, monospace',
          textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700,
          marginBottom: 12,
        }}>
          ◆ Welcome to MNtory
        </div>
        <h1 style={{
          fontSize: 38, fontWeight: 700, color: '#F4F2F0',
          fontFamily: 'Space Mono, monospace',
          textTransform: 'uppercase', letterSpacing: '-0.01em',
          lineHeight: 1.05, marginBottom: 14,
        }}>
          One <span style={{ color: '#E83828' }}>Big</span> Factory<br/>
          <span style={{ color: '#8A8688', fontSize: 24 }}>for all of Ostim.</span>
        </h1>
        <p style={{
          fontSize: 14, color: '#F4F2F0', lineHeight: 1.7,
          maxWidth: 720, marginBottom: 8,
        }}>
          MNtory connects every machine across Ostim's industrial zone into a single,
          shareable network. Browse live capacity from independent factories,
          compare machines side-by-side, reserve idle time slots, and track who's
          producing what — all in real time.
        </p>
        <div style={{
          fontSize: 11, color: '#8A8688',
          fontFamily: 'Space Mono, monospace',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 16,
          display: 'flex', gap: 20, flexWrap: 'wrap',
        }}>
          <span>▸ Innovate</span>
          <span style={{ color: '#2D2A30' }}>│</span>
          <span>▸ Grow</span>
          <span style={{ color: '#2D2A30' }}>│</span>
          <span>▸ Connect</span>
        </div>
      </div>

      {/* AT-A-GLANCE STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Machines', value: machines.length, color: '#F4F2F0' },
          { label: 'Available Now',  value: counts.idle,     color: '#4FB39F' },
          { label: 'Currently Busy', value: counts.busy,     color: '#E83828' },
          { label: 'Connected Factories', value: factories.length, color: '#E8A33B' },
        ].map(s => (
          <div key={s.label} style={{ ...stepCardStyle, borderTop: `5px solid ${s.color}` }}>
            <div style={{
              fontSize: 10, color: '#8A8688', marginBottom: 10,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              fontFamily: 'Space Mono, monospace', fontWeight: 700,
            }}>
              ▣ {s.label}
            </div>
            <div style={{
              fontSize: 40, fontWeight: 700, color: s.color,
              fontFamily: 'Space Mono, monospace', lineHeight: 1,
            }}>
              {String(s.value).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontSize: 13, color: '#E83828',
          fontFamily: 'Space Mono, monospace',
          textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700,
          marginBottom: 16,
        }}>
          ▶ How It Works
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { n: '01', title: 'Browse',  desc: 'See every machine across Ostim factories with live status — idle, busy, or in maintenance.', color: '#E83828' },
            { n: '02', title: 'Compare', desc: 'Stack up to 3 machines side-by-side: rate, capacity, location, specs.',                       color: '#E8A33B' },
            { n: '03', title: 'Reserve', desc: 'Request capacity on any idle machine in a few clicks. Operators get notified instantly.',     color: '#4FB39F' },
            { n: '04', title: 'Track',   desc: 'Watch demand trends and the factory leaderboard to spot opportunities and stay competitive.', color: '#F4F2F0' },
          ].map(step => (
            <div key={step.n} style={{
              background: '#18181B',
              border: '2px solid #2D2A30',
              padding: '20px 20px 22px',
              position: 'relative',
            }}>
              <div style={{
                fontSize: 36, fontWeight: 700, color: step.color,
                fontFamily: 'Space Mono, monospace', lineHeight: 1, marginBottom: 12,
              }}>
                {step.n}
              </div>
              <div style={{
                fontSize: 14, fontWeight: 700, color: '#F4F2F0', marginBottom: 8,
                fontFamily: 'Space Mono, monospace',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {step.title}
              </div>
              <div style={{ fontSize: 12, color: '#8A8688', lineHeight: 1.6 }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FACTORY SPOTLIGHT */}
      <FactorySpotlight machines={machines} factories={factories} />

      {/* QUICK ACTIONS */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontSize: 13, color: '#E83828',
          fontFamily: 'Space Mono, monospace',
          textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700,
          marginBottom: 16,
        }}>
          ▶ Jump In
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {[
            { id: 'leaderboard', title: 'Browse All Machines', desc: 'Filter by factory, type, status. Find what you need.', color: '#E83828' },
            { id: 'rental',      title: 'Rent Idle Capacity',  desc: `${counts.idle} machines waiting for your job right now.`, color: '#4FB39F' },
            { id: 'trending',    title: 'See What\'s Hot',     desc: 'Trending categories and the most-requested processes.', color: '#E8A33B' },
            { id: 'compare',     title: 'Compare Side-By-Side', desc: 'Pick up to 3 machines and weigh the trade-offs.',     color: '#F4F2F0' },
          ].map(b => (
            <button
              key={b.id}
              onClick={() => setView(b.id)}
              style={navButtonStyle(b.color)}
              onMouseEnter={e => { e.currentTarget.style.background = '#25252A'; e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = `4px 4px 0 ${b.color}` }}
              onMouseLeave={e => { e.currentTarget.style.background = '#18181B';  e.currentTarget.style.transform = 'translate(0, 0)';      e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{
                fontSize: 14, fontWeight: 700, color: '#F4F2F0', marginBottom: 6,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                ▸ {b.title}
              </div>
              <div style={{
                fontSize: 11, color: '#8A8688', lineHeight: 1.5,
                textTransform: 'none', letterSpacing: 'normal',
              }}>
                {b.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {machines.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '40px 0', color: '#8A8688',
          background: '#18181B', border: '2px dashed #2D2A30',
          fontFamily: 'Space Mono, monospace', fontSize: 12,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          ⟳ Connecting to factory servers... make sure json-server is running on ports 3001 and 3002.
        </div>
      )}
    </div>
  )
}

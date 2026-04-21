import { useState } from 'react'

export default function RentalView({ machines }) {
  const [submitted, setSubmitted] = useState(null)
  const [form, setForm] = useState({ company: '', email: '', date: '', notes: '' })

  const idle = machines.filter(m => m.status === 'idle')

  const handleSubmit = (machine) => {
    if (!form.company || !form.email || !form.date) {
      alert('Please fill in company, email, and date.')
      return
    }
    setSubmitted(machine)
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center' }}>
        <div style={{
          background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)',
          borderRadius: 18, padding: 40,
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#00e5a0', marginBottom: 8 }}>
            Rental request submitted
          </div>
          <div style={{ fontSize: 14, color: '#7a7a8e', marginBottom: 6 }}>
            Machine: <span style={{ color: '#e8e8f0' }}>{submitted.name}</span>
          </div>
          <div style={{ fontSize: 14, color: '#7a7a8e', marginBottom: 6 }}>
            Factory: <span style={{ color: '#e8e8f0' }}>{submitted.factory}</span>
          </div>
          <div style={{ fontSize: 14, color: '#7a7a8e', marginBottom: 24 }}>
            Requested by: <span style={{ color: '#e8e8f0' }}>{form.company}</span>
          </div>
          <div style={{
            background: '#0d0d10', borderRadius: 10, padding: '12px 16px',
            fontSize: 12, color: '#3a3a46', fontFamily: 'Space Mono, monospace', marginBottom: 24,
            textAlign: 'left',
          }}>
            In production: this request would create a booking record in Tingostim and notify the factory operator.
          </div>
          <button
            onClick={() => { setSubmitted(null); setForm({ company: '', email: '', date: '', notes: '' }) }}
            style={{
              padding: '10px 28px', borderRadius: 10, background: 'transparent',
              border: '1px solid #2a2a32', color: '#7a7a8e', fontSize: 13, cursor: 'pointer',
            }}
          >
            Back to listings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#e8e8f0', marginBottom: 6 }}>Idle machine rentals</h2>
        <p style={{ fontSize: 13, color: '#7a7a8e' }}>
          {idle.length} machine{idle.length !== 1 ? 's' : ''} available for rental across all factories.
          Reserve capacity now for your production schedule.
        </p>
      </div>

      {idle.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#3a3a46' }}>
          No idle machines at the moment. Check back soon.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {idle.map(m => (
            <div key={m.id} style={{
              background: '#111114', border: '1px solid #2a2a32',
              borderRadius: 14, padding: 24, display: 'grid',
              gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start',
            }}>
              {/* Left: info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: m._factory?.color || '#7a7a8e', display: 'inline-block' }} />
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#e8e8f0' }}>{m.name}</span>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 20,
                    background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', color: '#00e5a0',
                  }}>idle</span>
                </div>
                <div style={{ fontSize: 13, color: '#7a7a8e', marginBottom: 4 }}>
                  {m.factory} · {m.location}
                </div>
                <div style={{ fontSize: 13, color: '#7a7a8e', marginBottom: 12 }}>
                  Type: <span style={{ color: '#e8e8f0' }}>{m.type}</span>
                </div>
                <div style={{
                  background: '#0d0d10', borderRadius: 8, padding: '10px 14px',
                  fontSize: 12, color: '#7a7a8e', fontFamily: 'Space Mono, monospace', marginBottom: 12,
                }}>
                  {m.specs}
                </div>
                <div style={{ fontSize: 13, color: '#7a7a8e' }}>
                  Available from <span style={{ color: '#e8e8f0', fontWeight: 500 }}>{m.available_from}</span>
                  <span style={{ margin: '0 12px', color: '#2a2a32' }}>|</span>
                  Capacity available: <span style={{ color: '#00e5a0', fontWeight: 500 }}>{100 - m.capacity}%</span>
                </div>
              </div>

              {/* Right: booking form */}
              <div style={{
                background: '#0d0d10', border: '1px solid #2a2a32', borderRadius: 12,
                padding: '18px 20px', minWidth: 260,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                  <span style={{ fontSize: 11, color: '#7a7a8e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rate</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 18, fontWeight: 700, color: '#00e5a0' }}>
                    €{m.hourly_rate}/hr
                  </span>
                </div>
                {[
                  ['company', 'Company name', 'text'],
                  ['email', 'Email', 'email'],
                  ['date', 'Requested date', 'date'],
                ].map(([field, placeholder, type]) => (
                  <input
                    key={field}
                    type={type}
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    style={{
                      display: 'block', width: '100%', marginBottom: 8,
                      background: '#111114', border: '1px solid #2a2a32', borderRadius: 8,
                      padding: '8px 12px', color: '#e8e8f0', fontSize: 13, outline: 'none',
                    }}
                  />
                ))}
                <textarea
                  placeholder="Notes (optional)"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  style={{
                    display: 'block', width: '100%', marginBottom: 12,
                    background: '#111114', border: '1px solid #2a2a32', borderRadius: 8,
                    padding: '8px 12px', color: '#e8e8f0', fontSize: 13, outline: 'none',
                    resize: 'vertical', fontFamily: 'DM Sans, sans-serif',
                  }}
                />
                <button
                  onClick={() => handleSubmit(m)}
                  style={{
                    width: '100%', padding: '10px 0',
                    background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)',
                    borderRadius: 8, color: '#00e5a0', fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  Request this machine
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

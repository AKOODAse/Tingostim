import { useState } from 'react'

export default function RentalView({ machines }) {
  const [submitted, setSubmitted] = useState(null)
  const [submittedCompany, setSubmittedCompany] = useState('')

  const idle = machines.filter(m => m.status === 'idle')

  const handleSubmit = (machine, company) => {
    setSubmitted(machine)
    setSubmittedCompany(company)
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 560, margin: '60px auto', textAlign: 'center' }}>
        <div style={{
          background: '#18181B',
          border: '3px solid #4FB39F',
          padding: 40,
          boxShadow: '8px 8px 0 #0A0A0C',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: -2, left: -2, right: -2, height: 6,
            background: '#4FB39F',
          }} />
          <div style={{
            fontSize: 48, marginBottom: 16, color: '#4FB39F',
            fontFamily: 'Space Mono, monospace', fontWeight: 700,
          }}>
            ✓
          </div>
          <div style={{
            fontSize: 18, fontWeight: 700, color: '#4FB39F', marginBottom: 16,
            fontFamily: 'Space Mono, monospace',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            ▣ Rental Request Submitted
          </div>
          <div style={{
            background: '#25252A', border: '2px solid #2D2A30',
            padding: 16, marginBottom: 20, textAlign: 'left',
            fontFamily: 'Space Mono, monospace', fontSize: 12,
          }}>
            <div style={{ color: '#8A8688', marginBottom: 6 }}>
              MACHINE: <span style={{ color: '#F4F2F0', fontWeight: 700 }}>{submitted.name}</span>
            </div>
            <div style={{ color: '#8A8688', marginBottom: 6 }}>
              FACTORY: <span style={{ color: '#F4F2F0', fontWeight: 700 }}>{submitted.factory}</span>
            </div>
            <div style={{ color: '#8A8688' }}>
              REQUESTED BY: <span style={{ color: '#F4F2F0', fontWeight: 700 }}>{submittedCompany}</span>
            </div>
          </div>
          <div style={{
            background: '#0A0A0C', border: '1px dashed #2D2A30',
            padding: '12px 16px',
            fontSize: 11, color: '#8A8688', fontFamily: 'Space Mono, monospace',
            marginBottom: 24, textAlign: 'left',
            textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.6,
          }}>
            ▸ In production: this request would create a booking record in MNtory and notify the factory operator.
          </div>
          <button
            onClick={() => { setSubmitted(null); setSubmittedCompany('') }}
            style={{
              padding: '12px 32px', background: '#E83828',
              border: 'none', color: '#18181B',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Space Mono, monospace',
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E8A33B' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#E83828' }}
          >
            ◀ Back to Listings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{
          fontSize: 22, fontWeight: 700, color: '#F4F2F0', marginBottom: 8,
          fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          ▣ Idle Machine Rentals
        </h2>
        <p style={{ fontSize: 12, color: '#8A8688', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          [{idle.length}] machine{idle.length !== 1 ? 's' : ''} available · Reserve capacity for your production schedule.
        </p>
      </div>

      {idle.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 0', color: '#8A8688',
          background: '#18181B', border: '2px dashed #2D2A30',
          fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 12,
        }}>
          ⌧ No idle machines at the moment. Check back soon.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {idle.map(m => (
            <RentalCard key={m.id} machine={m} onSubmit={handleSubmit} />
          ))}
        </div>
      )}
    </div>
  )
}

// Per-machine rental card with isolated form state — fixes shared-state bug
function RentalCard({ machine: m, onSubmit }) {
  const [form, setForm] = useState({ company: '', email: '', date: '', notes: '' })

  const submit = () => {
    if (!form.company || !form.email || !form.date) {
      alert('Please fill in company, email, and date.')
      return
    }
    onSubmit(m, form.company)
  }

  const inputStyle = {
    display: 'block', width: '100%', marginBottom: 10,
    background: '#18181B', border: '2px solid #2D2A30',
    padding: '9px 12px', color: '#F4F2F0', fontSize: 12, outline: 'none',
    fontFamily: 'Space Mono, monospace',
  }

  return (
    <div style={{
      background: '#18181B',
      border: '2px solid #2D2A30',
      borderLeft: '5px solid #4FB39F',
      padding: 24, display: 'grid',
      gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start',
    }}>
      {/* Left: info */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{
            width: 12, height: 12,
            background: m._factory?.color || '#8A8688',
            display: 'inline-block', border: '1px solid #18181B',
          }} />
          <span style={{
            fontSize: 16, fontWeight: 700, color: '#F4F2F0',
            fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.02em',
          }}>
            {m.name}
          </span>
          <span style={{
            fontSize: 10, padding: '3px 10px',
            background: '#4FB39F', color: '#18181B', fontWeight: 700,
            fontFamily: 'Space Mono, monospace',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            ■ Idle
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#8A8688', marginBottom: 6, fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {m.factory} · {m.location}
        </div>
        <div style={{ fontSize: 11, color: '#8A8688', marginBottom: 14, fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Type: <span style={{ color: '#F4F2F0', fontWeight: 700 }}>{m.type}</span>
        </div>
        <div style={{
          background: '#25252A', border: '2px solid #2D2A30',
          padding: '10px 14px',
          fontSize: 12, color: '#F4F2F0', fontFamily: 'Space Mono, monospace', marginBottom: 14,
        }}>
          ▸ {m.specs}
        </div>
        <div style={{ fontSize: 11, color: '#8A8688', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Available from <span style={{ color: '#F4F2F0', fontWeight: 700 }}>{m.available_from}</span>
          <span style={{ margin: '0 14px', color: '#2D2A30' }}>│</span>
          Capacity available: <span style={{ color: '#4FB39F', fontWeight: 700 }}>{100 - m.capacity}%</span>
        </div>
      </div>

      {/* Right: booking form */}
      <div style={{
        background: '#0A0A0C', border: '2px solid #2D2A30',
        padding: '18px 20px', minWidth: 280,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #2D2A30',
        }}>
          <span style={{
            fontSize: 10, color: '#8A8688', fontFamily: 'Space Mono, monospace',
            textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
          }}>
            ▣ Rate
          </span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 20, fontWeight: 700, color: '#E83828' }}>
            €{m.hourly_rate}/HR
          </span>
        </div>
        {[
          ['company', 'COMPANY NAME', 'text'],
          ['email', 'EMAIL', 'email'],
          ['date', 'REQUESTED DATE', 'date'],
        ].map(([field, placeholder, type]) => (
          <input
            key={field}
            type={type}
            placeholder={placeholder}
            value={form[field]}
            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
            style={inputStyle}
          />
        ))}
        <textarea
          placeholder="NOTES (OPTIONAL)"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={2}
          style={{ ...inputStyle, marginBottom: 14, resize: 'vertical' }}
        />
        <button
          onClick={submit}
          style={{
            width: '100%', padding: '12px 0',
            background: '#E83828', border: 'none',
            color: '#18181B', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Space Mono, monospace',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#E8A33B' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#E83828' }}
        >
          ▶ Request This Machine
        </button>
      </div>
    </div>
  )
}

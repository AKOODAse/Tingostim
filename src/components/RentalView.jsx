import { useState } from 'react'
import { postTingostim } from '../api.js'

export default function RentalView({ machines }) {
  const [submitted, setSubmitted] = useState(null)

  const idle = machines.filter(m => m.status === 'idle')

  if (submitted) {
    return <SuccessScreen request={submitted} onBack={() => setSubmitted(null)} />
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
            <RentalCard key={m.id} machine={m} onSubmitted={setSubmitted} />
          ))}
        </div>
      )}
    </div>
  )
}

function SuccessScreen({ request, onBack }) {
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
          ▣ Rental Request #{request.id} Submitted
        </div>
        <div style={{
          background: '#25252A', border: '2px solid #2D2A30',
          padding: 16, marginBottom: 20, textAlign: 'left',
          fontFamily: 'Space Mono, monospace', fontSize: 12,
        }}>
          <Row label="MACHINE" value={request.machine_name} />
          <Row label="PROVIDER" value={request.provider_factory} />
          <Row label="REQUESTER" value={request.requester_factory} />
          <Row label="DATE" value={request.requested_date} />
          <Row label="DURATION" value={`${request.duration_hours} h`} />
          <Row label="EST. COST" value={`€${(request.estimated_cost || 0).toFixed(2)}`} last />
        </div>
        <div style={{
          background: '#0A0A0C', border: '1px dashed #2D2A30',
          padding: '12px 16px',
          fontSize: 11, color: '#8A8688', fontFamily: 'Space Mono, monospace',
          marginBottom: 24, textAlign: 'left',
          textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.6,
        }}>
          ▸ Status: <span style={{ color: '#E8A33B', fontWeight: 700 }}>{request.state}</span> · The provider factory will see this request in their Odoo inbox.
        </div>
        <button
          onClick={onBack}
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

function Row({ label, value, last }) {
  return (
    <div style={{ color: '#8A8688', marginBottom: last ? 0 : 6 }}>
      {label}: <span style={{ color: '#F4F2F0', fontWeight: 700 }}>{value || '—'}</span>
    </div>
  )
}

function RentalCard({ machine: m, onSubmitted }) {
  const [form, setForm] = useState({ date: '', duration: '1', notes: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setError('')
    if (!form.date) {
      setError('Date is required')
      return
    }
    const duration = parseFloat(form.duration)
    if (!(duration > 0)) {
      setError('Duration must be greater than 0')
      return
    }
    setBusy(true)
    try {
      const created = await postTingostim('/rental_requests', {
        machine_id: m.id,
        requested_date: form.date,
        duration_hours: duration,
        notes: form.notes,
      })
      onSubmitted(created)
    } catch (err) {
      setError(err.message || 'submission failed')
    } finally {
      setBusy(false)
    }
  }

  const inputStyle = {
    display: 'block', width: '100%', marginBottom: 10,
    background: '#18181B', border: '2px solid #2D2A30',
    padding: '9px 12px', color: '#F4F2F0', fontSize: 12, outline: 'none',
    fontFamily: 'Space Mono, monospace',
  }

  const totalCost = (parseFloat(form.duration) || 0) * (m.hourly_rate || 0)

  return (
    <div style={{
      background: '#18181B',
      border: '2px solid #2D2A30',
      borderLeft: '5px solid #4FB39F',
      padding: 24, display: 'grid',
      gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start',
    }}>
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
          Available from <span style={{ color: '#F4F2F0', fontWeight: 700 }}>{m.available_from || '—'}</span>
          <span style={{ margin: '0 14px', color: '#2D2A30' }}>│</span>
          Capacity used: <span style={{ color: '#4FB39F', fontWeight: 700 }}>{m.capacity}%</span>
        </div>
      </div>

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

        <label style={labelStyle}>
          REQUESTED DATE
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            style={inputStyle}
            disabled={busy}
          />
        </label>
        <label style={labelStyle}>
          DURATION (HOURS)
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={form.duration}
            onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
            style={inputStyle}
            disabled={busy}
          />
        </label>
        <label style={labelStyle}>
          NOTES (OPTIONAL)
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2}
            style={{ ...inputStyle, marginBottom: 8, resize: 'vertical' }}
            disabled={busy}
          />
        </label>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '8px 0', marginBottom: 12,
          fontSize: 11, fontFamily: 'Space Mono, monospace',
          color: '#8A8688', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          <span>Estimated cost</span>
          <span style={{ color: '#4FB39F', fontWeight: 700 }}>€{totalCost.toFixed(2)}</span>
        </div>

        {error && (
          <div style={{
            marginBottom: 12, padding: '8px 10px',
            border: '1px solid #E83828', color: '#E83828',
            fontSize: 10, fontFamily: 'Space Mono, monospace',
            letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.4,
          }}>
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={busy}
          style={{
            width: '100%', padding: '12px 0',
            background: busy ? '#2D2A30' : '#E83828', border: 'none',
            color: busy ? '#8A8688' : '#18181B',
            fontSize: 12, fontWeight: 700, cursor: busy ? 'wait' : 'pointer',
            fontFamily: 'Space Mono, monospace',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => { if (!busy) e.currentTarget.style.background = '#E8A33B' }}
          onMouseLeave={e => { if (!busy) e.currentTarget.style.background = '#E83828' }}
        >
          {busy ? '◯ Submitting…' : '▶ Request This Machine'}
        </button>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#8A8688',
  fontFamily: 'Space Mono, monospace',
  marginBottom: 4,
}

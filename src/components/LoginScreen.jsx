import { useState } from 'react'
import { login, DEFAULT_DB } from '../api.js'

export default function LoginScreen({ onAuthenticated }) {
  const [db, setDb] = useState(DEFAULT_DB)
  const [loginName, setLoginName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const session = await login(db.trim(), loginName.trim(), password)
      onAuthenticated(session)
    } catch (err) {
      setError(err.message || 'login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0C',
      color: '#F4F2F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Space Mono, monospace',
      padding: 24,
    }}>
      <form onSubmit={handleSubmit} style={{
        width: 380,
        background: '#000000',
        border: '2px solid #2D2A30',
        borderTop: '3px solid #E83828',
        padding: '36px 32px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 28,
        }}>
          <span style={{ width: 10, height: 10, background: '#E83828', display: 'inline-block' }} />
          <span style={{
            fontSize: 13,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: '#F4F2F0',
          }}>
            Tingostim — Authorized Access
          </span>
        </div>

        <Field
          label="Database"
          value={db}
          onChange={setDb}
          autoComplete="off"
          disabled={busy}
        />
        <Field
          label="Login"
          value={loginName}
          onChange={setLoginName}
          autoComplete="username"
          autoFocus
          disabled={busy}
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          disabled={busy}
        />

        {error && (
          <div style={{
            marginTop: 12,
            padding: '8px 10px',
            border: '1px solid #E83828',
            color: '#E83828',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !loginName || !password}
          style={{
            marginTop: 24,
            width: '100%',
            padding: '14px 0',
            background: busy ? '#2D2A30' : '#E83828',
            color: busy ? '#8A8688' : '#0A0A0C',
            border: 'none',
            fontFamily: 'Space Mono, monospace',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {busy ? 'Authenticating…' : 'Enter Platform'}
        </button>

        <div style={{
          marginTop: 22,
          fontSize: 10,
          color: '#8A8688',
          lineHeight: 1.6,
          letterSpacing: '0.04em',
        }}>
          Closed system. Credentials are issued by Tingostim administration
          to contracted factories only.
        </div>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', disabled, autoComplete, autoFocus }) {
  return (
    <label style={{
      display: 'block',
      marginBottom: 14,
      fontSize: 10,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: '#8A8688',
    }}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        style={{
          display: 'block',
          width: '100%',
          marginTop: 6,
          padding: '10px 12px',
          background: '#0A0A0C',
          border: '1px solid #2D2A30',
          color: '#F4F2F0',
          fontFamily: 'Space Mono, monospace',
          fontSize: 13,
          letterSpacing: '0.04em',
          outline: 'none',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#E83828' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = '#2D2A30' }}
      />
    </label>
  )
}

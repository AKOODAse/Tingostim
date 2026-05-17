const API_BASE = '/api/tingostim/api/v1'
const ODOO_BASE = '/api'

async function jsonRpc(path, params) {
  const res = await fetch(`${ODOO_BASE}${path}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', params }),
  })
  if (!res.ok) throw new Error(`${path} → ${res.status}`)
  const body = await res.json()
  if (body.error) {
    const message = body.error.data?.message || body.error.message || 'request failed'
    throw new Error(message)
  }
  return body.result
}

export async function getSession() {
  try {
    return await jsonRpc('/web/session/get_session_info', {})
  } catch {
    return null
  }
}

export async function login(db, loginName, password) {
  const result = await jsonRpc('/web/session/authenticate', {
    db,
    login: loginName,
    password,
  })
  if (!result || !result.uid) {
    throw new Error('invalid credentials')
  }
  return result
}

export async function logout() {
  try {
    await jsonRpc('/web/session/destroy', {})
  } catch {
    /* ignore */
  }
}

export async function fetchTingostim(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
    redirect: 'manual',
  })
  if (res.type === 'opaqueredirect' || res.status === 401 || res.status === 403) {
    const err = new Error('not authenticated')
    err.code = 'AUTH'
    throw err
  }
  if (!res.ok) throw new Error(`${path} → ${res.status}`)
  return res.json()
}

export async function postTingostim(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    redirect: 'manual',
  })
  if (res.type === 'opaqueredirect' || res.status === 401 || res.status === 403) {
    const err = new Error('not authenticated')
    err.code = 'AUTH'
    throw err
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `${path} → ${res.status}`)
  }
  return data
}

export const DEFAULT_DB = 'MNtory'

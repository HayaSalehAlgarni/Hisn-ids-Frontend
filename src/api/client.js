// In dev, empty base uses same origin so Vite proxy can forward /api → Flask (see vite.config.js).
// Set VITE_API_BASE_URL for production or to force a full URL to the backend.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  ''

const buildUrl = (path) => {
  const p = path.startsWith('/') ? path : `/${path}`
  if (!API_BASE_URL) return p
  return `${API_BASE_URL.replace(/\/$/, '')}${p}`
}

export function getStoredToken() {
  return localStorage.getItem('hisn_token')
}

function authHeaders() {
  const token = getStoredToken()
  const h = { 'Content-Type': 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

/** Backend uses English codes; show readable bilingual text in the UI */
const API_MESSAGE_AR = {
  unauthorized:
    'انتهت الجلسة أو غير مصرّح. سجّل الدخول مرة أخرى.',
  forbidden: 'ليس لديك صلاحية لهذا الإجراء.',
  account_suspended: 'الحساب موقوف.',
  invalid_credentials: 'البريد أو كلمة المرور غير صحيحة.',
}
const API_MESSAGE_EN = {
  unauthorized: 'Session expired or not signed in. Please log in again.',
  forbidden: 'You do not have permission for this action.',
  account_suspended: 'This account is suspended.',
  invalid_credentials: 'Invalid email or password.',
}

function humanizeApiMessage(raw, status) {
  const key = String(raw || '').trim().toLowerCase()
  if (API_MESSAGE_AR[key]) {
    return `${API_MESSAGE_AR[key]} (${API_MESSAGE_EN[key]})`
  }
  if (key) return raw
  return `Request failed (${status})`
}

function clearSessionAndGoToLogin() {
  try {
    localStorage.removeItem('hisn_token')
    localStorage.removeItem('hisn_user')
  } catch {
    /* ignore */
  }
  const path = typeof window !== 'undefined' ? window.location.pathname || '' : ''
  const target = path.startsWith('/admin') ? '/admin/login' : '/login'
  if (typeof window !== 'undefined') {
    window.location.replace(target)
  }
}

function throwFromAuthResponse(res, data) {
  const raw = (data && (data.message || data.detail)) || ''
  if (res.status === 401) {
    clearSessionAndGoToLogin()
    throw new Error(humanizeApiMessage('unauthorized', res.status))
  }
  if (!res.ok) {
    throw new Error(humanizeApiMessage(raw, res.status))
  }
}

export async function getJsonAuth(path) {
  const res = await fetch(buildUrl(path), { headers: authHeaders() })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  throwFromAuthResponse(res, data)
  return data
}

export async function postJsonAuth(path, body) {
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body ?? {}),
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  throwFromAuthResponse(res, data)
  return data
}

export async function patchJsonAuth(path, body) {
  const res = await fetch(buildUrl(path), {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body ?? {}),
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  throwFromAuthResponse(res, data)
  return data
}

export async function deleteJsonAuth(path) {
  const res = await fetch(buildUrl(path), { method: 'DELETE', headers: authHeaders() })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  throwFromAuthResponse(res, data)
  return data
}

export async function postJsonNoBodyAuth(path) {
  const res = await fetch(buildUrl(path), { method: 'POST', headers: authHeaders() })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  throwFromAuthResponse(res, data)
  return data
}

export async function getJson(path) {
  const res = await fetch(buildUrl(path))
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    const raw = (data && (data.message || data.detail)) || ''
    throw new Error(humanizeApiMessage(raw, res.status))
  }
  return data
}

export async function postJson(path, body) {
  let res
  try {
    res = await fetch(buildUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    })
  } catch {
    throw new Error('network_error')
  }
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    const raw = (data && (data.message || data.detail)) || ''
    throw new Error(humanizeApiMessage(raw, res.status))
  }
  return data
}

export { API_BASE_URL }

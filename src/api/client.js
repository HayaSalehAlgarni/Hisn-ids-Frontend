const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'

const buildUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

export function getStoredToken() {
  return localStorage.getItem('hisn_token')
}

function authHeaders() {
  const token = getStoredToken()
  const h = { 'Content-Type': 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

export async function getJsonAuth(path) {
  const res = await fetch(buildUrl(path), { headers: authHeaders() })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    const message = (data && (data.message || data.detail)) || `Request failed (${res.status})`
    throw new Error(message)
  }
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
  if (!res.ok) {
    const message = (data && (data.message || data.detail)) || `Request failed (${res.status})`
    throw new Error(message)
  }
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
  if (!res.ok) {
    const message = (data && (data.message || data.detail)) || `Request failed (${res.status})`
    throw new Error(message)
  }
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
  if (!res.ok) {
    const message = (data && (data.message || data.detail)) || `Request failed (${res.status})`
    throw new Error(message)
  }
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
  if (!res.ok) {
    const message = (data && (data.message || data.detail)) || `Request failed (${res.status})`
    throw new Error(message)
  }
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
    const message = (data && (data.message || data.detail)) || `Request failed (${res.status})`
    throw new Error(message)
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
    const message = (data && (data.message || data.detail)) || `Request failed (${res.status})`
    throw new Error(message)
  }
  return data
}

export { API_BASE_URL }

import axios from 'axios'
import { getStoredToken } from './client'

/** Default: same-origin `/api/*` (Vite → Flask in dev; nginx → Flask in prod). Override only if analytics is split to another host. */
function analyticsBaseUrl() {
  const explicit = import.meta.env.VITE_ANALYTICS_API_URL
  if (explicit != null && String(explicit).trim() !== '') {
    return String(explicit).replace(/\/$/, '')
  }
  return ''
}

const ANALYTICS_ROOT = analyticsBaseUrl()

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

export const analyticsApi = axios.create({
  baseURL: ANALYTICS_ROOT,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000,
})

analyticsApi.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

analyticsApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearSessionAndGoToLogin()
    }
    return Promise.reject(err)
  }
)

export async function fetchAnalyticsSummary(period) {
  const { data } = await analyticsApi.get('/api/analytics/summary', { params: { period } })
  return data
}

export async function fetchAnalyticsTraffic(period) {
  const { data } = await analyticsApi.get('/api/analytics/traffic', { params: { period } })
  return data
}

export async function fetchModelStats() {
  const { data } = await analyticsApi.get('/api/analytics/model-stats')
  return data
}

export async function postDetect(body) {
  const { data } = await analyticsApi.post('/api/analytics/detect', body)
  return data
}

export { ANALYTICS_ROOT }

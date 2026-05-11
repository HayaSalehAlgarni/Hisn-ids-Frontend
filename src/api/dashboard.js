import { getJsonAuth } from './client'

export async function fetchDashboardStats(severity = 'all') {
  const q = severity === 'all' ? '' : `?severity=${encodeURIComponent(severity)}`
  return getJsonAuth(`/api/stats/dashboard${q}`)
}

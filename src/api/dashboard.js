import { getJson } from './client'

export async function fetchDashboardStats(severity = 'all') {
  const q = severity === 'all' ? '' : `?severity=${encodeURIComponent(severity)}`
  return getJson(`/api/stats/dashboard${q}`)
}

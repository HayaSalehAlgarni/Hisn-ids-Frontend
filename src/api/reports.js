import { getJsonAuth } from './client'

export async function fetchGeneratedReport(type) {
  const q = encodeURIComponent(type)
  return getJsonAuth(`/api/reports/generate?type=${q}`)
}

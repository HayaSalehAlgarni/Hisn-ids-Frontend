import { getJsonAuth } from './client'

export const normalizeSeverity = (value) => {
  const s = String(value || '').toLowerCase()
  if (s === 'critical') return 'high'
  if (['high', 'medium', 'low'].includes(s)) return s
  return 'low'
}

export const threatTypeFromAttack = (attackType) => {
  const value = String(attackType || '').toLowerCase()
  if (value.includes('failed_login')) return 'Login'
  if (value.includes('dns')) return 'DNS'
  if (value.includes('scan') || value.includes('intrusion') || value.includes('login') || value.includes('brute')) return 'Suspicious'
  return 'Normal'
}

export const toUiAlert = (row) => ({
  id: row.id,
  title: row.description || row.attack_type || 'Security alert',
  source: row.source_ip || 'N/A',
  destination: row.destination_ip || 'N/A',
  time: row.timestamp ? new Date(row.timestamp).toLocaleTimeString('en-GB', { hour12: false }) : '--:--:--',
  severity: String(row.severity || '').toLowerCase() || 'low',
  type: threatTypeFromAttack(row.attack_type),
  protocol: row.protocol || 'N/A',
  attackType: row.attack_type || 'N/A',
})

export async function fetchAlerts() {
  const data = await getJsonAuth('/api/alerts')
  const list = data?.alerts ?? data ?? []
  return Array.isArray(list) ? list : []
}

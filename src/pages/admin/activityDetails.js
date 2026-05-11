/** Parse activity_logs.details (JSON string or object) for display in admin UI. */
export function parseActivityDetails(raw) {
  if (raw == null || raw === '') return null
  if (typeof raw === 'object') return raw
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return { text: raw }
    }
  }
  return null
}

export function formatActivityDetails(row, lang) {
  const d = parseActivityDetails(row.details)
  if (!d || typeof d !== 'object') return '—'
  const parts = []
  if (d.email) parts.push(String(d.email))
  if (d.ip) parts.push(`${lang === 'ar' ? 'عنوان IP' : 'IP'}: ${d.ip}`)
  if (d.attempt != null)
    parts.push(lang === 'ar' ? `المحاولة رقم ${d.attempt}` : `Attempt #${d.attempt}`)
  if (d.attempts != null && d.attempt == null)
    parts.push(lang === 'ar' ? `${d.attempts} محاولات` : `${d.attempts} attempts`)
  if (d.text) parts.push(String(d.text))
  return parts.length ? parts.join(' · ') : '—'
}

import { useCallback, useEffect, useState } from 'react'
import { useLang } from '../../context/lang'
import { getJsonAuth } from '../../api/client'
import { activityActionLabel, activityRowClass } from './adminLabels'
import { formatActivityDetails } from './activityDetails'
import s from './adminShared.module.css'

const ACTIONS = [
  'all',
  'login',
  'login_failed',
  'failed_login_alert',
  'user_create',
  'user_update',
  'user_delete',
  'password_reset',
  'profile_update',
]

function formatEnglishDateTime(value) {
  if (!value) return '—'
  const normalized = String(value).replace(' ', 'T')
  const dt = new Date(normalized)
  if (Number.isNaN(dt.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(dt)
}

function toApiDate(mmddyyyy) {
  const raw = String(mmddyyyy || '').trim()
  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return ''
  const month = m[1]
  const day = m[2]
  const year = m[3]
  return `${year}-${month}-${day}`
}

function formatInputDate(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return `${iso[2]}/${iso[3]}/${iso[1]}`
  const us = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (us) return raw
  return ''
}

export default function AdminActivity() {
  const { lang } = useLang()
  const [items, setItems] = useState([])
  const [err, setErr] = useState('')
  const [action, setAction] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const load = useCallback(async () => {
    setErr('')
    try {
      const params = new URLSearchParams({ limit: '120' })
      if (action && action !== 'all') params.set('action', action)
      const fromApi = toApiDate(from)
      const toApi = toApiDate(to)
      if (fromApi) params.set('from', fromApi)
      if (toApi) params.set('to', toApi)
      const data = await getJsonAuth(`/api/admin/activity?${params}`)
      setItems(data.items || [])
    } catch {
      setErr(lang === 'ar' ? 'تعذر تحميل السجل' : 'Failed to load activity')
    }
  }, [action, from, to, lang])

  useEffect(() => {
    load()
  }, [load])

  const copy = {
    title: { ar: 'سجل النشاط', en: 'Activity logs' },
    action: { ar: 'نوع الحدث', en: 'Event type' },
    all: { ar: 'الكل', en: 'All' },
    from: { ar: 'من تاريخ', en: 'From' },
    to: { ar: 'إلى تاريخ', en: 'To' },
    actor: { ar: 'المستخدم', en: 'Actor' },
    target: { ar: 'الهدف', en: 'Target' },
    time: { ar: 'الوقت', en: 'Time' },
    details: { ar: 'التفاصيل', en: 'Details' },
    refresh: { ar: 'تحديث', en: 'Refresh' },
    empty: { ar: 'لا توجد سجلات.', en: 'No records.' },
  }

  return (
    <div>
      <h1 className={s.pageTitle}>{copy.title[lang]}</h1>
      {err && <p className={s.error}>{err}</p>}
      <div className={s.toolbar}>
        <select className={s.select} value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="all">{copy.all[lang]}</option>
          {ACTIONS.filter((a) => a !== 'all').map((a) => (
            <option key={a} value={a}>
              {activityActionLabel(a, lang)}
            </option>
          ))}
        </select>
        <input
          className={s.input}
          type="text"
          inputMode="numeric"
          placeholder="MM/DD/YYYY"
          dir="ltr"
          value={from}
          onChange={(e) => setFrom(formatInputDate(e.target.value))}
        />
        <input
          className={s.input}
          type="text"
          inputMode="numeric"
          placeholder="MM/DD/YYYY"
          dir="ltr"
          value={to}
          onChange={(e) => setTo(formatInputDate(e.target.value))}
        />
        <button type="button" className={s.btn} onClick={() => load()}>
          {copy.refresh[lang]}
        </button>
      </div>
      {items.length === 0 ? (
        <p className={s.emptyState}>{copy.empty[lang]}</p>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>{copy.action[lang]}</th>
                <th>{copy.actor[lang]}</th>
                <th>{copy.target[lang]}</th>
                <th>{copy.details[lang]}</th>
                <th>{copy.time[lang]}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className={s[activityRowClass(row.action)]}>
                  <td>{activityActionLabel(row.action, lang)}</td>
                  <td>{row.actor_label ?? row.actor_user_id ?? '—'}</td>
                  <td>{row.target_label ?? row.target_user_id ?? '—'}</td>
                  <td className={s.detailsCell}>{formatActivityDetails(row, lang)}</td>
                  <td>{formatEnglishDateTime(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

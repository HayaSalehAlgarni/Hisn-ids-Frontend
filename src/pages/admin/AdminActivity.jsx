import { useCallback, useEffect, useState } from 'react'
import { useLang } from '../../context/lang'
import { getJsonAuth } from '../../api/client'
import { activityActionLabel, activityRowClass } from './adminLabels'
import s from './adminShared.module.css'

const ACTIONS = [
  'all',
  'login',
  'user_create',
  'user_update',
  'user_delete',
  'password_reset',
  'profile_update',
]

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
      if (from.trim()) params.set('from', from.trim())
      if (to.trim()) params.set('to', to.trim())
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
        <input className={s.input} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input className={s.input} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
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
                <th>{copy.time[lang]}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className={s[activityRowClass(row.action)]}>
                  <td>{activityActionLabel(row.action, lang)}</td>
                  <td>{row.actor_label ?? row.actor_user_id ?? '—'}</td>
                  <td>{row.target_label ?? row.target_user_id ?? '—'}</td>
                  <td>{row.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

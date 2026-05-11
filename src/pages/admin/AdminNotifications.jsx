import { useEffect, useState } from 'react'
import { useLang } from '../../context/lang'
import { getJsonAuth } from '../../api/client'
import { activityActionLabel, activityRowClass } from './adminLabels'
import { formatActivityDetails } from './activityDetails'
import s from './adminShared.module.css'

const ICON = {
  login: '🔐',
  failed_login_alert: '🚨',
  user_create: '➕',
  user_update: '✏️',
  user_delete: '🗑️',
  password_reset: '🔑',
  alerts_summary: '⚠️',
}

export default function AdminNotifications() {
  const { lang } = useLang()
  const [items, setItems] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await getJsonAuth('/api/admin/notifications')
        if (!cancelled) setItems(data.items || [])
      } catch {
        if (!cancelled) setErr(lang === 'ar' ? 'تعذر التحميل' : 'Failed to load')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [lang])

  const copy = {
    title: { ar: 'الإشعارات المهمة', en: 'Important notifications' },
    empty: { ar: 'لا توجد إشعارات مهمة.', en: 'No important notifications.' },
    alerts24: { ar: 'تنبيه أمني: ', en: 'Security: ' },
    alertsCount: { ar: 'تنبيه في آخر 24 ساعة', en: 'alert(s) in the last 24 hours' },
  }

  return (
    <div>
      <h1 className={s.pageTitle}>{copy.title[lang]}</h1>
      <p className={s.muted} style={{ marginBottom: '1rem' }}>
        {lang === 'ar'
          ? 'بيانات حقيقية من الخادم: تسجيل الدخول، تنبيهات محاولات الدخول الفاشلة، إدارة المستخدمين، وملخص التنبيهات الأمنية.'
          : 'Live data from the server: logins, brute-force alerts, user admin actions, and security alert summaries.'}
      </p>
      {err && <p className={s.error}>{err}</p>}
      <div className={s.listStack}>
        {items.length === 0 ? (
          <p className={s.emptyState}>{copy.empty[lang]}</p>
        ) : (
          items.map((it, i) => {
            if (it.kind === 'summary') {
              return (
                <div
                  key={`sum-${i}`}
                  className={`${s.listItem} ${s.actWarn}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <span aria-hidden>{ICON.alerts_summary}</span>
                  <span>
                    {copy.alerts24[lang]}
                    <strong>{it.count}</strong> {copy.alertsCount[lang]}
                  </span>
                </div>
              )
            }
            const ic = ICON[it.action] || '📌'
            const detailLine = formatActivityDetails(it, lang)
            return (
              <div
                key={it.id}
                className={`${s.listItem} ${s[activityRowClass(it.action)]}`}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}
              >
                <span aria-hidden>{ic}</span>
                <div>
                  <strong>{activityActionLabel(it.action, lang)}</strong>
                  <div className={s.muted}>
                    {detailLine !== '—' ? <span>{detailLine} · </span> : null}
                    {it.actor_label || it.actor_user_id || '—'}
                    {it.target_label || it.target_user_id
                      ? ` → ${it.target_label || it.target_user_id}`
                      : ''}
                    {it.created_at ? ` · ${it.created_at}` : ''}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

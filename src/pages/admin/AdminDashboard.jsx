import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../../context/lang'
import { getJsonAuth } from '../../api/client'
import { activityActionLabel, activityRowClass } from './adminLabels'
import s from './adminShared.module.css'

function MiniChart({ alertsSeries, activitySeries }) {
  const maxVal = Math.max(
    1,
    ...alertsSeries.map((x) => x.count),
    ...activitySeries.map((x) => x.count),
  )
  const n = alertsSeries.length || 1
  const w = 600
  const h = 160
  const pad = 24
  const inner = w - pad * 2
  const groupW = inner / n
  const barW = Math.max(4, groupW * 0.36)
  const gap = 3
  const toY = (c) => h - pad - (c / maxVal) * (h - pad * 2)

  return (
    <svg className={s.chartSvg} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={pad}
          x2={w - pad}
          y1={pad + t * (h - pad * 2)}
          y2={pad + t * (h - pad * 2)}
          stroke="rgba(0,0,0,0.06)"
        />
      ))}
      {alertsSeries.map((d, i) => {
        const x0 = pad + i * groupW + (groupW - (barW * 2 + gap)) / 2
        const barH = h - pad - toY(d.count)
        return (
          <rect
            key={`a-${d.date}`}
            x={x0}
            y={toY(d.count)}
            width={barW}
            height={barH}
            fill="#b91c1c"
            opacity={0.88}
          />
        )
      })}
      {activitySeries.map((d, i) => {
        const x0 = pad + i * groupW + (groupW - (barW * 2 + gap)) / 2 + barW + gap
        const barH = h - pad - toY(d.count)
        return (
          <rect
            key={`v-${d.date}`}
            x={x0}
            y={toY(d.count)}
            width={barW}
            height={barH}
            fill="#16a34a"
            opacity={0.88}
          />
        )
      })}
    </svg>
  )
}

export default function AdminDashboard() {
  const { lang } = useLang()
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [chartRange, setChartRange] = useState('week')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const d = await getJsonAuth(`/api/admin/dashboard?chart_range=${chartRange}`)
        if (!cancelled) setData(d)
      } catch {
        if (!cancelled) setErr(lang === 'ar' ? 'تعذر تحميل البيانات' : 'Failed to load data')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [lang, chartRange])

  const copy = {
    title: { ar: 'لوحة الإدارة', en: 'Admin dashboard' },
    total: { ar: 'إجمالي المستخدمين', en: 'Total users' },
    active: { ar: 'نشط', en: 'Active' },
    suspended: { ar: 'موقوف', en: 'Suspended' },
    alerts: { ar: 'تنبيهات (مخزنة)', en: 'Alerts (stored)' },
    recent: { ar: 'آخر النشاط', en: 'Recent activity' },
    chart: { ar: 'التنبيهات والأحداث', en: 'Alerts & activity' },
    week: { ar: 'أسبوع', en: 'Week' },
    month: { ar: 'شهر', en: 'Month' },
    legA: { ar: 'تنبيهات', en: 'Alerts' },
    legV: { ar: 'أحداث', en: 'Events' },
    emptyRecent: { ar: 'لا يوجد نشاط بعد', en: 'No activity yet' },
    emptyChart: { ar: 'لا بيانات للفترة', en: 'No data for this period' },
    securityWarn: {
      ar: 'تم رصد محاولات تسجيل دخول فاشلة متكررة خلال آخر 24 ساعة. راجع سجل النشاط لكل محاولة والتفاصيل.',
      en: 'Repeated failed login attempts were detected in the last 24 hours. Review the activity log for each attempt and details.',
    },
    securityLink: { ar: 'عرض سجل النشاط', en: 'View activity log' },
  }

  const alertsDay = data?.alerts_by_day || []
  const actDay = data?.activity_by_day || []

  return (
    <div>
      <h1 className={s.pageTitle}>{copy.title[lang]}</h1>
      {err && <p className={s.error}>{err}</p>}
      {data && Number(data.failed_login_alerts_24h) > 0 ? (
        <div className={s.securityBanner} role="status">
          <span className={s.securityBannerIcon} aria-hidden>
            ⚠️
          </span>
          <div className={s.securityBannerBody}>
            <p className={s.securityBannerText}>{copy.securityWarn[lang]}</p>
            <Link className={s.securityBannerLink} to="/admin/app/activity">
              {copy.securityLink[lang]}
            </Link>
          </div>
        </div>
      ) : null}
      {data && (
        <>
          <div className={s.grid}>
            <div className={s.stat}>
              <div className={s.statValue}>{data.total_users}</div>
              <div className={s.statLabel}>{copy.total[lang]}</div>
            </div>
            <div className={s.stat}>
              <div className={s.statValue}>{data.active_users}</div>
              <div className={s.statLabel}>{copy.active[lang]}</div>
            </div>
            <div className={s.stat}>
              <div className={s.statValue}>{data.suspended_users}</div>
              <div className={s.statLabel}>{copy.suspended[lang]}</div>
            </div>
            <div className={s.stat}>
              <div className={s.statValue}>{data.alerts_total}</div>
              <div className={s.statLabel}>{copy.alerts[lang]}</div>
            </div>
          </div>

          <div className={`${s.card} ${s.chartCard}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 className={s.pageTitle} style={{ fontSize: '1.1rem', margin: 0 }}>
                {copy.chart[lang]}
              </h2>
              <div className={s.chartToolbar}>
                <button
                  type="button"
                  className={`${s.chartToggle} ${chartRange === 'week' ? s.chartToggleActive : ''}`}
                  onClick={() => setChartRange('week')}
                >
                  {copy.week[lang]}
                </button>
                <button
                  type="button"
                  className={`${s.chartToggle} ${chartRange === 'month' ? s.chartToggleActive : ''}`}
                  onClick={() => setChartRange('month')}
                >
                  {copy.month[lang]}
                </button>
              </div>
            </div>
            {alertsDay.length === 0 ? (
              <p className={s.emptyState}>{copy.emptyChart[lang]}</p>
            ) : (
              <>
                <MiniChart alertsSeries={alertsDay} activitySeries={actDay} />
                <div className={s.chartLegend}>
                  <span className={s.legendAlerts}>{copy.legA[lang]}</span>
                  <span className={s.legendActivity}>{copy.legV[lang]}</span>
                </div>
              </>
            )}
          </div>

          <div className={s.card}>
            <h2 className={s.pageTitle} style={{ fontSize: '1.1rem' }}>
              {copy.recent[lang]}
            </h2>
            {(data.recent_activity || []).length === 0 ? (
              <p className={s.emptyState}>{copy.emptyRecent[lang]}</p>
            ) : (
              <div className={s.listStack}>
                {(data.recent_activity || []).map((row) => (
                  <div key={row.id} className={`${s.listItem} ${s[activityRowClass(row.action)]}`}>
                    <strong>{activityActionLabel(row.action, lang)}</strong>
                    <span className={s.muted}>
                      {' '}
                      · {lang === 'ar' ? 'من' : 'by'} {row.actor_label || row.actor_user_id || '—'}
                      {row.target_label || row.target_user_id
                        ? ` · ${lang === 'ar' ? 'هدف' : 'target'}: ${row.target_label || row.target_user_id}`
                        : ''}
                    </span>
                    <span className={s.muted}> · {row.created_at}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

import { useMemo, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import styles from './Dashboard.module.css'
import { useLang } from '../context/lang'
import { fetchDashboardStats } from '../api/dashboard'

const DONUT_COLORS = ['var(--header-purple)', 'var(--card-purple)', 'var(--alert-critical)']

function monthShortLabel(ym, lang) {
  const parts = String(ym || '').split('-')
  if (parts.length !== 2) return ym
  const y = Number(parts[0])
  const m = Number(parts[1]) - 1
  if (Number.isNaN(y) || Number.isNaN(m)) return ym
  const d = new Date(y, m, 1)
  return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short' })
}

function bucketLabel(key, lang) {
  const ar = {
    '0-24': 'ثقة 0–24',
    '25-49': 'ثقة 25–49',
    '50-74': 'ثقة 50–74',
    '75-100': 'ثقة 75–100',
    unknown: 'غير محدد',
  }
  const en = {
    '0-24': 'Conf. 0–24',
    '25-49': 'Conf. 25–49',
    '50-74': 'Conf. 50–74',
    '75-100': 'Conf. 75–100',
    unknown: 'Unknown',
  }
  return (lang === 'ar' ? ar : en)[key] ?? key
}

export default function Dashboard({ linkPrefix = '/app' }) {
  const { lang } = useLang()
  const [activeStage, setActiveStage] = useState('all')
  const [stats, setStats] = useState(null)
  const [loadError, setLoadError] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await fetchDashboardStats(activeStage)
      setStats(data)
      setLoadError('')
    } catch (e) {
      setStats(null)
      setLoadError(e?.message || 'Failed to load dashboard')
    }
  }, [activeStage])

  useEffect(() => {
    load()
    const timer = setInterval(load, 10000)
    return () => clearInterval(timer)
  }, [load])

  const t = lang === 'ar' ? {
    title: 'لوحة الأمن',
    stageLabel: 'مرحلة التهديد',
    stages: [
      { id: 'all', label: 'الكل' },
      { id: 'critical', label: 'حرج' },
      { id: 'high', label: 'عالي' },
      { id: 'medium', label: 'متوسط' },
      { id: 'low', label: 'منخفض' },
    ],
    kpiTotal: 'إجمالي التنبيهات',
    kpiConfidence: 'متوسط الثقة',
    kpiCritical: 'تنبيهات حرجة',
    kpiSources: 'مصادر IP فريدة',
    noConfidence: '—',
    chartTrend: 'التنبيهات (آخر 12 شهرًا)',
    legendElevated: 'حرج / عالي',
    legendRest: 'متوسط / منخفض / غير مصنف',
    chartByType: 'أنواع الهجمات (من قاعدة البيانات)',
    donutCenter: 'الأنواع',
    chartBySeverity: 'التوزيع حسب الخطورة',
    chartByCategory: 'توزيع حقل الثقة (confidence)',
    dataError: 'تعذر تحميل الإحصائيات من الخادم.',
    actions: {
      alerts: 'تقرير التنبيهات',
      analytics: 'التحليلات',
      monitoring: 'المراقبة المباشرة',
    },
  } : {
    title: 'Security Dashboard',
    stageLabel: 'Threat stage',
    stages: [
      { id: 'all', label: 'All' },
      { id: 'critical', label: 'Critical' },
      { id: 'high', label: 'High' },
      { id: 'medium', label: 'Medium' },
      { id: 'low', label: 'Low' },
    ],
    kpiTotal: 'Total alerts',
    kpiConfidence: 'Avg confidence',
    kpiCritical: 'Critical alerts',
    kpiSources: 'Unique source IPs',
    noConfidence: '—',
    chartTrend: 'Alerts (last 12 months)',
    legendElevated: 'Critical / High',
    legendRest: 'Medium / Low / unset',
    chartByType: 'Attack types (from database)',
    donutCenter: 'Types',
    chartBySeverity: 'By severity',
    chartByCategory: 'Confidence distribution',
    dataError: 'Could not load stats from server.',
    actions: {
      alerts: 'Alerts report',
      analytics: 'Analytics',
      monitoring: 'Live monitoring',
    },
  }

  const stages = t.stages
  const total = stats?.total ?? 0
  const bySev = stats?.by_severity ?? { critical: 0, high: 0, medium: 0, low: 0 }
  const criticalCount = bySev.critical ?? 0
  const avgConf = stats?.avg_confidence
  const confDisplay =
    avgConf != null && !Number.isNaN(Number(avgConf))
      ? `${Math.round(Number(avgConf))}%`
      : t.noConfidence
  const uniqueSources = stats?.unique_sources ?? 0

  const kpiCards = useMemo(
    () => [
      { icon: '🛡️', label: t.kpiTotal, value: String(total) },
      { icon: '📊', label: t.kpiConfidence, value: confDisplay },
      { icon: '⚠️', label: t.kpiCritical, value: String(criticalCount), critical: true },
      { icon: '🌐', label: t.kpiSources, value: String(uniqueSources) },
    ],
    [t, total, confDisplay, criticalCount, uniqueSources],
  )

  const byMonth = stats?.by_month ?? []
  const maxMonthTotal = Math.max(1, ...byMonth.map((m) => m.total || 0))

  const donutSlices = useMemo(() => {
    const types = stats?.attack_types ?? []
    if (!total || !types.length) {
      return lang === 'ar'
        ? [{ label: 'لا بيانات', value: 100, color: 'var(--border-input)' }]
        : [{ label: 'No data', value: 100, color: 'var(--border-input)' }]
    }
    return types.slice(0, 3).map((row, i) => ({
      label: row.type,
      value: Math.round(((row.count || 0) / total) * 100),
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }))
  }, [stats, total, lang])

  const donutTypeCount = (stats?.attack_types ?? []).length

  const barSeverity = useMemo(() => {
    const denom = total || 1
    const label = (id) => stages.find((s) => s.id === id)?.label ?? id
    return [
      { label: label('critical'), value: Math.round(((bySev.critical || 0) / denom) * 100) },
      { label: label('high'), value: Math.round(((bySev.high || 0) / denom) * 100) },
      { label: label('medium'), value: Math.round(((bySev.medium || 0) / denom) * 100) },
      { label: label('low'), value: Math.round(((bySev.low || 0) / denom) * 100) },
    ]
  }, [stages, bySev, total])

  const barCategory = useMemo(() => {
    const buckets = stats?.confidence_buckets ?? []
    if (!buckets.length) {
      return [{ label: lang === 'ar' ? 'لا بيانات' : 'No data', value: 0 }]
    }
    return buckets.map((b) => ({
      label: bucketLabel(b.key, lang),
      value: b.pct ?? 0,
    }))
  }, [stats, lang])

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>{t.title}</h1>
        <div className={styles.filterSection}>
          <span className={styles.filterLabel}>{t.stageLabel}</span>
          <div className={styles.filterPills}>
            {stages.map((s) => (
              <button
                key={s.id}
                type="button"
                className={activeStage === s.id ? `${styles.pill} ${styles.pillActive}` : styles.pill}
                onClick={() => setActiveStage(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loadError && (
        <p style={{ color: 'var(--alert-critical)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
          {t.dataError} ({loadError})
        </p>
      )}

      <section className={styles.kpiRow}>
        {kpiCards.map((k) => (
          <div
            key={k.label}
            className={k.critical ? `${styles.kpiCard} ${styles.kpiCritical}` : styles.kpiCard}
          >
            <div className={styles.kpiIcon}>{k.icon}</div>
            <span className={styles.kpiLabel}>{k.label}</span>
            <span className={styles.kpiValue}>{k.value}</span>
          </div>
        ))}
      </section>

      <section className={styles.chartsGrid}>
        <div className={styles.chartWidget}>
          <h3 className={styles.chartTitle}>{t.chartTrend}</h3>
          <div className={styles.areaChart}>
            <div className={styles.areaChartInner}>
              {byMonth.map((m) => (
                <div key={m.ym} className={styles.areaBarWrap}>
                  <div
                    className={styles.areaBar}
                    style={{
                      height: `${((m.elevated || 0) / maxMonthTotal) * 100}%`,
                      background: 'var(--header-purple)',
                    }}
                  />
                  <div
                    className={styles.areaBar}
                    style={{
                      height: `${((m.rest || 0) / maxMonthTotal) * 100}%`,
                      background: 'var(--card-purple)',
                    }}
                  />
                </div>
              ))}
            </div>
            <div className={styles.areaLegend}>
              <span><i style={{ background: 'var(--header-purple)' }} /> {t.legendElevated}</span>
              <span><i style={{ background: 'var(--card-purple)' }} /> {t.legendRest}</span>
            </div>
            <div className={styles.areaMonths}>
              {byMonth.slice(-6).map((m) => (
                <span key={m.ym}>{monthShortLabel(m.ym, lang)}</span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.chartWidget}>
          <h3 className={styles.chartTitle}>{t.chartByType}</h3>
          <div className={styles.donutWrap}>
            <div className={styles.donut}>
              <div className={styles.donutCenter}>
                <span className={styles.donutCenterLabel}>{t.donutCenter}</span>
                <span className={styles.donutCenterValue}>{donutTypeCount}</span>
              </div>
            </div>
            <div className={styles.donutLegend}>
              {donutSlices.map((d) => (
                <span key={d.label}><i style={{ background: d.color }} /> {d.label} {d.value}%</span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.chartWidget}>
          <h3 className={styles.chartTitle}>{t.chartBySeverity}</h3>
          <div className={styles.barChart}>
            {barSeverity.map((b) => (
              <div key={b.label} className={styles.barRow}>
                <span className={styles.barLabel}>{b.label}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${b.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartWidget}>
          <h3 className={styles.chartTitle}>{t.chartByCategory}</h3>
          <div className={styles.barChart}>
            {barCategory.map((b) => (
              <div key={b.label} className={styles.barRow}>
                <span className={styles.barLabel}>{b.label}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${b.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.actions}>
        <Link to={`${linkPrefix}/alerts`} className={styles.actionBtn}>{t.actions.alerts}</Link>
        <Link to={`${linkPrefix}/analytics`} className={styles.actionBtn}>{t.actions.analytics}</Link>
        <Link to={`${linkPrefix}/monitoring`} className={styles.actionBtn}>{t.actions.monitoring}</Link>
      </div>
    </div>
  )
}

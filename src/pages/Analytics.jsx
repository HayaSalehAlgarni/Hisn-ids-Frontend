import { useEffect, useMemo, useState } from 'react'
import styles from './Analytics.module.css'
import { useLang } from '../context/lang'
import { fetchDashboardStats } from '../api/dashboard'

const chartPlaceholder = (label, points) => (
  <div className={styles.chartPlaceholder}>
    <div className={styles.chartBars}>
      {points.map((h, i) => (
        <div
          key={i}
          className={styles.bar}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
    <p className={styles.chartLabel}>{label}</p>
  </div>
)

export default function Analytics() {
  const { lang } = useLang()
  const [period, setPeriod] = useState('7d')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await fetchDashboardStats('all')
        if (mounted) setStats(data)
      } catch {
        if (mounted) setStats(null)
      }
    }
    load()
    const timer = setInterval(load, 10000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  const t = lang === 'ar' ? {
    title: 'التحليلات',
    periods: { '24h': '24 ساعة', '7d': '7 أيام', '30d': '30 يوم' },
    networkTraffic: 'حركة الشبكة',
    threatPatterns: 'نمط التهديدات (آخر 7 أيام)',
    threatTypes: 'أنواع التهديدات',
    kpis: 'مؤشرات الأداء',
    portScan: 'مسح المنافذ',
    logins: 'محاولات الدخول',
    malware: 'برمجيات خبيثة',
    other: 'أخرى',
    recall: 'معدل اكتشاف الهجمات (Recall)',
    fpr: 'معدل الإنذارات الكاذبة (FPR)',
    precision: 'الدقة الإيجابية (Precision)',
    f1: 'درجة F1',
    detectionAccuracy: 'الدقة العامة (Accuracy)',
    noData: 'لا توجد بيانات',
  } : {
    title: 'Analytics',
    periods: { '24h': '24 hours', '7d': '7 days', '30d': '30 days' },
    networkTraffic: 'Network Traffic',
    threatPatterns: 'Threat patterns (last 7 days)',
    threatTypes: 'Threat types',
    kpis: 'KPIs',
    portScan: 'Port scanning',
    logins: 'Login attempts',
    malware: 'Malware',
    other: 'Other',
    recall: 'Attack Detection Rate (Recall)',
    fpr: 'False Positive Rate (FPR)',
    precision: 'Precision',
    f1: 'F1-score',
    detectionAccuracy: 'Accuracy',
    noData: 'No data',
  }

  const threatStats = useMemo(() => {
    const total = stats?.total || 0
    const typeRows = stats?.attack_types || []
    const denom = total || 1
    const countByKeyword = (keyword) =>
      typeRows
        .filter((r) => String(r.type || '').toLowerCase().includes(keyword))
        .reduce((sum, r) => sum + Number(r.count || 0), 0)
    const portScanCount = countByKeyword('scan')
    const loginsCount = countByKeyword('login')
    const malwareCount = countByKeyword('malware')
    const otherCount = Math.max(0, total - portScanCount - loginsCount - malwareCount)
    return {
      portScan: Math.round((portScanCount / denom) * 100),
      logins: Math.round((loginsCount / denom) * 100),
      malware: Math.round((malwareCount / denom) * 100),
      other: Math.round((otherCount / denom) * 100),
      totalCount: total,
    }
  }, [stats])

  const chartHeights = useMemo(() => {
    const points = stats?.by_month || []
    const count = period === '24h' ? 1 : period === '7d' ? 7 : 12
    const slice = points.slice(-count)
    const maxVal = Math.max(1, ...slice.map((p) => Number(p.total || 0)))
    if (!slice.length) return [0]
    return slice.map((p) => Math.round((Number(p.total || 0) / maxVal) * 100))
  }, [stats, period])

  const modelKpis = useMemo(() => {
    const m = stats?.model_metrics || {}
    const fmtPct = (v) => {
      const n = Number(v)
      if (!Number.isFinite(n)) return t.noData
      return `${Math.round(n * 100)}%`
    }
    return {
      recall: fmtPct(m.recall),
      fpr: fmtPct(m.fpr),
      precision: fmtPct(m.precision),
      f1: fmtPct(m.f1),
      accuracy: fmtPct(m.accuracy),
    }
  }, [stats, t.noData])

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t.title}</h2>
        <div className={styles.period}>
          {['24h', '7d', '30d'].map((p) => (
            <button
              key={p}
              type="button"
              className={period === p ? `${styles.periodBtn} ${styles.periodActive}` : styles.periodBtn}
              onClick={() => setPeriod(p)}
            >
              {t.periods[p]}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t.networkTraffic}</h3>
          {chartPlaceholder(t.threatPatterns, chartHeights)}
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t.threatTypes}</h3>
          <ul className={styles.stats}>
            <li><span className={styles.statLabel}>{t.portScan}</span><span className={styles.statValue}>{threatStats.portScan}%</span></li>
            <li><span className={styles.statLabel}>{t.logins}</span><span className={styles.statValue}>{threatStats.logins}%</span></li>
            <li><span className={styles.statLabel}>{t.malware}</span><span className={styles.statValue}>{threatStats.malware}%</span></li>
            <li><span className={styles.statLabel}>{t.other}</span><span className={styles.statValue}>{threatStats.other}%</span></li>
          </ul>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t.kpis}</h3>
          <div className={styles.kpis}>
            <div className={styles.kpi}>
              <span className={styles.kpiValue}>{modelKpis.recall}</span>
              <span className={styles.kpiLabel}>{t.recall}</span>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiValue}>{modelKpis.fpr}</span>
              <span className={styles.kpiLabel}>{t.fpr}</span>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiValue}>{modelKpis.precision}</span>
              <span className={styles.kpiLabel}>{t.precision}</span>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiValue}>{modelKpis.f1}</span>
              <span className={styles.kpiLabel}>{t.f1}</span>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiValue}>{modelKpis.accuracy}</span>
              <span className={styles.kpiLabel}>{t.detectionAccuracy}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

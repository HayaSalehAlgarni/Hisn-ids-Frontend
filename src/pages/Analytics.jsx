import { useState } from 'react'
import styles from './Analytics.module.css'
import { useLang } from '../context/lang'

const chartPlaceholder = (label) => (
  <div className={styles.chartPlaceholder}>
    <div className={styles.chartBars}>
      {[65, 82, 45, 90, 70, 55, 78].map((h, i) => (
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
    detectionAccuracy: 'دقة الكشف',
    avgResponse: 'متوسط زمن الاستجابة',
    todaysThreats: 'تهديدات اليوم',
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
    detectionAccuracy: 'Detection accuracy',
    avgResponse: 'Avg response time',
    todaysThreats: "Today's threats",
  }

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
          {chartPlaceholder(t.threatPatterns)}
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t.threatTypes}</h3>
          <ul className={styles.stats}>
            <li><span className={styles.statLabel}>{t.portScan}</span><span className={styles.statValue}>34%</span></li>
            <li><span className={styles.statLabel}>{t.logins}</span><span className={styles.statValue}>28%</span></li>
            <li><span className={styles.statLabel}>{t.malware}</span><span className={styles.statValue}>22%</span></li>
            <li><span className={styles.statLabel}>{t.other}</span><span className={styles.statValue}>16%</span></li>
          </ul>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t.kpis}</h3>
          <div className={styles.kpis}>
            <div className={styles.kpi}>
              <span className={styles.kpiValue}>97%</span>
              <span className={styles.kpiLabel}>{t.detectionAccuracy}</span>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiValue}>1.2s</span>
              <span className={styles.kpiLabel}>{t.avgResponse}</span>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiValue}>12</span>
              <span className={styles.kpiLabel}>{t.todaysThreats}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

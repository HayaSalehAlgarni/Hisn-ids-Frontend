import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Dashboard.module.css'
import { useLang } from '../context/lang'

const areaChartMonthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const areaChartMonthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const areaChartThreats = [8, 12, 10, 15, 14, 18, 16, 20, 17, 22, 19, 12]
const areaChartAlerts = [3, 5, 4, 6, 7, 9, 8, 10, 9, 11, 10, 3]

export default function Dashboard() {
  const { lang } = useLang()
  const [activeStage, setActiveStage] = useState('all')

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
    kpis: [
      { icon: '🛡️', label: 'التهديدات اليوم', value: '12' },
      { icon: '📊', label: 'دقة الكشف', value: '97%' },
      { icon: '⚠️', label: 'تنبيهات حرجة', value: '3', critical: true },
      { icon: '⏱️', label: 'متوسط زمن الاستجابة', value: '1.2s' },
    ],
    chartThreatsAndAlerts: 'التهديدات والتنبيهات',
    legendThreats: 'تهديدات',
    legendAlerts: 'تنبيهات',
    chartByType: 'التهديدات حسب النوع',
    donutCenter: 'الأنواع',
    donutData: [
      { label: 'مسح منافذ', value: 64, color: 'var(--header-purple)' },
      { label: 'محاولات دخول', value: 27, color: 'var(--card-purple)' },
      { label: 'برمجيات خبيثة', value: 9, color: 'var(--alert-critical)' },
    ],
    chartBySeverity: 'التنبيهات النشطة حسب الخطورة',
    severities: [
      { label: 'حرج', value: 85 },
      { label: 'عالي', value: 60 },
      { label: 'متوسط', value: 45 },
      { label: 'منخفض', value: 25 },
    ],
    chartByCategory: 'الأحداث حسب الفئة',
    categories: [
      { label: 'أقل من 10', value: 95 },
      { label: '10 - 50', value: 70 },
      { label: '50 - 100', value: 45 },
      { label: 'أكثر من 100', value: 25 },
    ],
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
    kpis: [
      { icon: '🛡️', label: "Today's threats", value: '12' },
      { icon: '📊', label: 'Detection accuracy', value: '97%' },
      { icon: '⚠️', label: 'Critical alerts', value: '3', critical: true },
      { icon: '⏱️', label: 'Avg response time', value: '1.2s' },
    ],
    chartThreatsAndAlerts: 'Threats & alerts',
    legendThreats: 'Threats',
    legendAlerts: 'Alerts',
    chartByType: 'Threats by type',
    donutCenter: 'Types',
    donutData: [
      { label: 'Port scan', value: 64, color: 'var(--header-purple)' },
      { label: 'Brute force', value: 27, color: 'var(--card-purple)' },
      { label: 'Malware', value: 9, color: 'var(--alert-critical)' },
    ],
    chartBySeverity: 'Active alerts by severity',
    severities: [
      { label: 'Critical', value: 85 },
      { label: 'High', value: 60 },
      { label: 'Medium', value: 45 },
      { label: 'Low', value: 25 },
    ],
    chartByCategory: 'Events by category',
    categories: [
      { label: '< 10', value: 95 },
      { label: '10 - 50', value: 70 },
      { label: '50 - 100', value: 45 },
      { label: '> 100', value: 25 },
    ],
    actions: {
      alerts: 'Alerts report',
      analytics: 'Analytics',
      monitoring: 'Live monitoring',
    },
  }

  const stages = t.stages
  const kpiCards = t.kpis
  const donutData = t.donutData
  const barSeverity = t.severities
  const barCategory = t.categories
  const areaChartMonths = lang === 'ar' ? areaChartMonthsAr : areaChartMonthsEn

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
          <h3 className={styles.chartTitle}>{t.chartThreatsAndAlerts}</h3>
          <div className={styles.areaChart}>
            <div className={styles.areaChartInner}>
              {areaChartMonths.map((_, i) => (
                <div key={i} className={styles.areaBarWrap}>
                  <div
                    className={styles.areaBar}
                    style={{
                      height: `${(areaChartThreats[i] / 25) * 100}%`,
                      background: 'var(--header-purple)',
                    }}
                  />
                  <div
                    className={styles.areaBar}
                    style={{
                      height: `${(areaChartAlerts[i] / 15) * 100}%`,
                      background: 'var(--card-purple)',
                    }}
                  />
                </div>
              ))}
            </div>
            <div className={styles.areaLegend}>
              <span><i style={{ background: 'var(--header-purple)' }} /> {t.legendThreats}</span>
              <span><i style={{ background: 'var(--card-purple)' }} /> {t.legendAlerts}</span>
            </div>
            <div className={styles.areaMonths}>
              {areaChartMonths.slice(0, 6).map((m) => (
                <span key={m}>{m.slice(0, 3)}</span>
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
                <span className={styles.donutCenterValue}>3</span>
              </div>
            </div>
            <div className={styles.donutLegend}>
              {donutData.map((d) => (
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
        <Link to="/alerts" className={styles.actionBtn}>{t.actions.alerts}</Link>
        <Link to="/analytics" className={styles.actionBtn}>{t.actions.analytics}</Link>
        <Link to="/monitoring" className={styles.actionBtn}>{t.actions.monitoring}</Link>
      </div>
    </div>
  )
}

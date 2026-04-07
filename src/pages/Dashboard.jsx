import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Dashboard.module.css'

const stages = [
  { id: 'all', label: 'الكل' },
  { id: 'critical', label: 'حرج' },
  { id: 'high', label: 'عالي' },
  { id: 'medium', label: 'متوسط' },
  { id: 'low', label: 'منخفض' },
]

const kpiCards = [
  { icon: '🛡️', label: 'التهديدات اليوم', value: '12' },
  { icon: '📊', label: 'دقة الكشف', value: '97%' },
  { icon: '⚠️', label: 'تنبيهات حرجة', value: '3', critical: true },
  { icon: '⏱️', label: 'متوسط زمن الاستجابة', value: '1.2s' },
]

const areaChartMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const areaChartThreats = [8, 12, 10, 15, 14, 18, 16, 20, 17, 22, 19, 12]
const areaChartAlerts = [3, 5, 4, 6, 7, 9, 8, 10, 9, 11, 10, 3]

const donutData = [
  { label: 'مسح منافذ', value: 64, color: 'var(--header-purple)' },
  { label: 'محاولات دخول', value: 27, color: 'var(--card-purple)' },
  { label: 'برمجيات خبيثة', value: 9, color: 'var(--alert-critical)' },
]

const barSeverity = [
  { label: 'حرج', value: 85 },
  { label: 'عالي', value: 60 },
  { label: 'متوسط', value: 45 },
  { label: 'منخفض', value: 25 },
]

const barCategory = [
  { label: 'أقل من 10', value: 95 },
  { label: '10 - 50', value: 70 },
  { label: '50 - 100', value: 45 },
  { label: 'أكثر من 100', value: 25 },
]

export default function Dashboard() {
  const [activeStage, setActiveStage] = useState('all')

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>لوحة الأمن</h1>
        <div className={styles.filterSection}>
          <span className={styles.filterLabel}>مرحلة التهديد</span>
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
          <h3 className={styles.chartTitle}>التهديدات والتنبيهات</h3>
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
              <span><i style={{ background: 'var(--header-purple)' }} /> تهديدات</span>
              <span><i style={{ background: 'var(--card-purple)' }} /> تنبيهات</span>
            </div>
            <div className={styles.areaMonths}>
              {areaChartMonths.slice(0, 6).map((m) => (
                <span key={m}>{m.slice(0, 3)}</span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.chartWidget}>
          <h3 className={styles.chartTitle}>التهديدات حسب النوع</h3>
          <div className={styles.donutWrap}>
            <div className={styles.donut}>
              <div className={styles.donutCenter}>
                <span className={styles.donutCenterLabel}>الأنواع</span>
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
          <h3 className={styles.chartTitle}>التنبيهات النشطة حسب الخطورة</h3>
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
          <h3 className={styles.chartTitle}>الأحداث حسب الفئة</h3>
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
        <Link to="/alerts" className={styles.actionBtn}>تقرير التنبيهات</Link>
        <Link to="/analytics" className={styles.actionBtn}>التحليلات</Link>
        <Link to="/monitoring" className={styles.actionBtn}>المراقبة المباشرة</Link>
      </div>
    </div>
  )
}

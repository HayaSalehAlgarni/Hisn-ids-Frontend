import { useState } from 'react'
import styles from './Analytics.module.css'

const chartPlaceholder = () => (
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
    <p className={styles.chartLabel}>نمط التهديدات (آخر 7 أيام)</p>
  </div>
)

export default function Analytics() {
  const [period, setPeriod] = useState('7d')

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>التحليلات</h2>
        <div className={styles.period}>
          {['24h', '7d', '30d'].map((p) => (
            <button
              key={p}
              type="button"
              className={period === p ? `${styles.periodBtn} ${styles.periodActive}` : styles.periodBtn}
              onClick={() => setPeriod(p)}
            >
              {p === '24h' ? '24 ساعة' : p === '7d' ? '7 أيام' : '30 يوم'}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>حركة الشبكة</h3>
          {chartPlaceholder()}
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>أنواع التهديدات</h3>
          <ul className={styles.stats}>
            <li><span className={styles.statLabel}>مسح المنافذ</span><span className={styles.statValue}>34%</span></li>
            <li><span className={styles.statLabel}>محاولات الدخول</span><span className={styles.statValue}>28%</span></li>
            <li><span className={styles.statLabel}>برمجيات خبيثة</span><span className={styles.statValue}>22%</span></li>
            <li><span className={styles.statLabel}>أخرى</span><span className={styles.statValue}>16%</span></li>
          </ul>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>مؤشرات الأداء</h3>
          <div className={styles.kpis}>
            <div className={styles.kpi}>
              <span className={styles.kpiValue}>97%</span>
              <span className={styles.kpiLabel}>دقة الكشف</span>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiValue}>1.2s</span>
              <span className={styles.kpiLabel}>متوسط زمن الاستجابة</span>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiValue}>12</span>
              <span className={styles.kpiLabel}>تهديدات اليوم</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

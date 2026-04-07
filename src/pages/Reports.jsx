import { useState } from 'react'
import styles from './Reports.module.css'

const reportTypes = [
  { id: 'daily', label: 'تقرير يومي', desc: 'ملخص التهديدات والتنبيهات اليومية', icon: '📅' },
  { id: 'weekly', label: 'تقرير أسبوعي', desc: 'تحليل أسبوعي لأمن الشبكة', icon: '📆' },
  { id: 'incident', label: 'تقرير حوادث', desc: 'تفاصيل الحوادث الحرجة', icon: '🚨' },
  { id: 'compliance', label: 'تقرير الامتثال', desc: 'توافق السياسات والمعايير', icon: '✅' },
  { id: 'suspicious-ip', label: 'تقرير الـ IP المشبوهة', desc: 'قائمة عناوين IP المشبوهة والمحظورة', icon: '🕵️' },
  { id: 'attack-types', label: 'تقرير أنواع الهجمات', desc: 'DNS / Port Scan / Brute Force', icon: '⚔️' },
  { id: 'threat-rate', label: 'تقرير معدل التهديدات بالساعة', desc: 'معدل التهديدات لكل ساعة', icon: '📈' },
]

const exportFormats = [
  { id: 'pdf', label: 'PDF', icon: '📄' },
  { id: 'csv', label: 'CSV', icon: '📊' },
  { id: 'json', label: 'JSON', icon: '{}' },
]

const quickStats = {
  total: 45,
  critical: 5,
  high: 12,
  medium: 18,
  low: 10,
}

export default function Reports() {
  const [selected, setSelected] = useState('daily')
  const [exportFormat, setExportFormat] = useState('pdf')
  const [generating, setGenerating] = useState(false)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => setGenerating(false), 1500)
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>التقارير</h2>

      <div className={styles.quickStats}>
        <div className={styles.statMain}>
          إجمالي التهديدات اليوم: <strong>{quickStats.total}</strong>
        </div>
        <div className={styles.statBreakdown}>
          <span className={styles.statCritical}>CRITICAL: {quickStats.critical}</span>
          <span className={styles.statDivider}>|</span>
          <span className={styles.statHigh}>HIGH: {quickStats.high}</span>
          <span className={styles.statDivider}>|</span>
          <span className={styles.statMedium}>MEDIUM: {quickStats.medium}</span>
          <span className={styles.statDivider}>|</span>
          <span className={styles.statLow}>LOW: {quickStats.low}</span>
        </div>
      </div>

      <div className={styles.card}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>نوع التقرير</h3>
          <div className={styles.typesGrid}>
            {reportTypes.map((r) => (
              <button
                key={r.id}
                type="button"
                className={selected === r.id ? `${styles.typeBtn} ${styles.typeActive}` : styles.typeBtn}
                onClick={() => setSelected(r.id)}
              >
                <span className={styles.typeIcon}>{r.icon}</span>
                <span className={styles.typeLabel}>{r.label}</span>
                <span className={styles.typeDesc}>{r.desc}</span>
              </button>
            ))}
          </div>
        </section>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'جاري التوليد...' : 'توليد التقرير'}
          </button>
          <div className={styles.exportIcons}>
            {exportFormats.map((e) => (
              <button
                key={e.id}
                type="button"
                className={exportFormat === e.id ? `${styles.exportIcon} ${styles.exportIconActive}` : styles.exportIcon}
                onClick={() => setExportFormat(e.id)}
                title={e.label}
              >
                {e.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import styles from './Reports.module.css'
import { useLang } from '../context/lang'
import { fetchAlerts } from '../api/alerts'

const reportTypes = [
  {
    id: 'daily',
    icon: '📅',
    label: { ar: 'تقرير يومي', en: 'Daily report' },
    desc: { ar: 'ملخص التهديدات والتنبيهات اليومية', en: 'Daily threats & alerts summary' },
  },
  {
    id: 'weekly',
    icon: '📆',
    label: { ar: 'تقرير أسبوعي', en: 'Weekly report' },
    desc: { ar: 'تحليل أسبوعي لأمن الشبكة', en: 'Weekly security analysis' },
  },
  {
    id: 'incident',
    icon: '🚨',
    label: { ar: 'تقرير حوادث', en: 'Incident report' },
    desc: { ar: 'تفاصيل الحوادث الحرجة', en: 'Critical incident details' },
  },
  {
    id: 'compliance',
    icon: '✅',
    label: { ar: 'تقرير الامتثال', en: 'Compliance report' },
    desc: { ar: 'توافق السياسات والمعايير', en: 'Policy & standards compliance' },
  },
  {
    id: 'suspicious-ip',
    icon: '🕵️',
    label: { ar: 'تقرير الـ IP المشبوهة', en: 'Suspicious IP report' },
    desc: { ar: 'قائمة عناوين IP المشبوهة والمحظورة', en: 'List of suspicious/blocked IPs' },
  },
  {
    id: 'attack-types',
    icon: '⚔️',
    label: { ar: 'تقرير أنواع الهجمات', en: 'Attack types report' },
    desc: { ar: 'DNS / Port Scan / Brute Force', en: 'DNS / Port scan / Brute force' },
  },
  {
    id: 'threat-rate',
    icon: '📈',
    label: { ar: 'تقرير معدل التهديدات بالساعة', en: 'Hourly threat rate' },
    desc: { ar: 'معدل التهديدات لكل ساعة', en: 'Threat rate per hour' },
  },
]

const exportFormats = [
  { id: 'pdf', label: 'PDF', icon: '📄' },
  { id: 'csv', label: 'CSV', icon: '📊' },
]

export default function Reports() {
  const { lang } = useLang()
  const [selected, setSelected] = useState('daily')
  const [exportFormat, setExportFormat] = useState('pdf')
  const [generating, setGenerating] = useState(false)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const rows = await fetchAlerts()
        if (mounted) setAlerts(rows)
      } catch {
        if (mounted) setAlerts([])
      }
    }
    load()
    const timer = setInterval(load, 10000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  const quickStats = useMemo(() => ({
    total: alerts.length,
    critical: alerts.filter((a) => String(a.severity || '').toLowerCase() === 'critical').length,
    high: alerts.filter((a) => String(a.severity || '').toLowerCase() === 'high').length,
    medium: alerts.filter((a) => String(a.severity || '').toLowerCase() === 'medium').length,
    low: alerts.filter((a) => String(a.severity || '').toLowerCase() === 'low').length,
  }), [alerts])

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => setGenerating(false), 1500)
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{lang === 'ar' ? 'التقارير' : 'Reports'}</h2>

      <div className={styles.quickStats}>
        <div className={styles.statMain}>
          {lang === 'ar' ? 'إجمالي التهديدات اليوم:' : "Today's total threats:"}{' '}
          <strong>{quickStats.total}</strong>
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
          <h3 className={styles.sectionTitle}>{lang === 'ar' ? 'نوع التقرير' : 'Report type'}</h3>
          <div className={styles.typesGrid}>
            {reportTypes.map((r) => (
              <button
                key={r.id}
                type="button"
                className={selected === r.id ? `${styles.typeBtn} ${styles.typeActive}` : styles.typeBtn}
                onClick={() => setSelected(r.id)}
              >
                <span className={styles.typeIcon}>{r.icon}</span>
                <span className={styles.typeLabel}>{r.label[lang] ?? r.label.en}</span>
                <span className={styles.typeDesc}>{r.desc[lang] ?? r.desc.en}</span>
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
            {generating
              ? (lang === 'ar' ? 'جاري التوليد...' : 'Generating...')
              : (lang === 'ar' ? 'توليد التقرير' : 'Generate report')}
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

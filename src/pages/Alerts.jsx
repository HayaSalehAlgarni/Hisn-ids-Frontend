import { useState, useMemo, useEffect, useCallback } from 'react'
import styles from './Alerts.module.css'
import { useLang } from '../context/lang'
import { fetchAlerts, toUiAlert } from '../api/alerts'

const TYPE_CONFIG = {
  login: { label: { ar: 'دخول', en: 'Login' }, icon: '🔐' },
  scan: { label: { ar: 'مسح', en: 'Scan' }, icon: '🔍' },
  traffic: { label: { ar: 'حركة', en: 'Traffic' }, icon: '📡' },
}

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

const mapType = (typeValue) => {
  const value = String(typeValue || '').toLowerCase()
  if (value.includes('suspicious')) return 'scan'
  if (value.includes('dns')) return 'traffic'
  return 'traffic'
}

export default function Alerts() {
  const { lang } = useLang()
  const [alerts, setAlerts] = useState([])
  const [filter, setFilter] = useState('all')
  const [detailsId, setDetailsId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  const t = lang === 'ar' ? {
    title: 'التنبيهات',
    filters: { all: 'الكل', critical: 'حرج', high: 'عالي', medium: 'متوسط', low: 'منخفض' },
    details: 'تفاصيل',
    resolved: 'تم المعالجة',
    empty: 'لا توجد تنبيهات تطابق الفلتر.',
    loading: 'جاري تحميل التنبيهات...',
    loadError: 'تعذر جلب التنبيهات من الخادم.',
    src: 'المصدر:',
    dst: 'الوجهة:',
    time: 'الوقت:',
    type: 'النوع:',
    protocol: 'البروتوكول:',
  } : {
    title: 'Alerts',
    filters: { all: 'All', critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' },
    details: 'Details',
    resolved: 'Resolve',
    empty: 'No alerts match the selected filter.',
    loading: 'Loading alerts...',
    loadError: 'Failed to load alerts from server.',
    src: 'Source:',
    dst: 'Destination:',
    time: 'Time:',
    type: 'Type:',
    protocol: 'Protocol:',
  }

  const fetchAlerts = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true)
    try {
      const data = await fetchAlerts()
      const mapped = data.map((row) => {
        const alert = toUiAlert(row)
        return { ...alert, type: mapType(alert.type), archived: false }
      })
      setAlerts(mapped)
      setApiError('')
    } catch (e) {
      setApiError(e?.message || t.loadError)
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [t.loadError])

  useEffect(() => {
    fetchAlerts(true)
    const timer = setInterval(() => {
      fetchAlerts(false)
    }, 10000)
    return () => clearInterval(timer)
  }, [fetchAlerts])

  const markResolved = (id) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, archived: true } : a)))
    setDetailsId(null)
  }

  const activeAlerts = useMemo(() => alerts.filter((a) => !a.archived), [alerts])

  const filtered = useMemo(() => {
    let list = filter === 'all' ? activeAlerts : activeAlerts.filter((a) => a.severity === filter)
    return [...list].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
  }, [activeAlerts, filter])

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t.title}</h2>
        <div className={styles.filters}>
          {['all', 'critical', 'high', 'medium', 'low'].map((f) => (
            <button
              key={f}
              type="button"
              className={filter === f ? `${styles.filterBtn} ${styles.filterActive}` : styles.filterBtn}
              onClick={() => setFilter(f)}
            >
              {t.filters[f] ?? f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.cardsGrid}>
        {filtered.map((a) => {
          const typeInfo = TYPE_CONFIG[a.type] || TYPE_CONFIG.traffic
          return (
            <article
              key={a.id}
              className={`${styles.alertCard} ${styles[`card_${a.severity}`]}`}
            >
              <div className={styles.cardLeftBorder} />
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={styles.typeIcon} title={typeInfo.label[lang] ?? typeInfo.label.en}>
                    {typeInfo.icon}
                  </span>
                  <span className={`${styles.severityBadge} ${styles[`badge_${a.severity}`]}`}>
                    {a.severity.toUpperCase()}
                  </span>
                </div>
                <h3 className={styles.alertTitle}>{a.title?.[lang] ?? a.title?.en ?? a.title}</h3>
                <div className={styles.alertMeta}>
                  <span className={styles.source}>
                    <code>{a.source}</code>
                  </span>
                  <span className={styles.time}>{a.time}</span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.btnDetails}
                    onClick={() => setDetailsId(detailsId === a.id ? null : a.id)}
                  >
                    {t.details}
                  </button>
                  <button
                    type="button"
                    className={styles.btnResolved}
                    onClick={() => markResolved(a.id)}
                  >
                    {t.resolved}
                  </button>
                </div>
                {detailsId === a.id && (
                  <div className={styles.detailsPanel}>
                    <p><strong>{t.src}</strong> {a.source}</p>
                    <p><strong>{t.dst}</strong> {a.destination}</p>
                    <p><strong>{t.time}</strong> {a.time}</p>
                    <p><strong>{t.type}</strong> {typeInfo.label[lang] ?? typeInfo.label.en}</p>
                    <p><strong>{t.protocol}</strong> {a.protocol}</p>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {loading && (
        <div className={styles.empty}>
          <p>{t.loading}</p>
        </div>
      )}

      {!loading && apiError && (
        <div className={styles.empty}>
          <p>{t.loadError}</p>
          <p>{apiError}</p>
        </div>
      )}

      {!loading && !apiError && filtered.length === 0 && (
        <div className={styles.empty}>
          <p>{t.empty}</p>
        </div>
      )}
    </div>
  )
}

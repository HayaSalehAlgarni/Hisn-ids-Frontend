import { useState, useMemo } from 'react'
import styles from './Alerts.module.css'

const TYPE_CONFIG = {
  login: { label: 'دخول', icon: '🔐' },
  scan: { label: 'مسح', icon: '🔍' },
  traffic: { label: 'حركة', icon: '📡' },
}

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

const initialAlerts = [
  { id: 1, title: 'محاولة تسجيل دخول فاشلة متعددة', source: '192.168.1.50', time: '17:05:43', severity: 'critical', type: 'login', archived: false },
  { id: 2, title: 'مسح منافذ مشبوه', source: '10.0.0.22', time: '16:58:12', severity: 'high', type: 'scan', archived: false },
  { id: 3, title: 'حركة غير عادية', source: '192.168.1.105', time: '16:45:30', severity: 'medium', type: 'traffic', archived: false },
  { id: 4, title: 'تحديث نظام', source: 'System', time: '16:30:00', severity: 'low', type: 'traffic', archived: false },
  { id: 5, title: 'محاولة دخول غير مصرح', source: '192.168.1.88', time: '16:22:18', severity: 'critical', type: 'login', archived: false },
  { id: 6, title: 'مسح شبكة من مصدر خارجي', source: '10.0.0.5', time: '16:15:00', severity: 'high', type: 'scan', archived: false },
]

export default function Alerts() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [filter, setFilter] = useState('all')
  const [detailsId, setDetailsId] = useState(null)

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
        <h2 className={styles.title}>التنبيهات</h2>
        <div className={styles.filters}>
          {['all', 'critical', 'high', 'medium', 'low'].map((f) => (
            <button
              key={f}
              type="button"
              className={filter === f ? `${styles.filterBtn} ${styles.filterActive}` : styles.filterBtn}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'الكل' : f.toUpperCase()}
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
                  <span className={styles.typeIcon} title={typeInfo.label}>
                    {typeInfo.icon}
                  </span>
                  <span className={`${styles.severityBadge} ${styles[`badge_${a.severity}`]}`}>
                    {a.severity.toUpperCase()}
                  </span>
                </div>
                <h3 className={styles.alertTitle}>{a.title}</h3>
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
                    تفاصيل
                  </button>
                  <button
                    type="button"
                    className={styles.btnResolved}
                    onClick={() => markResolved(a.id)}
                  >
                    تم المعالجة
                  </button>
                </div>
                {detailsId === a.id && (
                  <div className={styles.detailsPanel}>
                    <p><strong>المصدر:</strong> {a.source}</p>
                    <p><strong>الوقت:</strong> {a.time}</p>
                    <p><strong>النوع:</strong> {typeInfo.label}</p>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>
          <p>لا توجد تنبيهات تطابق الفلتر.</p>
        </div>
      )}
    </div>
  )
}

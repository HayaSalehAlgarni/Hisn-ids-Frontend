import { useState, useEffect, useMemo } from 'react'
import styles from './LiveMonitoring.module.css'

const TYPE_OPTIONS = [
  { id: 'all', label: 'الكل' },
  { id: 'DNS', label: 'DNS' },
  { id: 'Suspicious', label: 'مشبوه' },
  { id: 'Normal', label: 'عادي' },
]

const SEVERITY_OPTIONS = [
  { id: 'all', label: 'الكل' },
  { id: 'high', label: 'HIGH' },
  { id: 'medium', label: 'MEDIUM' },
  { id: 'low', label: 'LOW' },
]

const TYPE_ICONS = {
  DNS: '🌐',
  Suspicious: '⚠️',
  Normal: '✓',
}

const typeFromLabel = (label) => {
  if (label.includes('DNS') || label === 'DNS query') return 'DNS'
  if (label.includes('Suspicious') || label.includes('port scan') || label.includes('intrusion') || label.includes('failed logins')) return 'Suspicious'
  return 'Normal'
}

const generateMockEvents = (count = 150) => {
  const types = ['DNS query', 'Suspicious port scan', 'Normal traffic', 'Multiple failed logins', 'HTTPS', 'Possible intrusion']
  const severities = ['high', 'medium', 'low']
  const events = []
  const now = Date.now()
  for (let i = 0; i < count; i++) {
    const severity = severities[Math.floor(Math.random() * 3)]
    const typeLabel = types[Math.floor(Math.random() * types.length)]
    events.push({
      id: now - i * 1000,
      time: new Date(now - i * 1000).toLocaleTimeString('en-GB', { hour12: false }),
      src: `192.168.1.${Math.floor(Math.random() * 255)}`,
      dst: `10.0.0.${Math.floor(Math.random() * 50)}`,
      type: typeLabel,
      typeKey: typeFromLabel(typeLabel),
      severity,
    })
  }
  return events
}

const initialEvents = generateMockEvents(150)

export default function LiveMonitoring() {
  const [events, setEvents] = useState(initialEvents)
  const [live, setLive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(() => Date.now())
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [searchIp, setSearchIp] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)

  useEffect(() => {
    if (!live) return
    const t = setInterval(() => {
      const newEvent = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        src: `192.168.1.${Math.floor(Math.random() * 255)}`,
        dst: `10.0.0.${Math.floor(Math.random() * 50)}`,
        type: ['Normal traffic', 'Suspicious activity', 'DNS query'][Math.floor(Math.random() * 3)],
        typeKey: ['Normal', 'Suspicious', 'DNS'][Math.floor(Math.random() * 3)],
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      }
      setEvents((prev) => [newEvent, ...prev.slice(0, 149)])
      setLastUpdate(Date.now())
    }, 3000)
    return () => clearInterval(t)
  }, [live])

  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0)
  useEffect(() => {
    if (!live) return
    const t = setInterval(() => {
      setSecondsSinceUpdate(Math.floor((Date.now() - lastUpdate) / 1000))
    }, 1000)
    return () => clearInterval(t)
  }, [live, lastUpdate])

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filterSeverity !== 'all' && e.severity !== filterSeverity) return false
      if (filterType !== 'all' && e.typeKey !== filterType) return false
      if (searchIp.trim()) {
        const ip = searchIp.trim()
        if (!e.src.includes(ip) && !e.dst.includes(ip)) return false
      }
      return true
    })
  }, [events, filterSeverity, filterType, searchIp])

  const stats = useMemo(() => {
    const high = events.filter((e) => e.severity === 'high').length
    const medium = events.filter((e) => e.severity === 'medium').length
    const low = events.filter((e) => e.severity === 'low').length
    return { high, medium, low }
  }, [events])

  const paginated = useMemo(() => {
    const start = page * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>المراقبة المباشرة</h2>
        <div className={styles.controls}>
          <span className={styles.lastUpdate}>
            {live ? `آخر تحديث منذ ${secondsSinceUpdate} ثانية` : 'متوقف'}
          </span>
          <span className={styles.status}>
            <span className={live ? styles.indicatorOn : styles.indicatorOff} />
            {live ? 'مباشر' : 'متوقف'}
          </span>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => {
              setLive(!live)
              if (!live) setLastUpdate(Date.now())
            }}
          >
            {live ? 'إيقاف' : 'تشغيل'}
          </button>
        </div>
      </div>

      <div className={styles.quickStats}>
        <span className={styles.statHigh}>HIGH: {stats.high}</span>
        <span className={styles.statDivider}>|</span>
        <span className={styles.statMedium}>MEDIUM: {stats.medium}</span>
        <span className={styles.statDivider}>|</span>
        <span className={styles.statLow}>LOW: {stats.low}</span>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>الأولوية</label>
          <div className={styles.filterPills}>
            {SEVERITY_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={filterSeverity === o.id ? `${styles.pill} ${styles.pillActive}` : styles.pill}
                onClick={() => setFilterSeverity(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>النوع</label>
          <div className={styles.filterPills}>
            {TYPE_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={filterType === o.id ? `${styles.pill} ${styles.pillActive}` : styles.pill}
                onClick={() => setFilterType(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.searchGroup}>
          <label className={styles.filterLabel}>بحث بالـ IP</label>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="مثال: 192.168.1"
            value={searchIp}
            onChange={(e) => {
              setSearchIp(e.target.value)
              setPage(0)
            }}
          />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tableHeader}>
          <span className={styles.recordCount}>
            عرض {paginated.length} من {filtered.length}
          </span>
          <div className={styles.pageSizeWrap}>
            <label className={styles.pageSizeLabel}>عرض:</label>
            <select
              className={styles.pageSizeSelect}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(0)
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>الوقت</th>
                <th>المصدر</th>
                <th>الوجهة</th>
                <th>النوع</th>
                <th>الأولوية</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((e) => (
                <tr key={e.id} className={styles[`row_${e.severity}`]}>
                  <td>{e.time}</td>
                  <td><code>{e.src}</code></td>
                  <td><code>{e.dst}</code></td>
                  <td>
                    <span className={styles.typeCell}>
                      <span className={styles.typeIcon}>{TYPE_ICONS[e.typeKey] || '•'}</span>
                      {e.type}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge_${e.severity}`]}`}>
                      {e.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              السابق
            </button>
            <span className={styles.pageInfo}>
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

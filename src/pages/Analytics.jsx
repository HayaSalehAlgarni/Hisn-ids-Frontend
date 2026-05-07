import { useMemo, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { animate, motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import styles from './Analytics.module.css'
import { useLang } from '../context/lang'
import {
  fetchAnalyticsSummary,
  fetchAnalyticsTraffic,
  fetchModelStats,
  postDetect,
} from '../api/analytics'

const PRIMARY = '#7C3AED'
const TRAFFIC_NORMAL = '#7C3AED'
const TRAFFIC_THREAT = '#DC2626'

const THREAT_KEYS = ['port_scan', 'brute_force', 'malware', 'other']
const THREAT_COLORS = {
  port_scan: '#EA580C',
  brute_force: '#EF4444',
  malware: '#991B1B',
  other: '#6B7280',
}

function formatAccuracyPercent(raw) {
  if (raw == null || Number.isNaN(Number(raw))) return null
  const n = Number(raw)
  if (n <= 1 && n >= 0) return Math.round(n * 100)
  return Math.round(n)
}

function formatTickLabel(isoTs, period) {
  const d = new Date(isoTs)
  if (Number.isNaN(d.getTime())) return isoTs
  if (period === '24h') {
    return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
}

function AnimatedCounter({ value, className, localeDigits }) {
  const ref = useRef(null)
  const prev = useRef(value)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const from = prev.current
    const to = Number(value) || 0
    prev.current = to
    const controls = animate(from, to, {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        node.textContent = Math.round(v).toLocaleString(localeDigits ? 'ar-SA' : undefined)
      },
    })
    return () => controls.stop()
  }, [value, localeDigits])

  return (
    <span ref={ref} className={className}>
      {Math.round(Number(value) || 0).toLocaleString(localeDigits ? 'ar-SA' : undefined)}
    </span>
  )
}

function TrafficChartSkeleton() {
  return (
    <div className={styles.chartSkeleton} aria-hidden>
      <div className={styles.chartSkeletonInner} />
    </div>
  )
}

function ThreatSkeleton() {
  return (
    <div className={styles.threatSkeleton}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.threatSkeletonRow}>
          <div className={styles.shimmer} />
          <div className={styles.shimmer} style={{ width: '40%' }} />
        </div>
      ))}
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div className={styles.kpiSkeleton}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.kpiSkeletonBlock}>
          <div className={`${styles.shimmer} ${styles.kpiSkTitle}`} />
          <div className={`${styles.shimmer} ${styles.kpiSkVal}`} />
        </div>
      ))}
    </div>
  )
}

const SIG_LABELS_AR = {
  known_malicious_source_ip: 'عنوان IP خبيث معروف',
  malware_sinkhole_port_hint: 'منفذ مرتبط ببرمجيات خبيثة',
  port_scan_many_unique_dest_ports_60s: 'مسح منافذ (عدة وجهات)',
  brute_force_ssh_rdp_burst_heuristic: 'تخمين كلمات مرور SSH/RDP',
  explicit_auth_failure_marker: 'فشل مصادقة صريح',
}

function signatureLabel(sig, lang) {
  if (lang === 'ar' && SIG_LABELS_AR[sig]) return SIG_LABELS_AR[sig]
  return sig.replace(/_/g, ' ')
}

function formatAxiosDetail(err) {
  const d = err?.response?.data?.detail
  if (d == null) return err?.message || ''
  if (typeof d === 'string') return d
  if (Array.isArray(d)) {
    return d
      .map((x) => (typeof x === 'object' && x?.msg ? x.msg : JSON.stringify(x)))
      .join(' ')
  }
  return String(d)
}

/** After Flask→JWT fix: 401 = old session; 404 = stale FastAPI without /api/analytics/summary routes */
function analyticsFailureHint(err, lang) {
  const status = err?.response?.status
  if (status === 401) {
    return lang === 'ar'
      ? ' سجّل الخروج ثم أعد تسجيل الدخول.'
      : ' Log out and sign in again.'
  }
  if (status === 404) {
    return lang === 'ar'
      ? ' أعد تشغيل خادم FastAPI (uvicorn على المنفذ 8000) من مجلد backend.'
      : ' Restart FastAPI (uvicorn on port 8000) from the backend folder.'
  }
  return ''
}

export default function Analytics() {
  const { lang } = useLang()
  const [period, setPeriod] = useState('7d')
  const [detectIp, setDetectIp] = useState('')
  const [detectPort, setDetectPort] = useState('')
  const [detectProto, setDetectProto] = useState('TCP')

  const summaryQuery = useQuery({
    queryKey: ['analytics', 'summary', period],
    queryFn: () => fetchAnalyticsSummary(period),
    refetchInterval: 30_000,
  })

  const trafficQuery = useQuery({
    queryKey: ['analytics', 'traffic', period],
    queryFn: () => fetchAnalyticsTraffic(period),
    refetchInterval: 30_000,
  })

  const modelStatsQuery = useQuery({
    queryKey: ['analytics', 'model-stats'],
    queryFn: fetchModelStats,
    refetchInterval: 30_000,
    retry: false,
  })

  const detectMutation = useMutation({
    mutationFn: postDetect,
  })

  const t =
    lang === 'ar'
      ? {
          title: 'التحليلات',
          periods: { '24h': '24 ساعة', '7d': '7 أيام', '30d': '30 يوم' },
          networkTraffic: 'حركة الشبكة',
          threatPatterns: (p) =>
            p === '24h'
              ? 'نمط التهديدات (آخر 24 ساعة)'
              : p === '7d'
                ? 'نمط التهديدات (آخر 7 أيام)'
                : 'نمط التهديدات (آخر 30 يوماً)',
          threatTypes: 'أنواع التهديدات',
          kpis: 'مؤشرات الأداء',
          portScan: 'مسح المنافذ',
          logins: 'محاولات الدخول',
          malware: 'برمجيات خبيثة',
          other: 'أخرى',
          detectionAccuracy: 'دقة الكشف',
          uniqueSources: 'مصادر IP فريدة',
          todaysThreats: 'تهديدات اليوم',
          f1Score: 'درجة F1 للنموذج',
          noData: 'لا توجد بيانات',
          na: '—',
          unavailable: 'غير متاح',
          chartEmpty: 'لا توجد بيانات للفترة المحددة',
          errorBanner: 'تعذّر تحميل التحليلات. تحقق من الاتصال بالخادم.',
          liveTitle: 'اختبار الكشف المباشر',
          sourceIp: 'عنوان المصدر',
          port: 'المنفذ',
          protocol: 'البروتوكول',
          testBtn: 'اختبر الكشف',
          mlEngine: 'تصنيف التعلم الآلي',
          anomalyEngine: 'درجة الشذوذ',
          signatureEngine: 'التوقيعات',
          cleanSig: 'نظيف ✓',
          verdictClean: 'نظيف',
          verdictSuspicious: 'مشبوه',
          verdictDangerous: 'خطير',
          confidence: 'الثقة',
        }
      : {
          title: 'Analytics',
          periods: { '24h': '24 hours', '7d': '7 days', '30d': '30 days' },
          networkTraffic: 'Network traffic',
          threatPatterns: (p) =>
            p === '24h'
              ? 'Threat pattern (last 24 hours)'
              : p === '7d'
                ? 'Threat pattern (last 7 days)'
                : 'Threat pattern (last 30 days)',
          threatTypes: 'Threat types',
          kpis: 'Performance KPIs',
          portScan: 'Port scanning',
          logins: 'Login attempts',
          malware: 'Malware',
          other: 'Other',
          detectionAccuracy: 'Detection accuracy',
          uniqueSources: 'Unique source IPs',
          todaysThreats: "Today's threats",
          f1Score: 'Model F1 score',
          noData: 'No data',
          na: '—',
          unavailable: 'Unavailable',
          chartEmpty: 'No data for the selected period',
          errorBanner: 'Could not load analytics. Check server connection.',
          liveTitle: 'Live detection test',
          sourceIp: 'Source IP',
          port: 'Port',
          protocol: 'Protocol',
          testBtn: 'Run detection',
          mlEngine: 'ML classification',
          anomalyEngine: 'Anomaly score',
          signatureEngine: 'Signature match',
          cleanSig: 'Clean ✓',
          verdictClean: 'Clean',
          verdictSuspicious: 'Suspicious',
          verdictDangerous: 'Malicious',
          confidence: 'Confidence',
        }

  const threatLabels = useMemo(
    () => ({
      port_scan: t.portScan,
      brute_force: t.logins,
      malware: t.malware,
      other: t.other,
    }),
    [t]
  )

  const summary = summaryQuery.data
  const trafficRows = trafficQuery.data

  const chartData = useMemo(() => {
    if (!Array.isArray(trafficRows)) return []
    return trafficRows.map((row) => ({
      ...row,
      label: formatTickLabel(row.timestamp, period),
    }))
  }, [trafficRows, period])

  const hasTrafficPoints = chartData.length > 0

  const summaryError = summaryQuery.isError
  const trafficError = trafficQuery.isError
  const showErrorBanner = summaryError || trafficError
  const analyticsHint = analyticsFailureHint(summaryQuery.error || trafficQuery.error, lang)

  const accuracyNum = summary ? formatAccuracyPercent(summary.detection_accuracy) : null
  const accuracyColorClass =
    accuracyNum == null
      ? ''
      : accuracyNum > 90
        ? styles.accGood
        : accuracyNum > 70
          ? styles.accWarn
          : styles.accBad

  const f1Raw = modelStatsQuery.data?.f1
  const f1Display = useMemo(() => {
    if (modelStatsQuery.isError || f1Raw == null) return null
    const n = Number(f1Raw)
    if (Number.isNaN(n)) return null
    return n <= 1 ? (n * 100).toFixed(1) : String(Math.round(n))
  }, [f1Raw, modelStatsQuery.isError])

  const verdictUi = (code) => {
    const c = String(code || '').toLowerCase()
    if (c === 'clean')
      return { text: t.verdictClean, className: styles.verdictClean }
    if (c === 'suspicious')
      return { text: t.verdictSuspicious, className: styles.verdictSuspicious }
    if (c === 'malicious')
      return { text: t.verdictDangerous, className: styles.verdictDangerous }
    return { text: code || t.na, className: styles.verdictSuspicious }
  }

  const onSubmitDetect = (e) => {
    e.preventDefault()
    const portNum = parseInt(detectPort, 10)
    detectMutation.mutate({
      source_ip: detectIp.trim() || '0.0.0.0',
      dest_ip: '',
      port: Number.isFinite(portNum) ? portNum : 0,
      protocol: detectProto,
      bytes: 0,
      duration: 0,
      flags: '',
    })
  }

  const engines = detectMutation.data?.engines
  const ml = engines?.ml_classification
  const ano = engines?.anomaly
  const sig = engines?.signature
  const rawMlConf = ml?.confidence != null ? Number(ml.confidence) : 0
  const mlConfPct =
    rawMlConf <= 1 && rawMlConf >= 0
      ? Math.min(100, Math.max(0, rawMlConf * 100))
      : Math.min(100, Math.max(0, rawMlConf))

  const verdictInfo = detectMutation.data
    ? verdictUi(detectMutation.data.final_verdict)
    : null

  const anomalyScore = ano?.score != null ? Math.min(100, Math.max(0, Number(ano.score))) : 0
  const pieGaugeData = [
    { name: 'score', value: anomalyScore, fill: PRIMARY },
    { name: 'rest', value: Math.max(0, 100 - anomalyScore), fill: '#EDE9FE' },
  ]

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t.title}</h2>
        <div className={styles.period}>
          {['24h', '7d', '30d'].map((p) => (
            <button
              key={p}
              type="button"
              className={
                period === p ? `${styles.periodBtn} ${styles.periodActive}` : styles.periodBtn
              }
              onClick={() => setPeriod(p)}
            >
              {t.periods[p]}
            </button>
          ))}
        </div>
      </div>

      {showErrorBanner && (
        <div className={styles.errorBanner} role="alert">
          {t.errorBanner}
          {analyticsHint}
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t.networkTraffic}</h3>
          {trafficQuery.isLoading ? (
            <TrafficChartSkeleton />
          ) : trafficError ? (
            <div className={styles.inlineMuted}>{t.unavailable}</div>
          ) : !hasTrafficPoints ? (
            <div className={styles.chartEmpty}>{t.chartEmpty}</div>
          ) : (
            <div className={styles.chartWrap} dir="ltr">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillNormal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={TRAFFIC_NORMAL} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={TRAFFIC_NORMAL} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="fillThreat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={TRAFFIC_THREAT} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={TRAFFIC_THREAT} stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const row = payload[0]?.payload
                      if (!row) return null
                      return (
                        <div className={styles.chartTooltip}>
                          <div className={styles.tooltipTs}>{row.timestamp}</div>
                          <div>
                            {lang === 'ar' ? 'عادي' : 'Normal'}: <strong>{row.normal ?? 0}</strong>
                          </div>
                          <div>
                            {lang === 'ar' ? 'تهديد' : 'Threat'}: <strong>{row.threats ?? 0}</strong>
                          </div>
                          <div>
                            {lang === 'ar' ? 'الإجمالي' : 'Total'}: <strong>{row.total ?? 0}</strong>
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="normal"
                    name={lang === 'ar' ? 'عادي' : 'Normal'}
                    stroke={TRAFFIC_NORMAL}
                    fill="url(#fillNormal)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="threats"
                    name={lang === 'ar' ? 'تهديد' : 'Threat'}
                    stroke={TRAFFIC_THREAT}
                    fill="url(#fillThreat)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <p className={styles.chartFoot}>{t.threatPatterns(period)}</p>
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t.threatTypes}</h3>
          {summaryQuery.isLoading ? (
            <ThreatSkeleton />
          ) : summaryError ? (
            <div className={styles.inlineMuted}>{t.unavailable}</div>
          ) : (
            <ul className={styles.threatList}>
              {THREAT_KEYS.map((key) => {
                const entry = summary?.threat_types?.[key] || { count: 0, percentage: 0 }
                const pct = Math.min(100, Math.max(0, Number(entry.percentage) || 0))
                const cnt = Number(entry.count) || 0
                return (
                  <li key={key} className={styles.threatRow}>
                    <div className={styles.threatTop}>
                      <span className={styles.threatName}>{threatLabels[key]}</span>
                      <span className={styles.threatNums}>
                        {cnt} · {pct.toFixed(pct % 1 === 0 ? 0 : 1)}%
                      </span>
                    </div>
                    <div className={styles.progressTrack}>
                      <motion.div
                        className={styles.progressFill}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                          background: THREAT_COLORS[key],
                        }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t.kpis}</h3>
          {summaryQuery.isLoading ? (
            <KpiSkeleton />
          ) : summaryError ? (
            <div className={styles.inlineMuted}>{t.unavailable}</div>
          ) : (
            <div className={styles.kpis}>
              <div className={styles.kpi}>
                <span className={`${styles.kpiValue} ${accuracyColorClass}`}>
                  {accuracyNum != null ? `${accuracyNum}%` : t.noData}
                </span>
                <span className={styles.kpiLabel}>{t.detectionAccuracy}</span>
              </div>
              <div className={styles.kpi}>
                <AnimatedCounter
                  value={summary?.unique_ips ?? 0}
                  className={styles.kpiValue}
                  localeDigits={lang === 'ar'}
                />
                <span className={styles.kpiLabel}>{t.uniqueSources}</span>
              </div>
              <div className={styles.kpi}>
                <span className={styles.kpiThreatWrap}>
                  <AnimatedCounter
                    value={summary?.threats_today ?? 0}
                    className={styles.kpiValue}
                    localeDigits={lang === 'ar'}
                  />
                  {(summary?.threats_today ?? 0) > 0 && (
                    <span className={styles.threatBadge} aria-label="threats">
                      !
                    </span>
                  )}
                </span>
                <span className={styles.kpiLabel}>{t.todaysThreats}</span>
              </div>
              <div className={styles.kpi}>
                <span className={styles.kpiValue}>
                  {modelStatsQuery.isLoading ? (
                    <span className={styles.inlineMuted}>…</span>
                  ) : f1Display != null ? (
                    `${f1Display}%`
                  ) : (
                    t.unavailable
                  )}
                </span>
                <span className={styles.kpiLabel}>{t.f1Score}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className={styles.liveSection}>
        <h3 className={styles.liveTitle}>{t.liveTitle}</h3>
        <form className={styles.detectForm} onSubmit={onSubmitDetect}>
          <label className={styles.field}>
            <span>{t.sourceIp}</span>
            <input
              className={styles.input}
              value={detectIp}
              onChange={(e) => setDetectIp(e.target.value)}
              placeholder="192.168.1.1"
              dir="ltr"
            />
          </label>
          <label className={styles.field}>
            <span>{t.port}</span>
            <input
              className={styles.input}
              type="number"
              min={0}
              max={65535}
              value={detectPort}
              onChange={(e) => setDetectPort(e.target.value)}
              placeholder="443"
              dir="ltr"
            />
          </label>
          <label className={styles.field}>
            <span>{t.protocol}</span>
            <select
              className={styles.select}
              value={detectProto}
              onChange={(e) => setDetectProto(e.target.value)}
            >
              <option>TCP</option>
              <option>UDP</option>
              <option>ICMP</option>
              <option>SCTP</option>
            </select>
          </label>
          <button
            type="submit"
            className={styles.detectBtn}
            disabled={detectMutation.isPending}
          >
            {detectMutation.isPending ? '…' : t.testBtn}
          </button>
        </form>

        {detectMutation.isError && (
          <p className={styles.detectErr}>{formatAxiosDetail(detectMutation.error) || t.unavailable}</p>
        )}

        {detectMutation.data && (
          <div className={styles.detectResults}>
            <div className={styles.verdictRow}>
              <span className={styles.verdictLabel}>{lang === 'ar' ? 'النتيجة' : 'Verdict'}</span>
              <span className={verdictInfo?.className}>
                {verdictInfo?.text}
              </span>
            </div>

            <div className={styles.engineGrid}>
              <div className={styles.engineCard}>
                <h4 className={styles.engineTitle}>{t.mlEngine}</h4>
                <p className={styles.engineMeta}>
                  <strong>{ml?.label ?? '—'}</strong>
                </p>
                <div className={styles.engineBarTrack}>
                  <motion.div
                    className={styles.engineBarFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${mlConfPct}%` }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ background: PRIMARY }}
                  />
                </div>
                <p className={styles.engineSmall}>
                  {t.confidence}: {Math.round(mlConfPct)}%
                </p>
              </div>

              <div className={styles.engineCard}>
                <h4 className={styles.engineTitle}>{t.anomalyEngine}</h4>
                <div className={styles.gaugeBox} dir="ltr">
                  <PieChart width={160} height={90}>
                    <Pie
                      data={pieGaugeData}
                      cx={80}
                      cy={75}
                      startAngle={180}
                      endAngle={0}
                      innerRadius={48}
                      outerRadius={62}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={0}
                    >
                      {pieGaugeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                  <span className={styles.gaugeCenter}>{Math.round(anomalyScore)}</span>
                </div>
                <p className={styles.engineSmall}>{ano?.reason ?? ''}</p>
              </div>

              <div className={styles.engineCard}>
                <h4 className={styles.engineTitle}>{t.signatureEngine}</h4>
                {sig?.matched && sig.signatures?.length ? (
                  <ul className={styles.sigList}>
                    {sig.signatures.map((s) => (
                      <li key={s}>{signatureLabel(s, lang)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.sigClean}>{t.cleanSig}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

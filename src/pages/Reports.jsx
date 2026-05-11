import { useEffect, useMemo, useState, useCallback } from 'react'
import styles from './Reports.module.css'
import { useLang } from '../context/lang'
import { fetchAlerts } from '../api/alerts'
import { fetchGeneratedReport } from '../api/reports'
import {
  buildReportPdf,
  chartToSvgExport,
  chartToSvgPreview,
  downloadDataUrl,
  svgStringToPngDataUrl,
} from '../utils/reportExport'

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
    id: 'suspicious_ip',
    icon: '🕵️',
    label: { ar: 'تقرير الـ IP المشبوهة', en: 'Suspicious IP report' },
    desc: { ar: 'قائمة عناوين IP المشبوهة والمحظورة', en: 'List of suspicious/blocked IPs' },
  },
  {
    id: 'attack_types',
    icon: '⚔️',
    label: { ar: 'تقرير أنواع الهجمات', en: 'Attack types report' },
    desc: { ar: 'DNS / Port Scan / Brute Force', en: 'DNS / Port scan / Brute force' },
  },
  {
    id: 'hourly',
    icon: '📈',
    label: { ar: 'تقرير معدل التهديدات بالساعة', en: 'Hourly threat rate' },
    desc: { ar: 'معدل التهديدات لكل ساعة', en: 'Threat rate per hour' },
  },
]

/** Coerce API chart (legacy / mixed types) to labels + numeric series. */
function normalizeChartFromReport(report) {
  const c = report?.chart
  if (!c || !Array.isArray(c.series) || c.series.length === 0) return null
  const series = c.series.map((x) => {
    const n = Number(x)
    return Number.isFinite(n) ? Math.round(n) : 0
  })
  const labels = [...(c.labels || [])]
  while (labels.length < series.length) {
    labels.push(`#${labels.length + 1}`)
  }
  return {
    kind: c.kind || 'bar',
    labels: labels.slice(0, series.length),
    series,
    label: c.label || 'Chart',
    is_sample: Boolean(c.is_sample),
  }
}

export default function Reports() {
  const { lang } = useLang()
  const [selected, setSelected] = useState('daily')
  const [generating, setGenerating] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [report, setReport] = useState(null)
  const [reportError, setReportError] = useState('')

  const copy = lang === 'ar' ? {
    title: 'التقارير',
    quickToday: 'إجمالي التهديدات اليوم:',
    reportType: 'نوع التقرير',
    generate: 'توليد التقرير',
    generating: 'جاري التوليد...',
    exportPdf: 'تصدير PDF',
    exportChart: 'تصدير المخطط',
    exportNeedReport: 'ولّد التقرير أولاً.',
    exportPdfErr: 'فشل تصدير PDF.',
    exportChartErr: 'فشل تصدير المخطط.',
    reportTitle: 'معاينة التقرير',
    summary: 'ملخص',
    tables: 'جداول',
    emptyChart: 'لا توجد بيانات مخطط لهذا النوع.',
    sampleNote: 'عرض بيانات تجريبية — لا توجد تنبيهات كافية في النطاق الزمني.',
    loadErr: 'تعذر تحميل التنبيهات.',
    chartStampGenerated: 'أُنشئ التقرير',
    chartStampExported: 'تاريخ التصدير',
  } : {
    title: 'Reports',
    quickToday: "Today's total threats:",
    reportType: 'Report type',
    generate: 'Generate report',
    generating: 'Generating...',
    exportPdf: 'Export PDF',
    exportChart: 'Export chart',
    exportNeedReport: 'Generate a report first.',
    exportPdfErr: 'PDF export failed.',
    exportChartErr: 'Chart export failed.',
    reportTitle: 'Report preview',
    summary: 'Summary',
    tables: 'Tables',
    emptyChart: 'No chart data for this report type.',
    sampleNote: 'Showing sample data — not enough alerts in the selected window.',
    loadErr: 'Could not load alerts.',
    chartStampGenerated: 'Report generated',
    chartStampExported: 'Exported',
  }

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
    const timer = setInterval(load, 60000)
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

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    setReportError('')
    setReport(null)
    try {
      const data = await fetchGeneratedReport(selected)
      setReport(data)
    } catch (e) {
      setReportError(e?.message || 'Request failed')
      setReport(null)
    } finally {
      setGenerating(false)
    }
  }, [selected])

  const displayChart = useMemo(() => normalizeChartFromReport(report), [report])

  const reportTypeLabel = useMemo(() => {
    const rt = reportTypes.find((r) => r.id === selected)
    return rt ? (rt.label[lang] ?? rt.label.en) : selected
  }, [selected, lang])

  const exportPdfFile = async () => {
    if (!report) {
      window.alert(copy.exportNeedReport)
      return
    }
    try {
      const reportTypeNameEn =
        reportTypes.find((r) => r.id === selected)?.label.en ?? selected
      await buildReportPdf({
        report,
        selectedTypeId: selected,
        displayChart,
        quickStats,
        reportTypeNameEn,
      })
    } catch (e) {
      window.alert(e?.message ? `${copy.exportPdfErr} ${e.message}` : copy.exportPdfErr)
    }
  }

  const exportChartFile = async () => {
    if (!displayChart?.series?.length) {
      window.alert(copy.emptyChart)
      return
    }
    const period =
      report?.period?.start
        ? `${report.period.start} → ${report.period.end ?? ''}`
        : ''
    const svg = chartToSvgExport(displayChart, {
      reportTypeLabel,
      reportTitle: report?.title || '',
      periodLine: period,
      generatedAt: `${copy.chartStampGenerated}: ${report?.generated_at || ''}`,
      exportedLabel: `${copy.chartStampExported}: ${new Date().toLocaleString()}`,
    })
    try {
      const png = await svgStringToPngDataUrl(svg)
      const safeType = String(report?.report_type || selected).replace(/[^a-z0-9-]/gi, '_')
      const name = `hisn-chart-${safeType}-${(report?.generated_at || '').slice(0, 10)}.png`
      downloadDataUrl(name, png)
    } catch {
      window.alert(copy.exportChartErr)
    }
  }

  const summaryEntries = report?.summary && typeof report.summary === 'object'
    ? Object.entries(report.summary)
    : []

  const tableEntries =
    report?.tables && typeof report.tables === 'object'
      ? Object.entries(report.tables).filter(([, rows]) => Array.isArray(rows) && rows.length > 0)
      : []

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{copy.title}</h2>

      <div className={styles.quickStats}>
        <div className={styles.statMain}>
          {copy.quickToday}{' '}
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
          <h3 className={styles.sectionTitle}>{copy.reportType}</h3>
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
            {generating ? copy.generating : copy.generate}
          </button>
          <div className={styles.exportIcons}>
            <button
              type="button"
              className={styles.exportIcon}
              onClick={() => exportPdfFile()}
              title={copy.exportPdf}
              aria-label={copy.exportPdf}
            >
              📄
            </button>
            <button
              type="button"
              className={styles.exportIcon}
              onClick={exportChartFile}
              title={copy.exportChart}
              aria-label={copy.exportChart}
            >
              📊
            </button>
          </div>
        </div>

        {generating && (
          <div className={styles.reportLoading} role="status">
            <div className={styles.spinner} aria-hidden />
            <span>{copy.generating}</span>
          </div>
        )}

        {reportError && (
          <div className={styles.reportError}>{reportError}</div>
        )}

        {report && !generating && (
          <section className={styles.reportSection}>
            <h3 className={styles.sectionTitle}>{copy.reportTitle}</h3>
            <p className={styles.reportMeta}>
              <strong>{report.title}</strong>
              {' · '}
              {report.period?.start ? `${report.period.start} → ${report.period.end ?? ''}` : ''}
              {' · '}
              {report.generated_at}
            </p>

            {displayChart?.is_sample && (
              <p className={styles.sampleBanner} role="note">
                {copy.sampleNote}
              </p>
            )}

            {summaryEntries.length > 0 && (
              <div className={styles.summaryBox}>
                <h4 className={styles.subHeading}>{copy.summary}</h4>
                <dl className={styles.summaryDl}>
                  {summaryEntries.map(([k, v]) => (
                    <div key={k} className={styles.summaryRow}>
                      <dt>{k}</dt>
                      <dd>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {displayChart?.series?.length > 0 && (
              <div className={styles.chartWrap}>
                <div
                  className={styles.chartSvg}
                  dangerouslySetInnerHTML={{
                    __html: chartToSvgPreview(displayChart, report.title).replace(/^<\?xml[^>]*>\s*/, ''),
                  }}
                />
              </div>
            )}

            {tableEntries.map(([tableName, rows]) => {
              const cols = Object.keys(rows[0])
              return (
                <div key={tableName} className={styles.tableWrap}>
                  <h4 className={styles.subHeading}>
                    {copy.tables}: {tableName.replace(/_/g, ' ')}
                  </h4>
                  <div className={styles.tableScroll}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          {cols.map((col) => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 100).map((row, idx) => (
                          <tr key={row.id ?? `${tableName}-${idx}`}>
                            {cols.map((col) => (
                              <td key={col}>{row[col] != null ? String(row[col]) : ''}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}

            {report.text && (
              <pre className={styles.reportPre}>{report.text}</pre>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

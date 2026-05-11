import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Inline preview chart (matches prior Reports.jsx layout). */
export function chartToSvgPreview(chart, titleFallback) {
  if (!chart?.series?.length) return ''
  const W = 720
  const H = 300
  const padL = 48
  const padR = 24
  const padT = 36
  const padB = 72
  const labels = chart.labels || []
  const series = chart.series || []
  const n = series.length
  const max = Math.max(1, ...series.map((x) => Number(x) || 0))
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const gap = n > 1 ? (innerW * 0.08) / (n - 1) : 0
  const barW = n ? (innerW - gap * (n - 1)) / n : 0
  let rects = ''
  series.forEach((v, i) => {
    const val = Number(v) || 0
    const h = (val / max) * innerH
    const x = padL + i * (barW + gap)
    const y = padT + innerH - h
    rects += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barW.toFixed(2)}" height="${h.toFixed(2)}" fill="#78508c" rx="3"/>\n`
  })
  let textLabels = ''
  labels.forEach((lab, i) => {
    const x = padL + i * (barW + gap) + barW / 2
    const short = String(lab).slice(0, 14)
    textLabels += `<text x="${x}" y="${H - padB + 18}" text-anchor="middle" font-size="11" font-family="Segoe UI, Arial, sans-serif" fill="#334155">${escapeXml(short)}</text>\n`
  })
  const title = escapeXml(chart.label || titleFallback || 'Chart')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="#faf8fc"/>
  <text x="${W / 2}" y="22" text-anchor="middle" font-size="15" font-weight="600" font-family="Segoe UI, Arial, sans-serif" fill="#2e1065">${title}</text>
  ${rects}
  ${textLabels}
</svg>`
}

/**
 * Full export chart: report type title, axis labels, bar values, legend, timestamps.
 * @param {object} meta - reportTypeLabel, reportTitle, periodLine, generatedAt, exportedLabel
 */
export function chartToSvgExport(chart, meta) {
  if (!chart?.series?.length) return ''
  const W = 900
  const H = 560
  const padL = 72
  const padR = 40
  const padT = 120
  const padB = 100
  const labels = chart.labels || []
  const series = chart.series || []
  const n = series.length
  const maxVal = Math.max(1, ...series.map((x) => Number(x) || 0))
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const gap = n > 1 ? (innerW * 0.06) / (n - 1) : 0
  const barW = n ? (innerW - gap * (n - 1)) / n : 0

  const reportType = escapeXml(meta.reportTypeLabel || 'Report')
  const chartSeriesName = escapeXml(chart.label || 'Series')
  const reportTitle = escapeXml(meta.reportTitle || '')
  const periodLine = escapeXml(meta.periodLine || '')
  const generatedAt = escapeXml(meta.generatedAt || '')
  const exportedLabel = escapeXml(meta.exportedLabel || '')

  const tickCount = 5
  const ticks = []
  for (let i = 0; i <= tickCount; i += 1) {
    const v = Math.round((maxVal * i) / tickCount)
    ticks.push(v)
  }

  let gridAndAxis = ''
  ticks.forEach((tv) => {
    const y = padT + innerH - (tv / maxVal) * innerH
    gridAndAxis += `<line x1="${padL}" y1="${y.toFixed(2)}" x2="${W - padR}" y2="${y.toFixed(2)}" stroke="#e2e8f0" stroke-width="1"/>\n`
    gridAndAxis += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="11" font-family="Segoe UI, Arial, sans-serif" fill="#475569">${tv}</text>\n`
  })

  gridAndAxis += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + innerH}" stroke="#64748b" stroke-width="1.5"/>\n`
  gridAndAxis += `<line x1="${padL}" y1="${padT + innerH}" x2="${W - padR}" y2="${padT + innerH}" stroke="#64748b" stroke-width="1.5"/>\n`
  gridAndAxis += `<text x="${padL - 52}" y="${padT + innerH / 2}" text-anchor="middle" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="#334155" transform="rotate(-90 ${padL - 52},${padT + innerH / 2})">Count</text>\n`
  gridAndAxis += `<text x="${(padL + W - padR) / 2}" y="${H - 48}" text-anchor="middle" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="#334155">Category</text>\n`

  let rects = ''
  let valueLabels = ''
  series.forEach((v, i) => {
    const val = Number(v) || 0
    const h = (val / maxVal) * innerH
    const x = padL + i * (barW + gap)
    const y = padT + innerH - h
    rects += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barW.toFixed(2)}" height="${h.toFixed(2)}" fill="#78508c" rx="4"/>\n`
    valueLabels += `<text x="${x + barW / 2}" y="${y - 6}" text-anchor="middle" font-size="11" font-weight="600" font-family="Segoe UI, Arial, sans-serif" fill="#1e293b">${val}</text>\n`
  })

  let catLabels = ''
  labels.forEach((lab, i) => {
    const cx = padL + i * (barW + gap) + barW / 2
    const short = String(lab).length > 18 ? `${String(lab).slice(0, 16)}…` : String(lab)
    catLabels += `<text x="${cx}" y="${padT + innerH + 22}" text-anchor="middle" font-size="10" font-family="Segoe UI, Arial, sans-serif" fill="#334155">${escapeXml(short)}</text>\n`
  })

  const legendY = padT + innerH + 52
  const legend = `
  <rect x="${padL}" y="${legendY}" width="14" height="14" fill="#78508c" rx="2"/>
  <text x="${padL + 22}" y="${legendY + 12}" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="#1e293b">${chartSeriesName}</text>
`

  const footerY = H - 28
  const footer = `
  <text x="${W / 2}" y="${footerY}" text-anchor="middle" font-size="10" fill="#64748b" font-family="Segoe UI, Arial, sans-serif">${generatedAt ? `${exportedLabel} · ${generatedAt}` : exportedLabel}</text>
`

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="${W / 2}" y="42" text-anchor="middle" font-size="20" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#2e1065">${reportType}</text>
  <text x="${W / 2}" y="68" text-anchor="middle" font-size="14" font-family="Segoe UI, Arial, sans-serif" fill="#475569">${chartSeriesName}</text>
  ${reportTitle ? `<text x="${W / 2}" y="92" text-anchor="middle" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="#64748b">${reportTitle}</text>` : ''}
  ${periodLine ? `<text x="${W / 2}" y="110" text-anchor="middle" font-size="11" font-family="Segoe UI, Arial, sans-serif" fill="#94a3b8">${periodLine}</text>` : ''}
  ${gridAndAxis}
  ${rects}
  ${valueLabels}
  ${catLabels}
  ${legend}
  ${footer}
</svg>`
}

export function svgStringToPngDataUrl(svgString) {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()
    img.onload = () => {
      try {
        const scale = 2
        const w = img.naturalWidth || svgDimensions(svgString).w
        const h = img.naturalHeight || svgDimensions(svgString).h
        const canvas = document.createElement('canvas')
        canvas.width = w * scale
        canvas.height = h * scale
        const ctx = canvas.getContext('2d')
        ctx.scale(scale, scale)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL('image/png'))
      } catch (e) {
        URL.revokeObjectURL(url)
        reject(e)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not rasterize chart SVG'))
    }
    img.src = url
  })
}

function svgDimensions(svg) {
  const wm = svg.match(/width="(\d+)"/)
  const hm = svg.match(/height="(\d+)"/)
  return { w: wm ? Number(wm[1]) : 900, h: hm ? Number(hm[1]) : 560 }
}

function pdfCellStr(v) {
  if (v == null) return ''
  if (typeof v === 'object') return JSON.stringify(v)
  const s = String(v)
  return s.replace(/\u0000/g, '')
}

/** PDF uses Helvetica (Latin); labels are English-only for reliable rendering. */
const PDF = {
  mainTitle: 'Hisn IDS — Security report',
  report: 'Report',
  type: 'Type',
  period: 'Period',
  generated: 'Generated',
  threatOverview: 'Threat overview (current alerts)',
  total: 'Total',
  reportSummary: 'Report summary',
  colMetric: 'Metric',
  colValue: 'Value',
  table: 'Table',
  chart: 'Chart',
  reportGenerated: 'Report generated',
  exportedAt: 'Exported',
  chartRasterFail: 'Chart image could not be embedded.',
}

/**
 * Build a multi-section PDF: title, severity summary, API summary, all table rows, chart image.
 * @param {string} reportTypeNameEn — English report type label (Helvetica-safe).
 */
export async function buildReportPdf({
  report,
  selectedTypeId,
  displayChart,
  quickStats,
  reportTypeNameEn,
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 14
  let y = margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(PDF.mainTitle, pageW / 2, y, { align: 'center' })
  y += 9

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(`${PDF.report}: ${pdfCellStr(report.title)}`, margin, y)
  y += 6
  doc.text(`${PDF.type}: ${pdfCellStr(reportTypeNameEn)}`, margin, y)
  y += 6
  const period =
    report.period?.start
      ? `${report.period.start} → ${report.period.end ?? ''}`
      : ''
  if (period) {
    doc.text(`${PDF.period}: ${period}`, margin, y)
    y += 6
  }
  doc.text(`${PDF.generated}: ${pdfCellStr(report.generated_at)}`, margin, y)
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(PDF.threatOverview, margin, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const summaryLine = `${PDF.total}: ${quickStats.total} · CRITICAL: ${quickStats.critical} · HIGH: ${quickStats.high} · MEDIUM: ${quickStats.medium} · LOW: ${quickStats.low}`
  const splitSummary = doc.splitTextToSize(summaryLine, pageW - 2 * margin)
  doc.text(splitSummary, margin, y)
  y += splitSummary.length * 5 + 6

  const summaryObj = report.summary && typeof report.summary === 'object' ? report.summary : null
  if (summaryObj && Object.keys(summaryObj).length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(PDF.reportSummary, margin, y)
    y += 6
    const body = Object.entries(summaryObj).map(([k, v]) => [pdfCellStr(k), pdfCellStr(v)])
    autoTable(doc, {
      startY: y,
      head: [[PDF.colMetric, PDF.colValue]],
      body,
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [46, 16, 101], textColor: 255 },
      margin: { left: margin, right: margin },
    })
    y = (doc.lastAutoTable?.finalY ?? y) + 10
  }

  const tables =
    report.tables && typeof report.tables === 'object'
      ? Object.entries(report.tables).filter(([, rows]) => Array.isArray(rows) && rows.length > 0)
      : []

  for (const [tableName, rows] of tables) {
    if (y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage()
      y = margin
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    const sectionTitle = `${PDF.table}: ${tableName.replace(/_/g, ' ')}`
    doc.text(sectionTitle, margin, y)
    y += 6

    const cols = Object.keys(rows[0])
    const head = [cols.map((c) => pdfCellStr(c))]
    const body = rows.map((row) => cols.map((c) => pdfCellStr(row[c])))
    autoTable(doc, {
      startY: y,
      head,
      body,
      styles: { font: 'helvetica', fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' },
      headStyles: { fillColor: [120, 80, 140], textColor: 255 },
      margin: { left: margin, right: margin },
      showHead: 'everyPage',
      tableWidth: 'wrap',
      horizontalPageBreak: true,
    })
    y = (doc.lastAutoTable?.finalY ?? y) + 10
  }

  if (displayChart?.series?.length) {
    const svg = chartToSvgExport(displayChart, {
      reportTypeLabel: reportTypeNameEn,
      reportTitle: report.title,
      periodLine: period,
      generatedAt: `${PDF.reportGenerated}: ${report.generated_at || ''}`,
      exportedLabel: `${PDF.exportedAt}: ${new Date().toLocaleString()}`,
    })
    let pngDataUrl
    try {
      pngDataUrl = await svgStringToPngDataUrl(svg)
    } catch {
      pngDataUrl = null
    }
    doc.addPage()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(PDF.chart, margin, margin + 4)
    if (pngDataUrl) {
      const imgW = pageW - 2 * margin
      const imgH = (imgW * 560) / 900
      const maxH = doc.internal.pageSize.getHeight() - margin * 2 - 14
      const scale = imgH > maxH ? maxH / imgH : 1
      const finalW = imgW * scale
      const finalH = imgH * scale
      doc.addImage(pngDataUrl, 'PNG', margin, margin + 10, finalW, finalH)
    } else {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(PDF.chartRasterFail, margin, margin + 14)
    }
  }

  const safeType = String(report.report_type || selectedTypeId).replace(/[^a-z0-9-]/gi, '_')
  const datePart = (report.generated_at || '').slice(0, 10)
  doc.save(`hisn-report-${safeType}-${datePart}.pdf`)
}

export function downloadDataUrl(filename, dataUrl) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

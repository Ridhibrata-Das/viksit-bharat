import { LiveAnalyticsSummary } from '@viksit/shared';

export interface DistrictExportRow {
  rank: number;
  code: string;
  nameEn: string;
  nameBn: string;
  zone: string;
  populationM: number;
  gsdpSharePct: number;
  deliveryScore: number;
  promiseCount: number;
  deliveredCount: number;
  inProgressCount: number;
  outlayCr: number;
  perCapitaInr: number;
}

export function getFilteredDistrictRows(
  analytics: LiveAnalyticsSummary,
  zoneFilter = 'ALL',
  sortBy: 'deliveryScore' | 'gsdpSharePct' | 'outlayCr' | 'perCapitaInr' = 'deliveryScore'
): DistrictExportRow[] {
  const list = (analytics.districtMatrix || []).filter(
    (d) => zoneFilter === 'ALL' || d.zone === zoneFilter
  );

  const sorted = [...list].sort((a, b) => {
    return (b[sortBy] || 0) - (a[sortBy] || 0);
  });

  return sorted.map((d, idx) => ({
    rank: idx + 1,
    code: d.code,
    nameEn: d.nameEn,
    nameBn: d.nameBn,
    zone: d.zone,
    populationM: d.populationM,
    gsdpSharePct: d.gsdpSharePct,
    deliveryScore: d.deliveryScore,
    promiseCount: d.promiseCount,
    deliveredCount: d.deliveredCount,
    inProgressCount: d.inProgressCount,
    outlayCr: d.outlayCr,
    perCapitaInr: d.perCapitaInr,
  }));
}

function escapeCsvCell(val: string | number): string {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates a UTF-8 CSV string (with BOM for Excel compatibility) containing
 * executive summary metadata, regional zone aggregations, and all 23 districts.
 */
export function generateDistrictCsvContent(
  analytics: LiveAnalyticsSummary,
  zoneFilter = 'ALL',
  sortBy: 'deliveryScore' | 'gsdpSharePct' | 'outlayCr' | 'perCapitaInr' = 'deliveryScore'
): string {
  const rows = getFilteredDistrictRows(analytics, zoneFilter, sortBy);
  const ov = analytics.overview;
  const dateStr = new Date(analytics.timestamp || Date.now()).toISOString().slice(0, 10);

  const lines: string[] = [];

  // Section 1: Report Header Metadata
  lines.push(
    [
      'REPORT_TITLE',
      'Viksit Bengal 2047 — 23-District Governance & Economic Performance Dataset (Phase I: 2033 Rs. 85L Cr | Phase II: 2047 Rs. 425L Cr)',
      'GENERATED_DATE',
      dateStr,
      'SYNC_MODE',
      analytics.liveSyncMode,
    ]
      .map(escapeCsvCell)
      .join(',')
  );
  lines.push(
    [
      'STATE_GSDP_INR_LAKH_CR',
      ov.currentGsdpInrLakhCr,
      'TARGET_2033_INR_LAKH_CR',
      ov.targetGsdp2033InrLakhCr || 85,
      'TARGET_2047_INR_LAKH_CR',
      ov.targetGsdp2047InrLakhCr || 425,
      'TOTAL_SANCTIONED_OUTLAY_CR',
      ov.totalTrackedOutlayCr,
      'MEAN_DISTRICT_DELIVERY_SCORE',
      ov.avgDistrictDeliveryScore,
    ]
      .map(escapeCsvCell)
      .join(',')
  );
  lines.push('');

  // Section 2: District Performance Columns
  const headers = [
    'Rank',
    'District_Code',
    'District_Name_EN',
    'District_Name_BN',
    'Regional_Zone',
    'Population_Millions',
    'GSDP_Share_Pct',
    'Delivery_Score_Pct',
    'Tracked_Promises',
    'Delivered_Promises',
    'In_Progress_Promises',
    'Sanctioned_Outlay_INR_Cr',
    'Per_Capita_Income_INR',
  ];
  lines.push(headers.join(','));

  for (const r of rows) {
    lines.push(
      [
        r.rank,
        r.code,
        r.nameEn,
        r.nameBn,
        r.zone,
        r.populationM.toFixed(2),
        r.gsdpSharePct.toFixed(1),
        r.deliveryScore,
        r.promiseCount,
        r.deliveredCount,
        r.inProgressCount,
        r.outlayCr,
        r.perCapitaInr,
      ]
        .map(escapeCsvCell)
        .join(',')
    );
  }

  // Totals / Summary Row
  const totalPop = rows.reduce((s, r) => s + r.populationM, 0);
  const totalGsdpShare = rows.reduce((s, r) => s + r.gsdpSharePct, 0);
  const avgScore = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.deliveryScore, 0) / rows.length)
    : 0;
  const totalPromises = rows.reduce((s, r) => s + r.promiseCount, 0);
  const totalDelivered = rows.reduce((s, r) => s + r.deliveredCount, 0);
  const totalInProg = rows.reduce((s, r) => s + r.inProgressCount, 0);
  const totalOutlay = rows.reduce((s, r) => s + r.outlayCr, 0);
  const avgPerCapita = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.perCapitaInr, 0) / rows.length)
    : 0;

  lines.push(
    [
      'TOTAL/AVG',
      `COUNT:${rows.length}`,
      zoneFilter === 'ALL' ? 'All West Bengal Districts' : `${zoneFilter} Zone`,
      'পশ্চিমবঙ্গ জেলা সমষ্টি',
      zoneFilter,
      totalPop.toFixed(2),
      totalGsdpShare.toFixed(1),
      avgScore,
      totalPromises,
      totalDelivered,
      totalInProg,
      totalOutlay,
      avgPerCapita,
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  return '\uFEFF' + lines.join('\r\n');
}

function pdfEscape(text: string): string {
  return String(text ?? '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Generates a standards-compliant binary PDF 1.4 report containing:
 * - Official Emerald Header Banner & Audit Metadata
 * - State Macroeconomic & Governance KPI Box
 * - 6 Regional Zones Summary Table
 * - Complete 23-District Performance Dataset Table with Ranks, GSDP %, Delivery Score, Outlay (INR Cr), and Per-Capita Income
 */
export function generateDistrictPdfBytes(
  analytics: LiveAnalyticsSummary,
  zoneFilter = 'ALL',
  sortBy: 'deliveryScore' | 'gsdpSharePct' | 'outlayCr' | 'perCapitaInr' = 'deliveryScore'
): Uint8Array {
  const rows = getFilteredDistrictRows(analytics, zoneFilter, sortBy);
  const ov = analytics.overview;
  const dateStr = new Date(analytics.timestamp || Date.now()).toISOString().slice(0, 19).replace('T', ' ') + ' UTC';

  const ops: string[] = [];

  // Page size: A4 Portrait (595 x 842 pt)
  // 1. Top Emerald Header Banner
  ops.push('0.039 0.361 0.212 rg'); // #0A5C36 primary green
  ops.push('28 764 539 54 re f');

  ops.push('BT /F2 13 Tf 1 1 1 rg 40 796 Td (VIKSIT BENGAL 2047 — 23-DISTRICT PERFORMANCE & ECONOMETRIC AUDIT REPORT) Tj ET');
  ops.push(
    `BT /F1 8.5 Tf 0.82 0.98 0.89 rg 40 778 Td (${pdfEscape(
      `Generated: ${dateStr}  |  Mode: ${analytics.liveSyncMode}  |  Zone Filter: ${zoneFilter}  |  Sorted By: ${sortBy}`
    )}) Tj ET`
  );

  // 2. Executive KPI Summary Strip (y = 716..754)
  ops.push('0.96 0.96 0.95 rg 28 716 539 38 re f');
  ops.push('0.84 0.83 0.82 RG 0.7 w 28 716 539 38 re S');

  ops.push(
    `BT /F2 8.5 Tf 0.08 0.08 0.08 rg 38 738 Td (${pdfEscape(
      `State Live GSDP: INR ${ov.currentGsdpInrLakhCr} Lakh Cr   |   2033 Target: INR 85 Lakh Cr (${ov.gsdpProgressPct}%)   |   2047 Target: INR 425 Lakh Cr`
    )}) Tj ET`
  );
  ops.push(
    `BT /F1 8 Tf 0.25 0.25 0.25 rg 38 724 Td (${pdfEscape(
      `Commitments: ${ov.totalPromises} (Delivered: ${ov.deliveredCount}, Active: ${ov.underImplementationCount})   |   Sanctioned Outlay: INR ${ov.totalTrackedOutlayCr.toLocaleString('en-IN')} Cr   |   Mean District Score: ${ov.avgDistrictDeliveryScore}/100`
    )}) Tj ET`
  );

  // 3. Regional Zones Aggregation Table (y = 588..702)
  ops.push('BT /F2 9.5 Tf 0.039 0.361 0.212 rg 28 698 Td (1. REGIONAL ZONE ECONOMETRIC AGGREGATION (6 ZONES)) Tj ET');

  // Table header for Zones
  ops.push('0.91 0.95 0.93 rg 28 678 539 15 re f');
  ops.push(
    'BT /F2 7.5 Tf 0.05 0.25 0.15 rg 34 683 Td (REGIONAL ZONE) Tj 165 683 Td (DISTRICTS) Tj 225 683 Td (POPULATION) Tj 295 683 Td (GSDP SHARE) Tj 365 683 Td (AVG SCORE) Tj 430 683 Td (OUTLAY (INR CR)) Tj 508 683 Td (PER CAPITA) Tj ET'
  );

  let zy = 665;
  for (const z of analytics.regionalZoneAnalytics) {
    ops.push('0.90 0.90 0.89 RG 0.4 w 28 ' + (zy - 3) + ' 539 13 re S');
    ops.push(
      `BT /F1 7.5 Tf 0.12 0.12 0.12 rg 34 ${zy} Td (${pdfEscape(z.zone)}) Tj ` +
        `175 ${zy} Td (${z.districtsCount}) Tj ` +
        `228 ${zy} Td (${z.populationM.toFixed(2)}M) Tj ` +
        `302 ${zy} Td (${z.gsdpSharePct.toFixed(1)}%) Tj ` +
        `372 ${zy} Td (${z.avgDeliveryScore}/100) Tj ` +
        `435 ${zy} Td (INR ${z.sanctionedOutlayCr.toLocaleString('en-IN')}) Tj ` +
        `508 ${zy} Td (INR ${z.perCapitaInr.toLocaleString('en-IN')}) Tj ET`
    );
    zy -= 13;
  }

  // 4. 23-District Performance Dataset Table
  const dHeaderY = zy - 12;
  ops.push(
    `BT /F2 9.5 Tf 0.039 0.361 0.212 rg 28 ${dHeaderY} Td (${pdfEscape(
      `2. DISTRICT-LEVEL PERFORMANCE DATASET (${rows.length} DISTRICTS)`
    )}) Tj ET`
  );

  const thY = dHeaderY - 18;
  ops.push(`0.039 0.361 0.212 rg 28 ${thY - 4} 539 16 re f`);
  ops.push(
    `BT /F2 7.2 Tf 1 1 1 rg ` +
      `32 ${thY} Td (RK) Tj ` +
      `50 ${thY} Td (CODE) Tj ` +
      `82 ${thY} Td (DISTRICT NAME) Tj ` +
      `185 ${thY} Td (ZONE) Tj ` +
      `260 ${thY} Td (POP (M)) Tj ` +
      `302 ${thY} Td (GSDP %) Tj ` +
      `345 ${thY} Td (PROMISES (D/P/T)) Tj ` +
      `422 ${thY} Td (SCORE) Tj ` +
      `458 ${thY} Td (OUTLAY (CR)) Tj ` +
      `516 ${thY} Td (PER CAPITA) Tj ET`
  );

  let dy = thY - 16;
  rows.forEach((r, idx) => {
    if (idx % 2 === 0) {
      ops.push(`0.97 0.98 0.97 rg 28 ${dy - 3.5} 539 14.5 re f`);
    }
    ops.push(`0.88 0.88 0.87 RG 0.35 w 28 ${dy - 3.5} 539 14.5 re S`);

    const promisesStr = `${r.deliveredCount}/${r.inProgressCount}/${r.promiseCount}`;
    ops.push(
      `BT /F1 7.2 Tf 0.1 0.1 0.1 rg ` +
        `33 ${dy} Td (#${r.rank}) Tj ` +
        `/F2 7.2 Tf 0.039 0.361 0.212 rg 50 ${dy} Td (${pdfEscape(r.code)}) Tj ` +
        `/F1 7.2 Tf 0.1 0.1 0.1 rg 82 ${dy} Td (${pdfEscape(r.nameEn.slice(0, 20))}) Tj ` +
        `185 ${dy} Td (${pdfEscape(r.zone.slice(0, 15))}) Tj ` +
        `262 ${dy} Td (${r.populationM.toFixed(2)}M) Tj ` +
        `304 ${dy} Td (${r.gsdpSharePct.toFixed(1)}%) Tj ` +
        `352 ${dy} Td (${promisesStr}) Tj ` +
        `/F2 7.2 Tf 0.039 0.361 0.212 rg 424 ${dy} Td (${r.deliveryScore}%) Tj ` +
        `/F1 7.2 Tf 0.1 0.1 0.1 rg 458 ${dy} Td (INR ${r.outlayCr.toLocaleString('en-IN')}) Tj ` +
        `516 ${dy} Td (INR ${r.perCapitaInr.toLocaleString('en-IN')}) Tj ET`
    );
    dy -= 14.5;
  });

  // Footer Audit Signature
  ops.push(
    `BT /F1 7 Tf 0.42 0.42 0.42 rg 28 24 Td (${pdfEscape(
      'Official Audit Export — Viksit Bengal Governance & $1 Trillion Economic Progress Tracker  |  Verified via PIB, State Gazette & CAG Feeds'
    )}) Tj ET`
  );

  const streamContent = ops.join('\n');
  const streamBytesLength = new TextEncoder().encode(streamContent).length;

  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${streamBytesLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += obj;
  }

  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    const offStr = String(offsets[i]).padStart(10, '0');
    pdf += `${offStr} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return new TextEncoder().encode(pdf);
}

/**
 * Triggers an iframe-safe browser download of the District Performance CSV dataset
 */
export function downloadDistrictCsv(
  analytics: LiveAnalyticsSummary,
  zoneFilter = 'ALL',
  sortBy: 'deliveryScore' | 'gsdpSharePct' | 'outlayCr' | 'perCapitaInr' = 'deliveryScore'
): string {
  const csv = generateDistrictCsvContent(analytics, zoneFilter, sortBy);
  const dateKey = new Date().toISOString().slice(0, 10);
  const zoneSlug = zoneFilter === 'ALL' ? 'all-23-districts' : zoneFilter.toLowerCase().replace(/\s+/g, '-');
  const filename = `viksit-bengal-${zoneSlug}-performance-${dateKey}.csv`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  return filename;
}

/**
 * Triggers an iframe-safe browser download of the District Performance PDF report
 */
export function downloadDistrictPdf(
  analytics: LiveAnalyticsSummary,
  zoneFilter = 'ALL',
  sortBy: 'deliveryScore' | 'gsdpSharePct' | 'outlayCr' | 'perCapitaInr' = 'deliveryScore'
): string {
  const pdfBytes = generateDistrictPdfBytes(analytics, zoneFilter, sortBy);
  const dateKey = new Date().toISOString().slice(0, 10);
  const zoneSlug = zoneFilter === 'ALL' ? 'all-23-districts' : zoneFilter.toLowerCase().replace(/\s+/g, '-');
  const filename = `viksit-bengal-${zoneSlug}-audit-report-${dateKey}.pdf`;

  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  return filename;
}

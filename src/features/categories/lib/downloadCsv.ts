// risk-check/lib/exportReport.ts の downloadFile() と同じ Blob + <a download> パターン。
// feature間で共有するほど汎用的ではないため、featureごとに独立実装する方針に合わせローカルに置く。

function escapeCsvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildCsv(headers: string[], rows: (string | number | null)[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(','));
  return lines.join('\r\n');
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number | null)[][]): void {
  const csv = buildCsv(headers, rows);
  // Excelでの文字化け対策としてUTF-8 BOMを付与する。
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

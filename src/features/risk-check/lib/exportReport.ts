import { RISK_CATEGORIES, RISK_ITEMS } from '../data/riskItems';
import type { RiskStatus } from '../types';

const STATUS_LABEL: Record<RiskStatus, string> = {
  pending: '未確認',
  pass: '適合 (Pass)',
  action: '要対応 (Action Required)',
  na: '対象外 (N/A)',
};

export type StatusCounts = Record<RiskStatus, number>;

export function countStatuses(getStatus: (id: number) => RiskStatus): StatusCounts {
  const counts: StatusCounts = { pending: 0, pass: 0, action: 0, na: 0 };
  RISK_ITEMS.forEach((item) => {
    counts[getStatus(item.id)] += 1;
  });
  return counts;
}

export function computePassRate(counts: StatusCounts): number {
  const denom = RISK_ITEMS.length - counts.na;
  return denom > 0 ? Math.round((counts.pass / denom) * 100) : 0;
}

function timestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function buildMarkdownReport(getStatus: (id: number) => RiskStatus): string {
  const counts = countStatuses(getStatus);
  const rate = computePassRate(counts);
  const lines: string[] = [];

  lines.push('# リスクチェック55 診断結果');
  lines.push('');
  lines.push(`出力日時: ${timestamp()}`);
  lines.push(`適合率: ${rate}%（Pass ${counts.pass} / 対象外を除く ${RISK_ITEMS.length - counts.na} 項目）`);
  lines.push(`内訳: 適合 ${counts.pass} / 要対応 ${counts.action} / 対象外 ${counts.na} / 未確認 ${counts.pending}`);
  lines.push('');

  RISK_CATEGORIES.forEach((category) => {
    const items = RISK_ITEMS.filter((item) => item.category === category);
    if (!items.length) return;
    lines.push(`## ${category}`);
    lines.push('');
    lines.push('| No. | 項目 | 判定 | ツール | 状態 | 詳細説明 |');
    lines.push('|---|---|---|---|---|---|');
    items.forEach((item) => {
      lines.push(
        `| ${item.id} | ${item.name} | ${item.level} | ${item.tool} | ${STATUS_LABEL[getStatus(item.id)]} | ${item.description} |`,
      );
    });
    lines.push('');
  });

  return lines.join('\n');
}

export function buildJsonReport(getStatus: (id: number) => RiskStatus): string {
  const counts = countStatuses(getStatus);
  const rate = computePassRate(counts);

  const payload = {
    generatedAt: new Date().toISOString(),
    summary: { rate, statusCounts: counts, total: RISK_ITEMS.length },
    items: RISK_ITEMS.map((item) => ({ ...item, status: getStatus(item.id) })),
  };

  return JSON.stringify(payload, null, 2);
}

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

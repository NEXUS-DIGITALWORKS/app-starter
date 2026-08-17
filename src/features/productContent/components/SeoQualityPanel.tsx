import type { MissingField, SeoIssue, SeoSeverity } from '../types';

const SEVERITY_DOT: Record<SeoSeverity, string> = {
  critical: 'bg-[#B42318]',
  warning: 'bg-[#B45309]',
  info: 'bg-[#3157E5]',
};

interface SeoQualityPanelProps {
  issues: SeoIssue[];
  missingFields: MissingField[];
}

export default function SeoQualityPanel({ issues, missingFields }: SeoQualityPanelProps) {
  const criticalOrWarningCount = issues.filter((i) => i.severity !== 'info').length;
  const missingCount = missingFields.filter((f) => f.status === 'missing').length;

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-[#111827]">SEO・品質チェック</h3>

      <div className="mb-3 flex flex-wrap gap-2">
        {criticalOrWarningCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFBEB] px-2.5 py-1 text-xs font-semibold text-[#B45309]">
            SEO指摘 {criticalOrWarningCount}件
          </span>
        )}
        {missingCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3F2] px-2.5 py-1 text-xs font-semibold text-[#B42318]">
            不足情報 {missingCount}件
          </span>
        )}
      </div>

      <ul className="space-y-2.5">
        {issues.map((issue) => (
          <li key={issue.id} className="flex items-start gap-2 text-sm text-[#344054]">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${SEVERITY_DOT[issue.severity]}`} />
            <span>{issue.message}</span>
          </li>
        ))}
        {issues.length === 0 && <li className="text-sm text-[#98A2B3]">問題は検出されていません</li>}
      </ul>
    </div>
  );
}

import type { SeoIssueType } from '../types/product';

// SEOスコア表示。商品一覧・商品詳細画面の両方から再利用できるよう独立コンポーネント化している。
export type SeoScoreBadgeProps = {
  score: number | null;
  issueType?: SeoIssueType;
};

function resolveIssueType(score: number | null, issueType?: SeoIssueType): SeoIssueType {
  if (issueType) return issueType;
  if (score === null) return 'unrated';
  if (score >= 80) return 'none';
  if (score >= 60) return 'warning';
  return 'missing';
}

const STYLE: Record<SeoIssueType, { dot: string; text: string; label: string }> = {
  none: { dot: 'bg-[#059669]', text: 'text-[#059669]', label: '良好' },
  warning: { dot: 'bg-[#B45309]', text: 'text-[#B45309]', label: 'SEO警告' },
  missing: { dot: 'bg-[#B42318]', text: 'text-[#B42318]', label: '不足情報' },
  unrated: { dot: 'bg-[#98A2B3]', text: 'text-[#98A2B3]', label: '未評価' },
};

export default function SeoScoreBadge({ score, issueType }: SeoScoreBadgeProps) {
  const resolved = resolveIssueType(score, issueType);
  const style = STYLE[resolved];

  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${style.dot.replace('bg-', 'border-')}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      </span>
      <span className={`font-semibold ${style.text}`}>{score ?? '—'}</span>
      <span className={`text-xs ${style.text}`}>{style.label}</span>
    </span>
  );
}

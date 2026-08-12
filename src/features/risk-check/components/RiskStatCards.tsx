import { RISK_ITEMS, RISK_LEVELS } from '../data/riskItems';
import { computePassRate, countStatuses } from '../lib/exportReport';
import type { RiskStatus } from '../types';

const LEVEL_LINE_VAR: Record<string, string> = {
  完全自動: 'var(--color-success)',
  AI半自動: '#0891b2',
  手動: 'var(--color-warning)',
};

type Props = {
  getStatus: (id: number) => RiskStatus;
};

export default function RiskStatCards({ getStatus }: Props) {
  const total = RISK_ITEMS.length;
  const counts = countStatuses(getStatus);
  const rate = computePassRate(counts);

  return (
    <div className="rc-dashboard">
      {RISK_LEVELS.map((level) => {
        const count = RISK_ITEMS.filter((item) => item.level === level).length;
        const pct = Math.round((count / total) * 100);
        return (
          <div className="rc-stat-card" style={{ ['--rc-line' as string]: LEVEL_LINE_VAR[level] }} key={level}>
            <div className="rc-stat-label">
              <span className="rc-stat-dot" />
              {level}
            </div>
            <div className="rc-stat-value">
              {count}
              <small>/ {total} 項目</small>
            </div>
            <div className="rc-stat-sub">全体の {pct}%</div>
          </div>
        );
      })}

      <div className="rc-progress-card">
        <div className="rc-progress-top">
          <span className="rc-progress-label">適合率（Pass ÷ 対象外を除く全項目）</span>
          <span className="rc-progress-rate">{rate}%</span>
        </div>
        <div className="rc-progress-bar">
          <span className="rc-seg-pass" style={{ width: `${(counts.pass / total) * 100}%` }} />
          <span className="rc-seg-action" style={{ width: `${(counts.action / total) * 100}%` }} />
          <span className="rc-seg-na" style={{ width: `${(counts.na / total) * 100}%` }} />
          <span className="rc-seg-pending" style={{ width: `${(counts.pending / total) * 100}%` }} />
        </div>
        <div className="rc-progress-legend">
          <span>
            <i style={{ background: 'var(--color-success)' }} />
            適合 {counts.pass}
          </span>
          <span>
            <i style={{ background: 'var(--color-danger)' }} />
            要対応 {counts.action}
          </span>
          <span>
            <i style={{ background: 'var(--color-text-muted)', opacity: 0.45 }} />
            対象外 {counts.na}
          </span>
          <span>
            <i style={{ background: '#d0d5dd' }} />
            未確認 {counts.pending}
          </span>
        </div>
      </div>
    </div>
  );
}

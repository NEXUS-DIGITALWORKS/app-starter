import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import type { RiskItem, RiskStatus } from '../types';

const LEVEL_LINE_VAR: Record<string, string> = {
  完全自動: 'var(--color-success)',
  AI半自動: '#0891b2',
  手動: 'var(--color-warning)',
};

const STATUS_OPTIONS: { value: RiskStatus; label: string }[] = [
  { value: 'pending', label: '未確認' },
  { value: 'pass', label: '適合 (Pass)' },
  { value: 'action', label: '要対応 (Action Required)' },
  { value: 'na', label: '対象外 (N/A)' },
];

type Props = {
  item: RiskItem;
  status: RiskStatus;
  onChangeStatus: (id: number, status: RiskStatus) => void;
};

export default function RiskItemRow({ item, status, onChangeStatus }: Props) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChangeStatus(item.id, e.target.value as RiskStatus);
  };

  const descriptionId = `rc-item-description-${item.id}`;

  return (
    <article className="rc-item-card" style={{ ['--rc-line' as string]: LEVEL_LINE_VAR[item.level] }}>
      <div className="rc-item-id">No.{String(item.id).padStart(2, '0')}</div>
      <div className="rc-item-main">
        <div className="rc-item-title-row">
          <span className="rc-item-id-mobile">No.{String(item.id).padStart(2, '0')}</span>
          <h3>{item.name}</h3>
          <span className={`rc-badge rc-badge-level-${item.level}`}>{item.level}</span>
          <span className="rc-badge rc-badge-cat">{item.category}</span>
        </div>
        <div className="rc-item-detail">
          <span className="rc-item-tool">{item.tool}</span>
          <span className="rc-item-logic">{item.logic}</span>
        </div>
        <button
          type="button"
          className={`rc-item-toggle${expanded ? ' is-expanded' : ''}`}
          aria-expanded={expanded}
          aria-controls={descriptionId}
          onClick={() => setExpanded((v) => !v)}
        >
          <ChevronDown size={13} aria-hidden="true" />
          詳細説明
        </button>
        {expanded && (
          <p className="rc-item-description" id={descriptionId}>
            {item.description}
          </p>
        )}
      </div>
      <div className="rc-status-select">
        <select value={status} data-status={status} onChange={handleChange} aria-label={`${item.name}の状態`}>
          {STATUS_OPTIONS.map((opt) => (
            <option value={opt.value} key={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}

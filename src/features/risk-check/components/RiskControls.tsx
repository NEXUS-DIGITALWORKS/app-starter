import { Search } from 'lucide-react';
import { RISK_CATEGORIES, RISK_LEVELS } from '../data/riskItems';
import type { RiskCategory, RiskLevel } from '../types';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  activeCategories: Set<RiskCategory>;
  onToggleCategory: (category: RiskCategory) => void;
  activeLevels: Set<RiskLevel>;
  onToggleLevel: (level: RiskLevel) => void;
  interviewMode: boolean;
  onToggleInterview: () => void;
  onClearFilters: () => void;
};

export default function RiskControls({
  search,
  onSearchChange,
  activeCategories,
  onToggleCategory,
  activeLevels,
  onToggleLevel,
  interviewMode,
  onToggleInterview,
  onClearFilters,
}: Props) {
  return (
    <div className="rc-controls">
      <div className="rc-controls-inner">
        <div className="rc-search-row">
          <div className="rc-search-box">
            <Search size={15} aria-hidden="true" />
            <input
              type="text"
              placeholder="リスク項目・ツール・キーワードで検索"
              aria-label="検索"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="rc-switch-row">
            <span
              className={`rc-switch${interviewMode ? ' is-on' : ''}`}
              role="switch"
              aria-checked={interviewMode}
              aria-label="問診モード"
              tabIndex={0}
              onClick={onToggleInterview}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleInterview();
                }
              }}
            />
            問診モード（手動のみ表示）
          </div>
        </div>

        <div className="rc-filter-row">
          <span className="rc-filter-label">カテゴリ</span>
          {RISK_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={`rc-chip${activeCategories.has(category) ? ' is-active' : ''}`}
              aria-pressed={activeCategories.has(category)}
              onClick={() => onToggleCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="rc-filter-row">
          <span className="rc-filter-label">判定レベル</span>
          {RISK_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              className={`rc-chip${activeLevels.has(level) ? ' is-active' : ''}`}
              aria-pressed={activeLevels.has(level)}
              onClick={() => onToggleLevel(level)}
            >
              {level}
            </button>
          ))}
          <button type="button" className="rc-clear-btn" onClick={onClearFilters}>
            フィルターを解除
          </button>
        </div>
      </div>
    </div>
  );
}

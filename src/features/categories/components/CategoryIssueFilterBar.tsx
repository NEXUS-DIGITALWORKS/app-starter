import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CATEGORY_ISSUE_LABELS, CATEGORY_ISSUE_TYPES } from '../lib/categoryIssueRules';
import type { CategoryIssueType, IssueMatchMode } from '../types/categoryIssue';

interface CategoryIssueFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  issueTypes: CategoryIssueType[];
  onToggleIssueType: (type: CategoryIssueType) => void;
  issueMatchMode: IssueMatchMode;
  onIssueMatchModeChange: (mode: IssueMatchMode) => void;
  onClear: () => void;
}

export default function CategoryIssueFilterBar({
  search,
  onSearchChange,
  issueTypes,
  onToggleIssueType,
  issueMatchMode,
  onIssueMatchModeChange,
  onClear,
}: CategoryIssueFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3 sm:p-4">
      <div className="relative min-w-0">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="カテゴリ名・コードで検索"
          className="h-10 pl-9"
          aria-label="カテゴリ名・コードで検索"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-[#667085]">課題の種類（複数選択可）</span>

        <div className="flex items-center rounded-full border border-[#D0D5DD] bg-white p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => onIssueMatchModeChange('or')}
            className={cn(
              'rounded-full px-2 py-0.5 transition-colors',
              issueMatchMode === 'or' ? 'bg-[#EEF0FE] text-[#3157E5]' : 'text-[#667085] hover:bg-[#F8FAFC]',
            )}
            aria-pressed={issueMatchMode === 'or'}
          >
            OR（いずれか）
          </button>
          <button
            type="button"
            onClick={() => onIssueMatchModeChange('and')}
            className={cn(
              'rounded-full px-2 py-0.5 transition-colors',
              issueMatchMode === 'and' ? 'bg-[#EEF0FE] text-[#3157E5]' : 'text-[#667085] hover:bg-[#F8FAFC]',
            )}
            aria-pressed={issueMatchMode === 'and'}
          >
            AND（すべて）
          </button>
        </div>

        {CATEGORY_ISSUE_TYPES.map((type) => {
          const active = issueTypes.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggleIssueType(type)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-[#3157E5] bg-[#EEF0FE] text-[#3157E5]'
                  : 'border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F8FAFC]',
              )}
              aria-pressed={active}
            >
              {CATEGORY_ISSUE_LABELS[type]}
            </button>
          );
        })}

        <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto text-[#475467]">
          <X size={14} />
          検索条件をクリア
        </Button>
      </div>
    </div>
  );
}

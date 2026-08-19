import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PRODUCT_ISSUE_LABELS, PRODUCT_ISSUE_TYPES } from '../lib/productIssueRules';
import type { ProductIssueType } from '../types/productIssue';

interface ProductIssueFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  issueTypes: ProductIssueType[];
  onToggleIssueType: (type: ProductIssueType) => void;
  onClear: () => void;
}

export default function ProductIssueFilterBar({ search, onSearchChange, issueTypes, onToggleIssueType, onClear }: ProductIssueFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3 sm:p-4">
      <div className="relative min-w-0">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="商品名・SKUで検索"
          className="h-10 pl-9"
          aria-label="商品名・SKUで検索"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-[#667085]">課題の種類（複数選択可）</span>
        {PRODUCT_ISSUE_TYPES.map((type) => {
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
              {PRODUCT_ISSUE_LABELS[type]}
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

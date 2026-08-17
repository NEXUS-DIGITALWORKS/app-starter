import { Search } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { Input } from '../../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import type { HistoryFilter, HistorySortOrder } from '../lib/historyViewModel'

type Props = {
  search: string
  onSearchChange: (value: string) => void
  filter: HistoryFilter
  onFilterChange: (value: HistoryFilter) => void
  counts: { all: number; diagnosis: number; 'tech-selection': number }
  sort: HistorySortOrder
  onSortChange: (value: HistorySortOrder) => void
}

const FILTER_OPTIONS: { value: HistoryFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'diagnosis', label: '診断結果' },
  { value: 'tech-selection', label: '技術構成' },
]

const SORT_OPTIONS: { value: HistorySortOrder; label: string }[] = [
  { value: 'newest', label: '新しい順' },
  { value: 'oldest', label: '古い順' },
  { value: 'title', label: 'タイトル順' },
]

export function SavedHistoryToolbar({ search, onSearchChange, filter, onFilterChange, counts, sort, onSortChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="保存履歴を検索"
          className="pl-9"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onFilterChange(opt.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                filter === opt.value
                  ? 'bg-white text-[#3157E5] shadow-sm'
                  : 'text-[#667085] hover:text-[#344054]',
              )}
            >
              {opt.label} {counts[opt.value]}
            </button>
          ))}
        </div>

        <Select value={sort} onValueChange={(value) => onSortChange(value as HistorySortOrder)}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

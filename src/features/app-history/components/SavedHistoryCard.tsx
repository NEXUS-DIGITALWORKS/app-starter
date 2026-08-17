import { Link } from 'react-router-dom'
import { MoreVertical, Pencil } from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'
import {
  formatShortDate,
  getDiagnosisRestoreUrl,
  getRecommendedTechSelectorUrl,
  getTechSelectorReplayUrl,
  type SavedHistoryItem,
} from '../lib/historyViewModel'

type Props = {
  item: SavedHistoryItem
  onOpenDetail: (item: SavedHistoryItem) => void
  onEditMeta: (item: SavedHistoryItem) => void
}

export function SavedHistoryCard({ item, onOpenDetail, onEditMeta }: Props) {
  const isDiagnosis = item.type === 'diagnosis'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenDetail(item)
        }
      }}
      className="flex cursor-pointer flex-col gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-[#BFD0FB] hover:shadow-sm sm:px-5 sm:py-3.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Badge className="shrink-0 border-transparent bg-[#EAF1FF] text-[#2748C7] hover:bg-[#EAF1FF]">
            {isDiagnosis ? '診断結果' : '技術構成'}
          </Badge>
          <span className="truncate text-sm font-semibold text-[#111827]">{item.title}</span>
        </div>
        <span className="shrink-0 text-xs text-[#98A2B3]">{formatShortDate(item.createdAt)}</span>
      </div>

      <p className="truncate text-xs text-[#667085]">{item.subtitle}</p>
      {!isDiagnosis && item.techNames.length > 0 && (
        <p className="truncate text-xs text-[#475467]">{item.techNames.join(' / ')}</p>
      )}

      <div
        className="mt-1 flex flex-wrap items-center justify-end gap-2"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {isDiagnosis ? (
          <>
            <Link
              to={getDiagnosisRestoreUrl(item)}
              className="inline-flex items-center justify-center rounded-lg bg-[#3157E5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2649cf]"
            >
              診断を再実施
            </Link>
            <Link
              to={getRecommendedTechSelectorUrl(item)}
              className="hidden items-center justify-center rounded-lg border border-[#D0D5DD] bg-white px-3 py-1.5 text-xs font-semibold text-[#344054] hover:bg-[#F8FAFC] sm:inline-flex"
            >
              推奨構成を開く
            </Link>
          </>
        ) : (
          <Link
            to={getTechSelectorReplayUrl(item)}
            className="inline-flex items-center justify-center rounded-lg bg-[#3157E5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2649cf]"
          >
            選択を再現
          </Link>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#667085] hover:bg-[#F2F4F7]"
              aria-label="その他の操作"
            >
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isDiagnosis && (
              <DropdownMenuItem asChild className="sm:hidden">
                <Link to={getRecommendedTechSelectorUrl(item)}>推奨構成を開く</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => onEditMeta(item)}>
              <Pencil size={14} />
              タイトル・メモを編集
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

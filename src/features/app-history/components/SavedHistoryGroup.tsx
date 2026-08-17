import { SavedHistoryCard } from './SavedHistoryCard'
import type { SavedHistoryItem } from '../lib/historyViewModel'

type Props = {
  dateLabel: string
  items: SavedHistoryItem[]
  onOpenDetail: (item: SavedHistoryItem) => void
  onEditMeta: (item: SavedHistoryItem) => void
}

export function SavedHistoryGroup({ dateLabel, items, onOpenDetail, onEditMeta }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <h3 className="shrink-0 text-sm font-semibold text-[#344054]">{dateLabel}</h3>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <SavedHistoryCard key={`${item.type}-${item.id}`} item={item} onOpenDetail={onOpenDetail} onEditMeta={onEditMeta} />
        ))}
      </div>
    </div>
  )
}

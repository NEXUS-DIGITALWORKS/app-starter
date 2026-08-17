import { SavedHistoryGroup } from './SavedHistoryGroup'
import { SavedHistoryEmptyState } from './SavedHistoryEmptyState'
import { groupByDate, type SavedHistoryItem } from '../lib/historyViewModel'

type Props = {
  items: SavedHistoryItem[]
  hasAnyHistory: boolean
  onOpenDetail: (item: SavedHistoryItem) => void
  onEditMeta: (item: SavedHistoryItem) => void
}

export function SavedHistoryList({ items, hasAnyHistory, onOpenDetail, onEditMeta }: Props) {
  if (items.length === 0) {
    return <SavedHistoryEmptyState variant={hasAnyHistory ? 'no-results' : 'no-data'} />
  }

  const groups = groupByDate(items)

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <SavedHistoryGroup
          key={group.dateKey}
          dateLabel={group.dateLabel}
          items={group.items}
          onOpenDetail={onOpenDetail}
          onEditMeta={onEditMeta}
        />
      ))}
    </div>
  )
}

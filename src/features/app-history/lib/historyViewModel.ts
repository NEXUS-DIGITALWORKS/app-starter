import { CATEGORIES } from '../../tech-stack-selector/data/categories'
import { buildSelectionForPattern, getSelectedElements } from '../../tech-stack-selector/lib/matchEngine'
import { encodeSelectionToParam } from '../../tech-stack-selector/lib/shareLink'
import { buildDiagnosisSummary, countSelectedTechItems } from './historySummary'
import type { AppHistoryDiagnosisEntry, AppHistorySelectionEntry } from './resultsRepo'

export type TechCategoryGroup = {
  categoryTitle: string
  names: string[]
}

export type SavedHistoryItem =
  | {
      id: string
      type: 'diagnosis'
      title: string
      subtitle: string
      memo: string | null
      createdAt: string
      entry: AppHistoryDiagnosisEntry
    }
  | {
      id: string
      type: 'tech-selection'
      title: string
      subtitle: string
      techNames: string[]
      techByCategory: TechCategoryGroup[]
      memo: string | null
      createdAt: string
      entry: AppHistorySelectionEntry
    }

function buildTechByCategory(selection: Record<string, string[] | undefined>): TechCategoryGroup[] {
  return CATEGORIES.map((category) => {
    const elementIds = selection[category.id] ?? []
    const names = elementIds
      .map((id) => category.elements.find((e) => e.id === id)?.name)
      .filter((name): name is string => Boolean(name))
    return { categoryTitle: category.title, names }
  }).filter((group) => group.names.length > 0)
}

export function toDiagnosisHistoryItem(entry: AppHistoryDiagnosisEntry): SavedHistoryItem {
  const summary = buildDiagnosisSummary(entry)
  return {
    id: entry.id,
    type: 'diagnosis',
    title: entry.title || summary.title,
    subtitle: `${summary.category} / ${summary.patternId} / buildScore ${summary.buildScore} / ${summary.appTypeId}`,
    memo: entry.memo,
    createdAt: entry.created_at,
    entry,
  }
}

export function toSelectionHistoryItem(entry: AppHistorySelectionEntry): SavedHistoryItem {
  const selectedCount = countSelectedTechItems(entry.selection ?? {})
  const techNames = getSelectedElements(entry.selection ?? {}).map((element) => element.name)
  const techByCategory = buildTechByCategory(entry.selection ?? {})
  return {
    id: entry.id,
    type: 'tech-selection',
    title: entry.title || entry.matched_pattern_ids?.[0] || '構成候補',
    subtitle: `${selectedCount}件の要素を選択`,
    techNames,
    techByCategory,
    memo: entry.memo,
    createdAt: entry.created_at,
    entry,
  }
}

export function buildHistoryTimeline(
  diagnosisItems: AppHistoryDiagnosisEntry[],
  selectionItems: AppHistorySelectionEntry[],
): SavedHistoryItem[] {
  const items = [
    ...diagnosisItems.map(toDiagnosisHistoryItem),
    ...selectionItems.map(toSelectionHistoryItem),
  ]
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export type DiagnosisHistoryItem = Extract<SavedHistoryItem, { type: 'diagnosis' }>
export type SelectionHistoryItem = Extract<SavedHistoryItem, { type: 'tech-selection' }>

export function getDiagnosisRestoreUrl(item: DiagnosisHistoryItem): string {
  return `/tools/diagnosis/start?restore=${item.id}`
}

export function getRecommendedTechSelectorUrl(item: DiagnosisHistoryItem): string {
  const patternId = item.entry.recommended_stack?.patternId
  return patternId
    ? `/tools/tech-selector?s=${encodeSelectionToParam(buildSelectionForPattern(patternId))}`
    : '/tools/tech-selector'
}

export function getTechSelectorReplayUrl(item: SelectionHistoryItem): string {
  return `/tools/tech-selector?s=${encodeSelectionToParam(item.entry.selection ?? {})}`
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
}

export type HistoryFilter = 'all' | 'diagnosis' | 'tech-selection'
export type HistorySortOrder = 'newest' | 'oldest' | 'title'

export function filterHistoryItems(items: SavedHistoryItem[], filter: HistoryFilter, search: string): SavedHistoryItem[] {
  let result = items
  if (filter !== 'all') {
    result = result.filter((item) => item.type === filter)
  }

  const trimmedSearch = search.trim().toLowerCase()
  if (trimmedSearch) {
    result = result.filter((item) => `${item.title} ${item.memo ?? ''}`.toLowerCase().includes(trimmedSearch))
  }

  return result
}

export function sortHistoryItems(items: SavedHistoryItem[], sort: HistorySortOrder): SavedHistoryItem[] {
  const sorted = [...items]
  if (sort === 'oldest') {
    sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  } else if (sort === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title, 'ja'))
  } else {
    sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  return sorted
}

export function groupByDate(items: SavedHistoryItem[]): { dateKey: string; dateLabel: string; items: SavedHistoryItem[] }[] {
  const groups = new Map<string, SavedHistoryItem[]>()
  for (const item of items) {
    const date = new Date(item.createdAt)
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    if (!groups.has(dateKey)) groups.set(dateKey, [])
    groups.get(dateKey)!.push(item)
  }

  return Array.from(groups.entries()).map(([dateKey, groupItems]) => ({
    dateKey,
    dateLabel: new Date(groupItems[0].createdAt).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    items: groupItems,
  }))
}

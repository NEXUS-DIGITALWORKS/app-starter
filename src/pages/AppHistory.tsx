import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FolderClock } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { SaveMetaDialog, type SaveMetaState } from '../components/SaveMetaDialog'
import { SavedHistoryToolbar } from '../features/app-history/components/SavedHistoryToolbar'
import { SavedHistoryList } from '../features/app-history/components/SavedHistoryList'
import { SavedHistoryDetailSheet } from '../features/app-history/components/SavedHistoryDetailSheet'
import {
  buildHistoryTimeline,
  filterHistoryItems,
  sortHistoryItems,
  type HistoryFilter,
  type HistorySortOrder,
  type SavedHistoryItem,
} from '../features/app-history/lib/historyViewModel'
import {
  fetchSavedDiagnosisHistory,
  fetchSavedSelectionHistory,
  updateSavedDiagnosisMeta,
  updateSavedSelectionMeta,
  type AppHistoryDiagnosisEntry,
  type AppHistorySelectionEntry,
} from '../features/app-history/lib/resultsRepo'

type EditTarget = { kind: 'diagnosis' | 'selection'; id: string } | null

export default function AppHistory() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const diagnosisQuery = useQuery({
    queryKey: ['appHistory', 'diagnosis'],
    queryFn: () => fetchSavedDiagnosisHistory(50),
    enabled: isAuthenticated,
  })
  const selectionQuery = useQuery({
    queryKey: ['appHistory', 'selection'],
    queryFn: () => fetchSavedSelectionHistory(50),
    enabled: isAuthenticated,
  })
  const diagnosisItems = diagnosisQuery.data ?? []
  const selectionItems = selectionQuery.data ?? []
  const loading = diagnosisQuery.isLoading || selectionQuery.isLoading

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<HistoryFilter>('all')
  const [sort, setSort] = useState<HistorySortOrder>('newest')

  const [detailItem, setDetailItem] = useState<SavedHistoryItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const [editTarget, setEditTarget] = useState<EditTarget>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editMemo, setEditMemo] = useState('')
  const [editState, setEditState] = useState<SaveMetaState>('idle')

  const updateDiagnosisMutation = useMutation({
    mutationFn: ({ id, title, memo }: { id: string; title: string; memo: string }) =>
      updateSavedDiagnosisMeta(id, { title, memo }),
    onSuccess: (_data, { id, title, memo }) => {
      queryClient.setQueryData<AppHistoryDiagnosisEntry[]>(['appHistory', 'diagnosis'], (prev) =>
        prev?.map((item) => (item.id === id ? { ...item, title: title.trim() || null, memo: memo.trim() || null } : item)),
      )
    },
  })

  const updateSelectionMutation = useMutation({
    mutationFn: ({ id, title, memo }: { id: string; title: string; memo: string }) =>
      updateSavedSelectionMeta(id, { title, memo }),
    onSuccess: (_data, { id, title, memo }) => {
      queryClient.setQueryData<AppHistorySelectionEntry[]>(['appHistory', 'selection'], (prev) =>
        prev?.map((item) => (item.id === id ? { ...item, title: title.trim() || null, memo: memo.trim() || null } : item)),
      )
    },
  })

  const timeline = useMemo(() => buildHistoryTimeline(diagnosisItems, selectionItems), [diagnosisItems, selectionItems])

  const counts = useMemo(
    () => ({
      all: timeline.length,
      diagnosis: timeline.filter((item) => item.type === 'diagnosis').length,
      'tech-selection': timeline.filter((item) => item.type === 'tech-selection').length,
    }),
    [timeline],
  )

  const visibleItems = useMemo(() => {
    const filtered = filterHistoryItems(timeline, filter, search)
    return sortHistoryItems(filtered, sort)
  }, [timeline, filter, search, sort])

  const openDetail = (item: SavedHistoryItem) => {
    setDetailItem(item)
    setDetailOpen(true)
  }

  const openEditDialog = (item: SavedHistoryItem) => {
    setDetailOpen(false)
    setEditTarget({ kind: item.type === 'diagnosis' ? 'diagnosis' : 'selection', id: item.id })
    setEditTitle(item.entry.title ?? '')
    setEditMemo(item.entry.memo ?? '')
    setEditState('idle')
  }

  const handleConfirmEdit = async () => {
    if (!editTarget) return
    setEditState('saving')
    try {
      if (editTarget.kind === 'diagnosis') {
        await updateDiagnosisMutation.mutateAsync({ id: editTarget.id, title: editTitle, memo: editMemo })
      } else {
        await updateSelectionMutation.mutateAsync({ id: editTarget.id, title: editTitle, memo: editMemo })
      }
      setEditState('saved')
      setEditTarget(null)
    } catch {
      setEditState('error')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-6xl rounded-2xl border border-[#D0D5DD] bg-white p-6 shadow-[0_12px_32px_rgba(16,24,40,0.08)]">
        <h1 className="text-2xl font-bold text-[#111827]">保存済み一覧</h1>
        <p className="mt-3 text-sm text-[#667085]">ログインすると、保存した診断結果と技術要素の選択をここで確認できます。</p>
      </div>
    )
  }

  return (
    <div className="tools-scope mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6D8CF5]">Saved</p>
          <h1 className="mt-1 text-2xl font-bold text-[#111827]">保存済みの診断と構成</h1>
        </div>
        <Link
          to="/tools/diagnosis"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3157E5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2649cf]"
        >
          新しい診断を始める
          <ArrowRight size={15} />
        </Link>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#D0D5DD] bg-white p-6 text-sm text-[#667085]">読み込み中...</div>
      ) : (
        <>
          <SavedHistoryToolbar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            counts={counts}
            sort={sort}
            onSortChange={setSort}
          />

          <SavedHistoryList
            items={visibleItems}
            hasAnyHistory={timeline.length > 0}
            onOpenDetail={openDetail}
            onEditMeta={openEditDialog}
          />
        </>
      )}

      <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#D6DEFB] bg-[#EEF3FF] p-4 text-sm text-[#2748C7]">
        <FolderClock size={16} className="shrink-0" />
        <span>保存済みのデータはSupabaseの各テーブルに残ります。ここではログイン中のユーザー向けに一覧表示しています。</span>
      </div>

      <SavedHistoryDetailSheet item={detailItem} open={detailOpen} onOpenChange={setDetailOpen} onEditMeta={openEditDialog} />

      <SaveMetaDialog
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null)
        }}
        heading="タイトル・メモを編集"
        confirmLabel="更新する"
        title={editTitle}
        onTitleChange={setEditTitle}
        memo={editMemo}
        onMemoChange={setEditMemo}
        onConfirm={handleConfirmEdit}
        confirmState={editState}
      />
    </div>
  )
}

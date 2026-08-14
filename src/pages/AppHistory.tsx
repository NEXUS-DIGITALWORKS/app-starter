import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, FolderClock, Layers3 } from 'lucide-react'
import { buildSelectionForPattern } from '../features/tech-stack-selector/lib/matchEngine'
import { encodeSelectionToParam } from '../features/tech-stack-selector/lib/shareLink'
import { useAuth } from '../hooks/useAuth'
import { buildDiagnosisSummary, countSelectedTechItems } from '../features/app-history/lib/historySummary'
import { fetchSavedDiagnosisHistory, fetchSavedSelectionHistory } from '../features/app-history/lib/resultsRepo'

export default function AppHistory() {
  const { isAuthenticated } = useAuth()
  const [diagnosisItems, setDiagnosisItems] = useState<any[]>([])
  const [selectionItems, setSelectionItems] = useState<any[]>([])
  const [expandedDiagnosisId, setExpandedDiagnosisId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      const [diagnosis, selections] = await Promise.all([
        fetchSavedDiagnosisHistory(10),
        fetchSavedSelectionHistory(10),
      ])
      setDiagnosisItems(diagnosis)
      setSelectionItems(selections)
      setLoading(false)
    }

    load()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl rounded-2xl border border-[#D0D5DD] bg-white p-6 shadow-[0_12px_32px_rgba(16,24,40,0.08)]">
        <h1 className="text-2xl font-bold text-[#111827]">保存済み一覧</h1>
        <p className="mt-3 text-sm text-[#667085]">ログインすると、保存した診断結果と技術要素の選択をここで確認できます。</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6D8CF5]">Saved</p>
          <h1 className="mt-1 text-2xl font-bold text-[#111827]">保存済みの診断と構成</h1>
        </div>
        <Link to="/tools/diagnosis" className="inline-flex items-center gap-2 rounded-xl bg-[#3157E5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2649cf]">
          新しい診断を始める
          <ArrowRight size={15} />
        </Link>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#D0D5DD] bg-white p-6 text-sm text-[#667085]">読み込み中...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-[#D0D5DD] bg-white p-5 shadow-[0_12px_32px_rgba(16,24,40,0.08)]">
            <div className="mb-4 flex items-center gap-2">
              <FileText size={18} className="text-[#3157E5]" />
              <h2 className="text-lg font-semibold text-[#111827]">診断結果履歴</h2>
            </div>

            {diagnosisItems.length === 0 ? (
              <p className="text-sm text-[#667085]">保存した診断結果はまだありません。</p>
            ) : (
              <ul className="space-y-3">
                {diagnosisItems.map((item) => {
                  const summary = buildDiagnosisSummary(item)
                  const isExpanded = expandedDiagnosisId === item.id
                  const recommendedPatternId = item.recommended_stack?.patternId
                  const recommendedTechSelectorUrl = recommendedPatternId
                    ? `/tools/tech-selector?s=${encodeSelectionToParam(buildSelectionForPattern(recommendedPatternId))}`
                    : '/tools/tech-selector'

                  return (
                    <li key={item.id} className="rounded-xl border border-[#EEF0F4] bg-[#F8FAFC] p-4">
                      <button
                        type="button"
                        onClick={() => setExpandedDiagnosisId((prev) => (prev === item.id ? null : item.id))}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#111827]">{summary.title}</p>
                            <p className="mt-1 text-xs text-[#667085]">
                              {summary.category} / {summary.patternId} / buildScore {summary.buildScore}
                            </p>
                          </div>
                          <span className="rounded-full bg-[#EEF0FE] px-2 py-1 text-[11px] font-medium text-[#3157E5]">
                            {new Date(item.created_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-4 space-y-3 border-t border-[#E5E7EB] pt-4">
                          <p className="text-xs text-[#667085]">アプリ種別: {summary.appTypeId}</p>
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/tools/diagnosis/start?restore=${item.id}`}
                              className="inline-flex items-center justify-center rounded-lg bg-[#3157E5] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2649cf]"
                            >
                              診断を再編集
                            </Link>
                            <Link
                              to={recommendedTechSelectorUrl}
                              className="inline-flex items-center justify-center rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-xs font-semibold text-[#344054] hover:bg-[#F8FAFC]"
                            >
                              推奨構成を開く
                            </Link>
                          </div>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-[#D0D5DD] bg-white p-5 shadow-[0_12px_32px_rgba(16,24,40,0.08)]">
            <div className="mb-4 flex items-center gap-2">
              <Layers3 size={18} className="text-[#3157E5]" />
              <h2 className="text-lg font-semibold text-[#111827]">技術要素の選択履歴</h2>
            </div>

            {selectionItems.length === 0 ? (
              <p className="text-sm text-[#667085]">保存した技術構成はまだありません。</p>
            ) : (
              <ul className="space-y-3">
                {selectionItems.map((item) => {
                  const selectedCount = countSelectedTechItems(item.selection ?? {})
                  const techSelectorUrl = `/tools/tech-selector?s=${encodeSelectionToParam(item.selection ?? {})}`

                  return (
                    <li key={item.id} className="rounded-xl border border-[#EEF0F4] bg-[#F8FAFC] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">{item.matched_pattern_ids?.[0] ?? '構成候補'}</p>
                          <p className="mt-1 text-xs text-[#667085]">{selectedCount}件の要素を選択</p>
                        </div>
                        <span className="rounded-full bg-[#ECFDF3] px-2 py-1 text-[11px] font-medium text-[#027A48]">
                          {new Date(item.created_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          to={techSelectorUrl}
                          className="inline-flex items-center justify-center rounded-lg bg-[#3157E5] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2649cf]"
                        >
                          選択を再現
                        </Link>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-[#D6DEFB] bg-[#EEF3FF] p-4 text-sm text-[#2748C7]">
        <div className="flex items-center gap-2">
          <FolderClock size={16} />
          <span>保存済みのデータはSupabaseの各テーブルに残ります。ここではログイン中のユーザー向けに一覧表示しています。</span>
        </div>
      </div>
    </div>
  )
}

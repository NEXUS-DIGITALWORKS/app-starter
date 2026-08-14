import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, FileDown, RotateCcw, Save } from 'lucide-react'
import { isSupabaseConfigured } from '../../../lib/supabaseClient'
import { useAuth } from '../../../hooks/useAuth'
import { buildSelectionForPattern } from '../../tech-stack-selector/lib/matchEngine'
import { encodeSelectionToParam } from '../../tech-stack-selector/lib/shareLink'
import { saveDiagnosisResult } from '../lib/resultsRepo'
import type { Answers, DiagnosisResult } from '../types'

type Props = {
  answers: Answers
  result: DiagnosisResult
  onReset: () => void
}

export function DiagnosisActions({ answers, result, onReset }: Props) {
  const { isAuthenticated } = useAuth()
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const supabaseConfigured = isSupabaseConfigured()
  const saveDisabledReason = !supabaseConfigured
    ? 'この環境では診断結果の保存機能が未設定です（管理者にお問い合わせください）'
    : !isAuthenticated
      ? 'ログインすると診断結果を保存できます'
      : null
  const techSelectorUrl = `/tools/tech-selector?s=${encodeSelectionToParam(buildSelectionForPattern(result.primaryPattern.id))}`

  const handleSave = async () => {
    setSaveState('saving')
    try {
      await saveDiagnosisResult(answers, result)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

  return (
    <div className="print:hidden">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-[#D6DEFB] bg-[#EAF1FF] px-5 py-4 text-sm text-[#2748C7] sm:flex-row sm:items-center">
        <span>次のおすすめ：この結果をもとに、技術要素セレクターで具体的な構成を確認できます。</span>
        <Link
          to={techSelectorUrl}
          className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-[#2748C7] hover:underline"
        >
          技術構成の詳細を見る
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {saveDisabledReason && saveState === 'idle' && (
        <div className="mb-4 flex items-start justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{saveDisabledReason}</span>
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/app/history"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-6 py-3 text-sm font-semibold text-[#344054] transition hover:bg-[#F8FAFC]"
        >
          保存したものを開く
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3157E5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2646c4]"
        >
          <FileDown size={16} />
          PDFレポートを出力
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === 'saving' || Boolean(saveDisabledReason)}
          title={saveDisabledReason ?? undefined}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-6 py-3 text-sm font-semibold text-[#344054] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Save size={16} />
          {saveState === 'saved' ? '保存しました' : saveState === 'saving' ? '保存中…' : saveState === 'error' ? '保存に失敗しました' : 'この診断を保存'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-6 py-3 text-sm font-semibold text-[#344054] transition hover:bg-[#F8FAFC]"
        >
          <RotateCcw size={16} />
          最初から診断する
        </button>
      </div>
    </div>
  )
}

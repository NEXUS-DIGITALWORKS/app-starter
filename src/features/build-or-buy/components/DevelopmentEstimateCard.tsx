import { Clock } from 'lucide-react'
import type { CostEstimate } from '../types'

export function DevelopmentEstimateCard({ costEstimate }: { costEstimate: CostEstimate }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800">
        <Clock size={16} />
        想定開発期間
      </div>
      <p className="text-lg font-bold text-emerald-900">
        {costEstimate.buildDevWeeksRange[0]}〜{costEstimate.buildDevWeeksRange[1]}週間（MVP）
      </p>
      <p className="mt-1 text-xs text-emerald-700">要件確定後の目安（AIコーディング前提）</p>
    </div>
  )
}

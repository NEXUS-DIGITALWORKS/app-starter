import { Brain } from 'lucide-react'
import type { DiagnosisResult } from '../types'

const FIT_LABEL: Record<DiagnosisResult['aiCodingFit'], string> = {
  high: '高',
  medium: '中',
  low: '低',
}

export function AiCodingFitCard({ result }: { result: DiagnosisResult }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800">
        <Brain size={16} />
        AIコーディング適性：{FIT_LABEL[result.aiCodingFit]}
      </div>
      <p className="text-xs leading-5 text-emerald-900">
        {result.aiCodingScope.aiCapable.slice(0, 3).join('、')} はAIコーディングで実装しやすい領域です。
      </p>
    </div>
  )
}

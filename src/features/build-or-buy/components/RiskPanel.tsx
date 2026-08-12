import { AlertTriangle } from 'lucide-react'
import type { RiskFinding, RiskSeverity } from '../types'

const SEVERITY_STYLE: Record<RiskSeverity, string> = {
  高: 'border-red-200 bg-red-50 text-red-900',
  中: 'border-amber-200 bg-amber-50 text-amber-900',
  低: 'border-slate-200 bg-slate-50 text-slate-700',
}

export function RiskPanel({ risks }: { risks: RiskFinding[] }) {
  if (risks.length === 0) {
    return <p className="text-sm text-slate-500">今回の条件で目立ったリスクは検出されませんでした。</p>
  }

  return (
    <div className="space-y-3">
      {risks.map((risk) => (
        <div key={risk.message} className={`rounded-xl border p-4 ${SEVERITY_STYLE[risk.severity]}`}>
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
            <AlertTriangle size={14} />
            {risk.riskType}・重要度{risk.severity}
          </div>
          <p className="text-sm leading-6">影響：{risk.message}</p>
          <p className="mt-1 text-sm font-semibold leading-6">対策：{risk.mitigation}</p>
        </div>
      ))}
    </div>
  )
}

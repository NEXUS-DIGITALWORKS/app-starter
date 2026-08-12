import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { ScoreContribution } from '../types'

type Props = {
  buildScore: number
  scoreBreakdown: ScoreContribution[]
}

export function ScoreBreakdownCard({ buildScore, scoreBreakdown }: Props) {
  const [open, setOpen] = useState(false)
  const sorted = [...scoreBreakdown].sort((a, b) => b.weight - a.weight)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <span>
          判定スコアの内訳を見る（合計 {buildScore > 0 ? `+${buildScore}` : buildScore}）
        </span>
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul className="mt-2 space-y-1.5">
          {sorted.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs">
              <span className="text-slate-600">{item.label}</span>
              <span className={`shrink-0 font-bold ${item.weight > 0 ? 'text-[#3157E5]' : 'text-rose-500'}`}>
                {item.weight > 0 ? `+${item.weight}` : item.weight}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[11px] text-slate-400">
        スコアが低い（マイナスが大きい）ほどSaaS活用寄り、高いほど独自開発寄りの判定になります。
      </p>
    </div>
  )
}

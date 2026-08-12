import type { RankedPattern } from '../types'

function normalizeScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round((Math.max(0, score) / 20) * 100)))
}

export function AlternativeStackCard({ alternatives }: { alternatives: RankedPattern[] }) {
  if (alternatives.length === 0) {
    return <p className="text-sm text-slate-500">今回の条件では、有力な代替候補はありません。</p>
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {alternatives.map((alt, index) => (
        <div key={alt.pattern.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">代替案{index + 1}</div>
          <div className="mt-1 text-sm font-bold text-slate-900">{alt.pattern.name}</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{alt.pattern.candidates.slice(0, 3).join(' + ')}</p>
          <div className="mt-3 text-xs font-semibold text-slate-500">適合度：{normalizeScore(alt.score)} / 100</div>
        </div>
      ))}
    </div>
  )
}

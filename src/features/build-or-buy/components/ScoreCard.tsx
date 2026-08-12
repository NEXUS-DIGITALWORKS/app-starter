import type { DiagnosisResult } from '../types'
import { EvaluationChart } from './EvaluationChart'

type Props = {
  result: DiagnosisResult
}

export function ScoreCard({ result }: Props) {
  const coreSaas = result.recommendedSaas[0]

  return (
    <section className="overflow-hidden rounded-2xl bg-[#0B1533] p-6 text-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#8DA0FF]">診断結果サマリー</p>

      <div className="mt-4 flex flex-col-reverse items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full">
          <div className="text-sm text-white/60">総合適合度</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-5xl font-black leading-none">{result.fitScore.overall}</span>
            <span className="text-lg text-white/50">/ 100</span>
          </div>

          <div className="mt-4 text-sm text-white/60">推奨方式</div>
          <div className="mt-1 text-lg font-bold leading-snug">
            {result.buildOrBuy.label}
            {coreSaas && <span className="text-[#8DA0FF]">（{coreSaas.name}を中心に）</span>}
          </div>

          <ul className="mt-4 space-y-1.5">
            {result.fitScore.axes.map((axis) => (
              <li key={axis.label} className="flex items-center gap-2 text-sm text-white/80">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: axis.color }} />
                <span>{axis.label}</span>
                <span className="ml-auto font-semibold">{axis.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0">
          <EvaluationChart overall={result.fitScore.overall} axes={result.fitScore.axes} />
        </div>
      </div>
    </section>
  )
}

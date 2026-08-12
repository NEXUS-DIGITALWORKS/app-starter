import {
  Boxes,
  Brain,
  CircleDollarSign,
  Layers3,
  Lightbulb,
  ListChecks,
  Scale,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react'
import type { Answers, DiagnosisResult } from '../types'
import { ScoreCard } from './ScoreCard'
import { ConditionSummaryCards } from './ConditionSummaryCards'
import { ArchitectureOverview } from './ArchitectureOverview'
import { BuildScopeCard } from './BuildScopeCard'
import { ExternalServiceScopeCard } from './ExternalServiceScopeCard'
import { AiCodingFitCard } from './AiCodingFitCard'
import { DevelopmentEstimateCard } from './DevelopmentEstimateCard'
import { AlternativeStackCard } from './AlternativeStackCard'
import { RiskPanel } from './RiskPanel'
import { ScoreBreakdownCard } from './ScoreBreakdownCard'
import { SummarySection } from './SummarySection'

function formatYen(value: number): string {
  return `${Math.round(value).toLocaleString('ja-JP')}円`
}

type Props = {
  result: DiagnosisResult
  answers: Answers
}

export function DiagnosisSummary({ result, answers }: Props) {
  const alternatives = result.rankedPatterns.filter((entry) => entry.pattern.id !== result.primaryPattern.id).slice(0, 2)

  return (
    <div className="space-y-4">
      <ScoreCard result={result} />

      <SummarySection icon={<Scale size={16} className="text-[#3157E5]" />} title="なぜこの判定になったか">
        {result.reasons.length > 0 && (
          <ul className="mb-4 space-y-2">
            {result.reasons.map((reason) => (
              <li key={reason} className="flex gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3157E5]" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        )}
        <ScoreBreakdownCard buildScore={result.buildOrBuy.buildScore} scoreBreakdown={result.buildOrBuy.scoreBreakdown} />
      </SummarySection>

      <SummarySection icon={<ListChecks size={16} className="text-[#3157E5]" />} title="現在の回答条件">
        <ConditionSummaryCards answers={answers} />
      </SummarySection>

      <SummarySection icon={<Lightbulb size={16} className="text-[#3157E5]" />} title="この構成で解決できること">
        {result.problemStatement && (
          <p className="mb-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">課題：「{result.problemStatement}」</p>
        )}
        <ul className="space-y-2">
          {result.solvedOutcomes.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SummarySection>

      {result.recommendedSaas.length > 0 && (
        <SummarySection icon={<Sparkles size={16} className="text-[#3157E5]" />} title="推奨SaaS">
          <div className="grid gap-3 sm:grid-cols-2">
            {result.recommendedSaas.map((product, index) => (
              <div
                key={product.id}
                className={`rounded-xl border p-3.5 ${index === 0 ? 'border-[#3157E5] bg-[#EEF1FE]' : 'border-slate-200 bg-white'}`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#3157E5]">
                  {index === 0
                    ? result.saasAdoptionStatus === 'existing'
                      ? '本命候補（既にお使いのSaaS）'
                      : '本命候補（新規導入）'
                    : '代替候補'}
                </div>
                <div className="mt-1 text-sm font-bold text-slate-950">{product.name}</div>
                <p className="mt-1.5 text-xs leading-5 text-slate-600">{product.description}</p>
              </div>
            ))}
          </div>
        </SummarySection>
      )}

      <SummarySection id="build-scope" icon={<Boxes size={16} className="text-[#3157E5]" />} title="自作範囲・外部サービス利用範囲">
        <div className="grid gap-3 sm:grid-cols-2">
          <BuildScopeCard items={result.buildRange} />
          <ExternalServiceScopeCard items={result.externalRange} />
        </div>
      </SummarySection>

      <SummarySection icon={<CircleDollarSign size={16} className="text-[#3157E5]" />} title="費用の目安">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-3.5">
            <div className="text-xs font-semibold text-slate-500">SaaS費用（{result.costEstimate.horizonYears}年間）</div>
            {result.costEstimate.saasTotalOverHorizon !== undefined ? (
              <>
                <div className="mt-1 text-xl font-bold text-slate-950">{formatYen(result.costEstimate.saasTotalOverHorizon)}</div>
                <p className="mt-0.5 text-xs text-slate-500">月額目安 {formatYen(result.costEstimate.saasMonthlyCost ?? 0)}</p>
              </>
            ) : (
              <div className="mt-1 text-sm text-slate-500">該当するSaaS候補なし</div>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 p-3.5">
            <div className="text-xs font-semibold text-slate-500">自作の運用費用（{result.costEstimate.horizonYears}年間）</div>
            <div className="mt-1 text-xl font-bold text-slate-950">
              {formatYen(result.costEstimate.buildHostingTotalOverHorizon[0])}〜
              {formatYen(result.costEstimate.buildHostingTotalOverHorizon[1])}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              初期開発 {result.costEstimate.buildDevWeeksRange[0]}〜{result.costEstimate.buildDevWeeksRange[1]}週間目安
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-slate-400">{result.costEstimate.note}</p>
      </SummarySection>

      <SummarySection
        icon={<Layers3 size={16} className="text-[#3157E5]" />}
        title="推奨構成（アーキテクチャ概要）"
        action={
          <button
            type="button"
            onClick={() => document.getElementById('build-scope')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#3157E5] hover:bg-[#EEF1FE]"
          >
            詳細を見る
          </button>
        }
      >
        <ArchitectureOverview result={result} />
      </SummarySection>

      <SummarySection icon={<Brain size={16} className="text-[#3157E5]" />} title="AIコーディング適性・想定開発期間">
        <div className="grid gap-3 sm:grid-cols-2">
          <AiCodingFitCard result={result} />
          <DevelopmentEstimateCard costEstimate={result.costEstimate} />
        </div>
      </SummarySection>

      <SummarySection icon={<Sparkles size={16} className="text-[#3157E5]" />} title="代替案">
        <AlternativeStackCard alternatives={alternatives} />
      </SummarySection>

      {result.notAdopted.length > 0 && (
        <SummarySection icon={<XCircle size={16} className="text-[#3157E5]" />} title="採用しなかった構成">
          <ul className="space-y-3">
            {result.notAdopted.map((item) => (
              <li key={item.name} className="rounded-xl bg-slate-50 px-3.5 py-2.5">
                <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                <div className="mt-0.5 text-xs text-slate-600">{item.reason}</div>
              </li>
            ))}
          </ul>
        </SummarySection>
      )}

      <SummarySection icon={<ShieldAlert size={16} className="text-[#3157E5]" />} title="リスク・注意点">
        <RiskPanel risks={result.risks} />
      </SummarySection>

      <SummarySection icon={<ListChecks size={16} className="text-[#3157E5]" />} title="次の作業">
        <ul className="grid gap-2 sm:grid-cols-2">
          {result.nextSteps.map((item) => (
            <li key={item} className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
              {item}
            </li>
          ))}
        </ul>
      </SummarySection>
    </div>
  )
}

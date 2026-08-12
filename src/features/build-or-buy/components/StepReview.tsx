import { AlertTriangle, ArrowRight, FileSearch, Layers, ListChecks, Network, Settings2, Target } from 'lucide-react'
import { diagnosisSteps } from '../data/steps'
import { getQuestion } from '../data/questions'
import type { Answers } from '../types'
import { SummarySection } from './SummarySection'

type Props = {
  answers: Answers
  onEditStep: (step: number) => void
  onViewResult: () => void
}

const STEP_ICON: Record<number, typeof Target> = {
  1: Target,
  2: ListChecks,
  3: Layers,
  4: Network,
  5: Settings2,
}

function formatValue(questionId: string, values: string[]): string {
  if (values.length === 0) return '未回答'
  const question = getQuestion(questionId)
  if (question?.answerType === 'free_text' || question?.answerType === 'number') return values[0]
  return values.map((value) => question?.options?.find((option) => option.value === value)?.label ?? value).join('・')
}

function isMissing(questionId: string, values: string[]): boolean {
  const question = getQuestion(questionId)
  return Boolean(question?.required) && values.length === 0
}

export function StepReview({ answers, onEditStep, onViewResult }: Props) {
  const reviewSteps = diagnosisSteps.filter((step) => step.questionIds.length > 0)
  const missingCount = reviewSteps.reduce(
    (count, step) => count + step.questionIds.filter((id) => isMissing(id, answers[id] ?? [])).length,
    0,
  )

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#D0D5DD] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wide text-[#3157E5]">STEP 6</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">確認・診断</h2>
        <p className="mt-1 text-sm text-[#667085]">
          回答内容を確認してください。修正する場合は各項目の「編集」から戻れます。内容がよければ「診断結果を見る」に進んでください。
        </p>

        {missingCount > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>未回答の必須項目が{missingCount}件あります。該当ステップの「編集」から入力してください。</span>
          </div>
        )}
      </div>

      {reviewSteps.map((step) => {
        const Icon = STEP_ICON[step.id] ?? FileSearch
        const stepMissing = step.questionIds.filter((id) => isMissing(id, answers[id] ?? [])).length

        return (
          <SummarySection
            key={step.id}
            icon={<Icon size={16} className="text-[#3157E5]" />}
            title={step.title}
            action={
              <button
                type="button"
                onClick={() => onEditStep(step.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#D0D5DD] px-2.5 py-1 text-xs font-semibold text-[#3157E5] hover:bg-[#EEF1FE]"
              >
                編集
              </button>
            }
          >
            {stepMissing > 0 && (
              <p className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                <AlertTriangle size={12} />
                未回答の必須項目が{stepMissing}件あります
              </p>
            )}
            <dl className="space-y-2.5">
              {step.questionIds.map((questionId) => {
                const question = getQuestion(questionId)
                if (!question) return null
                const value = answers[questionId] ?? []
                if (value.length === 0 && !question.required) return null
                const missing = isMissing(questionId, value)
                return (
                  <div key={questionId} className="flex flex-col gap-1 text-sm sm:flex-row sm:gap-3">
                    <dt className="text-[#667085] sm:w-2/5 sm:shrink-0">{question.question}</dt>
                    <dd className={`min-w-0 ${missing ? 'font-semibold text-amber-600' : 'text-[#344054]'}`}>
                      {formatValue(questionId, value)}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </SummarySection>
        )
      })}

      <button
        type="button"
        onClick={onViewResult}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3157E5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2646c4] sm:w-auto"
      >
        診断結果を見る
        <ArrowRight size={16} />
      </button>
    </div>
  )
}

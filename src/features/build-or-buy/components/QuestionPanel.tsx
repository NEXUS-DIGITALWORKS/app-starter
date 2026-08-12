import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getQuestion } from '../data/questions'
import type { DiagnosisStep } from '../data/steps'
import type { Answers } from '../types'
import { AppTypeSelector } from './AppTypeSelector'
import { QuestionField } from './QuestionField'

type Props = {
  step: DiagnosisStep
  answers: Answers
  onAnswerChange: (questionId: string, value: string[]) => void
  onBack: () => void
  onNext: () => void
  canGoBack: boolean
  canContinue: boolean
  isLastStep: boolean
}

export function QuestionPanel({ step, answers, onAnswerChange, onBack, onNext, canGoBack, canContinue, isLastStep }: Props) {
  return (
    <div className="rounded-2xl border border-[#D0D5DD] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-8">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#3157E5]">STEP {step.id}</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">{step.title}</h2>
        <p className="mt-1 text-sm text-[#667085]">{step.description}</p>
      </div>

      <div>
        {step.questionIds.map((questionId) => {
          const question = getQuestion(questionId)
          if (!question) return null
          const value = answers[questionId] ?? []

          if (question.id === 'q_app_type') {
            return (
              <div key={question.id} className="border-b border-[#EEF0F4] py-5 first:pt-0">
                <h3 className="mb-3 text-base font-bold tracking-tight text-[#111827]">
                  {question.question}
                  {question.required && <span className="ml-1 text-sm font-normal text-red-500">*</span>}
                </h3>
                <AppTypeSelector value={value} onChange={(v) => onAnswerChange(question.id, v)} />
              </div>
            )
          }

          return (
            <QuestionField
              key={question.id}
              question={question}
              value={value}
              onChange={(v) => onAnswerChange(question.id, v)}
            />
          )
        })}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#EEF0F4] pt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="inline-flex items-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ArrowLeft size={16} />
          戻る
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className="inline-flex items-center gap-2 rounded-xl bg-[#3157E5] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2646c4] disabled:cursor-not-allowed disabled:opacity-35"
        >
          {isLastStep ? '確認画面へ' : '次へ'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

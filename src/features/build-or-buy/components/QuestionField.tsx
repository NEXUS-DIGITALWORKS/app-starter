import { Check, Lightbulb } from 'lucide-react'
import type { Question } from '../types'

type Props = {
  question: Question
  value: string[]
  onChange: (value: string[]) => void
}

const NUMBER_UNIT_SUFFIX: Record<string, string> = {
  q_users_count: '人',
  q_concurrent: '人',
}

export function QuestionField({ question, value, onChange }: Props) {
  const toggle = (optionValue: string) => {
    if (question.answerType === 'single') {
      onChange([optionValue])
      return
    }
    onChange(value.includes(optionValue) ? value.filter((item) => item !== optionValue) : [...value, optionValue])
  }

  const hasDescriptions = question.options?.some((option) => option.description) ?? false
  const isCompact = (question.answerType === 'single' || question.answerType === 'multi') && !hasDescriptions

  return (
    <div className="border-b border-[#EEF0F4] py-5 first:pt-0 last:border-b-0 last:pb-0">
      <div className="mb-3">
        <h3 className="text-base font-bold tracking-tight text-[#111827]">
          {question.question}
          {question.required && <span className="ml-1 text-sm font-normal text-red-500">*</span>}
        </h3>
        {question.description && <p className="mt-1 text-sm text-[#667085]">{question.description}</p>}
        {question.notSureHint && (
          <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
            <Lightbulb size={13} className="mt-0.5 shrink-0" />
            <span>{question.notSureHint}</span>
          </p>
        )}
      </div>

      {question.answerType === 'free_text' && (
        <textarea
          className="w-full rounded-xl border border-[#D0D5DD] p-3 text-sm text-[#111827] focus:border-[#3157E5] focus:outline-none focus:ring-1 focus:ring-[#3157E5]"
          rows={3}
          value={value[0] ?? ''}
          onChange={(event) => onChange(event.target.value ? [event.target.value] : [])}
          placeholder="例：日報を簡単に集計したい、受注から請求までを一元管理したい"
        />
      )}

      {question.answerType === 'number' && (
        <div className="flex max-w-[200px] items-center gap-2 rounded-xl border border-[#D0D5DD] px-3 focus-within:border-[#3157E5] focus-within:ring-1 focus-within:ring-[#3157E5]">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            className="w-full border-none p-2.5 text-sm text-[#111827] focus:outline-none"
            value={value[0] ?? ''}
            onChange={(event) => onChange(event.target.value ? [event.target.value] : [])}
            placeholder="0"
          />
          {NUMBER_UNIT_SUFFIX[question.id] && (
            <span className="shrink-0 text-sm text-[#98A2B3]">{NUMBER_UNIT_SUFFIX[question.id]}</span>
          )}
        </div>
      )}

      {isCompact && question.options && (
        <div className="flex flex-wrap gap-2">
          {question.options.map((option) => {
            const selected = value.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  selected
                    ? 'border-[#3157E5] bg-[#3157E5] text-white'
                    : 'border-[#D0D5DD] bg-white text-[#344054] hover:border-[#98A2B3] hover:bg-[#F8FAFC]'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}

      {!isCompact && (question.answerType === 'single' || question.answerType === 'multi') && question.options && (
        <div className="grid gap-2 sm:grid-cols-2">
          {question.options.map((option) => {
            const selected = value.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                  selected
                    ? 'border-[#3157E5] bg-[#EEF1FE] text-[#111827]'
                    : 'border-[#D0D5DD] bg-white text-[#111827] hover:border-[#98A2B3] hover:bg-[#F8FAFC]'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selected ? 'border-[#3157E5] bg-[#3157E5] text-white' : 'border-[#D0D5DD]'
                  }`}
                >
                  {selected && <Check size={13} strokeWidth={3} />}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{option.label}</span>
                  {option.description && <span className="mt-0.5 block text-xs text-[#667085]">{option.description}</span>}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

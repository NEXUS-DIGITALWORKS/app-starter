import { Building2, Database, ListChecks, Users } from 'lucide-react'
import { getQuestion } from '../data/questions'
import type { Answers } from '../types'

type Props = {
  answers: Answers
}

function optionLabel(questionId: string, value?: string) {
  if (!value) return '未回答'
  return getQuestion(questionId)?.options?.find((option) => option.value === value)?.label ?? value
}

function optionLabels(questionId: string, values: string[]) {
  if (values.length === 0) return '未回答'
  const question = getQuestion(questionId)
  return values.map((value) => question?.options?.find((option) => option.value === value)?.label ?? value).join('・')
}

export function ConditionSummaryCards({ answers }: Props) {
  const usersCount = answers.q_users_count?.[0]
  const scope = answers.q_scope?.[0]
  const features = answers.q_biz_features ?? []
  const dataComplexity = answers.q_data_complexity?.[0]

  const items = [
    { icon: Users, label: '想定利用人数', value: usersCount ? `${usersCount}人程度` : '未回答' },
    { icon: Building2, label: '利用範囲', value: optionLabel('q_scope', scope) },
    { icon: ListChecks, label: '必要な主な機能', value: optionLabels('q_biz_features', features.slice(0, 3)) },
    { icon: Database, label: 'データ複雑度', value: optionLabel('q_data_complexity', dataComplexity) },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF1FE] text-[#3157E5]">
            <item.icon size={16} />
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-slate-500">{item.label}</span>
            <span className="block truncate text-sm font-semibold text-slate-900">{item.value}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

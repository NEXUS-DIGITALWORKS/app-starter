import {
  BookOpenText,
  Boxes,
  BriefcaseBusiness,
  CalendarClock,
  ChartNoAxesCombined,
  Check,
  ClipboardCheck,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import { appTypes } from '../data/appTypes'

type Props = {
  value: string[]
  onChange: (value: string[]) => void
}

const APP_TYPE_ICONS: Record<string, LucideIcon> = {
  internal_ops: BriefcaseBusiness,
  crm_deals: Users,
  approval_workflow: ClipboardCheck,
  reservation: CalendarClock,
  inventory: Boxes,
  knowledge_ai_search: BookOpenText,
  saas_integration: Workflow,
  dashboard_analytics: ChartNoAxesCombined,
}

export function AppTypeSelector({ value, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {appTypes.map((appType) => {
        const selected = value.includes(appType.id)
        const Icon = APP_TYPE_ICONS[appType.id] ?? BriefcaseBusiness
        return (
          <button
            key={appType.id}
            type="button"
            onClick={() => onChange([appType.id])}
            className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition ${
              selected
                ? 'border-[#3157E5] bg-[#EEF1FE]'
                : 'border-[#D0D5DD] bg-white hover:border-[#98A2B3] hover:bg-[#F8FAFC]'
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                selected ? 'bg-[#3157E5] text-white' : 'bg-slate-100 text-[#667085]'
              }`}
            >
              <Icon size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[#111827]">{appType.name}</span>
              <span className="mt-0.5 block text-xs text-[#667085]">{appType.description}</span>
            </span>
            {selected && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#3157E5] text-white">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

import type { ReactNode } from 'react'

type Props = {
  icon: ReactNode
  title: string
  action?: ReactNode
  id?: string
  children: ReactNode
}

export function SummarySection({ icon, title, action, id, children }: Props) {
  return (
    <section id={id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

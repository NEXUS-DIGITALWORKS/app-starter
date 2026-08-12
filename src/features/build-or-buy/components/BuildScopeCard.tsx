import { CircleCheck } from 'lucide-react'

export function BuildScopeCard({ items }: { items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 text-sm font-semibold text-slate-700">自作する範囲</div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-slate-700">
            <CircleCheck className="mt-0.5 shrink-0 text-emerald-600" size={16} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

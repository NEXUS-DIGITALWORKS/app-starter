export function ExternalServiceScopeCard({ items }: { items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 text-sm font-semibold text-slate-700">外部サービスを利用する範囲</div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-slate-700">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3157E5]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

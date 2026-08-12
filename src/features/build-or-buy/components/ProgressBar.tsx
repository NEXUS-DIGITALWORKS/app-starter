type Props = {
  current: number
  total: number
}

export function ProgressBar({ current, total }: Props) {
  const percentage = total === 0 ? 0 : Math.round((current / total) * 100)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm text-[#667085]">
        <span>回答進捗</span>
        <span className="font-semibold text-[#111827]">{percentage}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#EEF0F4]">
        <div
          className="h-full rounded-full bg-[#3157E5] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

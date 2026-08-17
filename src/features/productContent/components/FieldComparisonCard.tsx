interface FieldComparisonCardProps {
  title: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  onLeftValueChange?: (value: string) => void;
  onRightValueChange?: (value: string) => void;
}

export default function FieldComparisonCard({
  title,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  onLeftValueChange,
  onRightValueChange,
}: FieldComparisonCardProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
      <h3 className="mb-4 text-sm font-semibold text-[#111827]">{title}</h3>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold text-[#98A2B3]">{leftLabel}</p>
          {onLeftValueChange ? (
            <textarea
              value={leftValue}
              onChange={(e) => onLeftValueChange(e.target.value)}
              rows={4}
              className="w-full resize-y rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-sm leading-relaxed text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5]"
            />
          ) : (
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#344054]">{leftValue}</p>
          )}
        </div>
        <div className="rounded-lg bg-[#F8FAFC] p-3">
          <p className="mb-1 text-xs font-semibold text-[#3157E5]">{rightLabel}</p>
          {onRightValueChange ? (
            <textarea
              value={rightValue}
              onChange={(e) => onRightValueChange(e.target.value)}
              rows={4}
              className="w-full resize-y rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-sm leading-relaxed text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5]"
            />
          ) : (
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#344054]">{rightValue}</p>
          )}
        </div>
      </div>
    </div>
  );
}

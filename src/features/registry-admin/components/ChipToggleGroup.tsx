import { cn } from '../../../lib/utils'

type Option = { id: string; label: string }

type Props = {
  options: Option[]
  selectedIds: string[]
  onToggle: (id: string) => void
  disabled?: boolean
  emptyLabel?: string
}

/** タグ・技術要素の複数選択に使う「クリックでトグルするchip」。新規radix依存を増やさないための共通実装。 */
export function ChipToggleGroup({ options, selectedIds, onToggle, disabled, emptyLabel }: Props) {
  if (options.length === 0) {
    return <p className="text-xs text-[#98A2B3]">{emptyLabel ?? '選択肢がありません。'}</p>
  }
  return (
    <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
      {options.map((option) => {
        const selected = selectedIds.includes(option.id)
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(option.id)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              selected
                ? 'border-[#3157E5] bg-[#EAF1FF] text-[#2748C7]'
                : 'border-[#E5E7EB] bg-white text-[#475467] hover:bg-[#F8FAFC]',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

type Props = {
  variant: 'no-data' | 'no-results'
}

export function SavedHistoryEmptyState({ variant }: Props) {
  if (variant === 'no-results') {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
        <p className="text-sm text-[#667085]">条件に一致する保存履歴がありません。</p>
        <p className="mt-1 text-sm text-[#667085]">検索条件を変更してください。</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
      <p className="text-sm text-[#667085]">まだ保存された履歴はありません。</p>
      <p className="mt-1 text-sm text-[#667085]">診断または技術構成を保存すると、ここからいつでも再利用できます。</p>
      <Link
        to="/tools/diagnosis"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#3157E5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2649cf]"
      >
        新しい診断を始める
        <ArrowRight size={15} />
      </Link>
    </div>
  )
}

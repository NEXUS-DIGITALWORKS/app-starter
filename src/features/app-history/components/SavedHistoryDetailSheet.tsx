import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../../../components/ui/sheet'
import {
  formatShortDate,
  getDiagnosisRestoreUrl,
  getRecommendedTechSelectorUrl,
  getTechSelectorReplayUrl,
  type SavedHistoryItem,
} from '../lib/historyViewModel'

type Props = {
  item: SavedHistoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditMeta: (item: SavedHistoryItem) => void
}

export function SavedHistoryDetailSheet({ item, open, onOpenChange, onEditMeta }: Props) {
  const isDiagnosis = item?.type === 'diagnosis'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto">
        {item && (
          <>
            <SheetHeader>
              <Badge className="w-fit border-transparent bg-[#EAF1FF] text-[#2748C7] hover:bg-[#EAF1FF]">
                {isDiagnosis ? '診断結果' : '技術構成'}
              </Badge>
              <SheetTitle>{item.title}</SheetTitle>
              <SheetDescription>{formatShortDate(item.createdAt)}</SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-5 px-4">
              {isDiagnosis ? (
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">診断内容</h3>
                  <p className="mt-1.5 text-sm text-[#475467]">{item.subtitle}</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">選択した技術要素（{item.techNames.length}）</h3>
                  {item.techByCategory.length > 0 ? (
                    <div className="mt-1.5 divide-y divide-gray-100">
                      {item.techByCategory.map((group) => (
                        <div
                          key={group.categoryTitle}
                          className="flex items-start justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0"
                        >
                          <span className="shrink-0 text-[#667085]">{group.categoryTitle}</span>
                          <span className="text-right font-semibold text-[#344054]">{group.names.join('、')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1.5 text-sm text-[#667085]">選択された技術要素はありません。</p>
                  )}
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-[#111827]">メモ</h3>
                {item.memo ? (
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-[#475467]">{item.memo}</p>
                ) : (
                  <p className="mt-1.5 text-sm text-[#98A2B3]">メモはありません。</p>
                )}
              </div>
            </div>

            <SheetFooter>
              {isDiagnosis ? (
                <>
                  <Link
                    to={getDiagnosisRestoreUrl(item)}
                    className="inline-flex items-center justify-center rounded-lg bg-[#3157E5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2649cf]"
                  >
                    診断を再実施
                  </Link>
                  <Link
                    to={getRecommendedTechSelectorUrl(item)}
                    className="inline-flex items-center justify-center rounded-lg border border-[#D0D5DD] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] hover:bg-[#F8FAFC]"
                  >
                    推奨構成を開く
                  </Link>
                </>
              ) : (
                <Link
                  to={getTechSelectorReplayUrl(item)}
                  className="inline-flex items-center justify-center rounded-lg bg-[#3157E5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2649cf]"
                >
                  選択を再現
                </Link>
              )}
              <button
                type="button"
                onClick={() => onEditMeta(item)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D0D5DD] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] hover:bg-[#F8FAFC]"
              >
                <Pencil size={14} />
                タイトル・メモを編集
              </button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

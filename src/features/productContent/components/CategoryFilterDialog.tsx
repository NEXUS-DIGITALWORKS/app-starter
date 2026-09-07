import { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCategoryCode, getCategoryDisplayName } from '../../categories/lib/categoryName';
import type { Category } from '../../categories/types';

// コードが数値化できる場合はその番号順、できない場合は文字列順にフォールバックする。
function compareByCode(a: Category, b: Category): number {
  const na = Number(formatCategoryCode(a.code));
  const nb = Number(formatCategoryCode(b.code));
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return a.code.localeCompare(b.code);
}

interface CategoryFilterDialogProps {
  categoryOptions: Category[];
  selectedIds: string[];
  onToggle: (categoryId: string) => void;
  onClear: () => void;
}

// カテゴリ数が多い（数十〜）ため、単純なチェックボックス列挙ではなくキーワード絞り込み付きの
// グリッド表示ポップアップにする。トリガーは選択件数を表示するボタン。
export default function CategoryFilterDialog({ categoryOptions, selectedIds, onToggle, onClear }: CategoryFilterDialogProps) {
  const [keyword, setKeyword] = useState('');

  const label = selectedIds.length === 0 ? 'すべて' : `${selectedIds.length}件選択中`;

  const filteredOptions = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    const sorted = [...categoryOptions].sort(compareByCode);
    if (!q) return sorted;
    return sorted.filter((c) => {
      const haystack = [c.code, c.nameJa, c.nameEn, c.nameZhTw].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [categoryOptions, keyword]);

  return (
    <Dialog onOpenChange={(open) => !open && setKeyword('')}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 w-[180px] justify-between border-[#D0D5DD] font-normal text-[#344054]">
          <span className="truncate">{label}</span>
          <ChevronDown size={14} className="shrink-0 text-[#98A2B3]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>カテゴリで絞り込み</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="コード・名称で検索"
            className="h-9 pl-8"
            aria-label="カテゴリをコード・名称で検索"
          />
        </div>

        <div className="grid max-h-80 grid-cols-1 gap-x-4 gap-y-1 overflow-y-auto pr-1 sm:grid-cols-3">
          {filteredOptions.length === 0 && (
            <p className="col-span-full py-6 text-center text-sm text-[#98A2B3]">該当するカテゴリがありません</p>
          )}
          {filteredOptions.map((c) => (
            <label
              key={c.id}
              className="flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1.5 text-sm text-[#344054] hover:bg-[#F8FAFC]"
              title={`${c.code} ${getCategoryDisplayName(c)}`}
            >
              <Checkbox checked={selectedIds.includes(c.id)} onChange={() => onToggle(c.id)} />
              <span className="min-w-0 flex-1 truncate">
                <span className="text-[#98A2B3]">{c.code}</span> {getCategoryDisplayName(c)}
              </span>
            </label>
          ))}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={selectedIds.length === 0}
            className="text-[#475467]"
          >
            選択をクリア
          </Button>
          <DialogClose asChild>
            <Button type="button" size="sm">
              閉じる
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

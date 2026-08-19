import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ImageOff, MoreVertical, Pencil, RefreshCw, Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProductStatusBadge from './ProductStatusBadge';
import SeoScoreBadge from './SeoScoreBadge';
import ProductPagination from './ProductPagination';
import { CATEGORY_TYPE_CLASS } from '../../categories/components/CategoryBadge';
import { getCategoryDisplayName } from '../../categories/lib/categoryName';
import type { Category } from '../../categories/types';
import type { NameLocale, ProductListItem } from '../types/product';

const COLUMN_COUNT = 10;

const OTHER_BULK_ACTIONS = ['SEO分析', 'AI翻訳', '再同期', 'エクスポート'];
const MORE_ACTIONS = ['再同期', 'AI分析', '複製', 'CSV出力'];

function ProductThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="flex h-12 w-12 items-center justify-center rounded-md border border-[#EEF0F4] bg-[#F8FAFC] text-[#98A2B3]">
        <ImageOff size={18} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-12 w-12 rounded-md border border-[#EEF0F4] object-contain"
    />
  );
}

// 列幅を狭めた分、横1列ではなく3段程度まで折り返して表示する。カテゴリ名は短いことが多いため
// 1段あたり2〜3件程度で収まる想定で、3段を超えそうな分は「+N」にまとめる（実測ではなく件数での近似）。
const MAX_VISIBLE_CATEGORIES = 6;

function getDisplayName(item: ProductListItem, nameLocale: NameLocale): string {
  if (nameLocale === 'zh_tw') return item.nameZhTw || item.name;
  if (nameLocale === 'en') return item.nameEn || item.name;
  return item.name;
}

function ProductCategoryCell({ item, categoryMap }: { item: ProductListItem; categoryMap: Map<string, Category> }) {
  // primaryCategoryIdが未設定の商品も一定数あるため、その場合は
  // categoryIds の順序（productListApi側でis_primary優先・sort_order順に取得済み）をそのまま使う。
  const ids = item.categoryIds ?? [];
  const orderedIds = item.primaryCategoryId
    ? [item.primaryCategoryId, ...ids.filter((id) => id !== item.primaryCategoryId)]
    : ids;
  const categories = orderedIds.map((id) => categoryMap.get(id)).filter((c): c is Category => Boolean(c));

  if (categories.length === 0) return <span className="text-xs text-[#98A2B3]">未設定</span>;

  const visible = categories.slice(0, MAX_VISIBLE_CATEGORIES);
  const hiddenCount = categories.length - visible.length;

  return (
    <div className="flex max-w-[190px] flex-wrap items-center gap-1">
      {visible.map((c) => (
        <span
          key={c.id}
          className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', CATEGORY_TYPE_CLASS[c.categoryType])}
        >
          {getCategoryDisplayName(c)}
        </span>
      ))}
      {hiddenCount > 0 && <span className="text-xs text-[#98A2B3]">+{hiddenCount}</span>}
    </div>
  );
}

interface ProductTableProps {
  items: ProductListItem[];
  categoryMap: Map<string, Category>;
  nameLocale: NameLocale;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onClearFilters: () => void;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onAddTag: (ids: string[], tag: string) => Promise<void>;
  onRemoveTag: (id: string, tag: string) => Promise<void>;
}

export default function ProductTable({
  items,
  categoryMap,
  nameLocale,
  isLoading,
  error,
  onRetry,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onClearFilters,
  page,
  limit,
  total,
  onPageChange,
  onAddTag,
  onRemoveTag,
}: ProductTableProps) {
  const navigate = useNavigate();
  const [previewItem, setPreviewItem] = useState<ProductListItem | null>(null);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const goToDetail = (sku: string) => navigate(`/app/products/${sku}`);

  const handleConfirmAddTag = async () => {
    const tag = tagInput.trim();
    if (!tag) return;
    setIsAddingTag(true);
    try {
      await onAddTag([...selectedIds], tag);
      setTagDialogOpen(false);
      setTagInput('');
    } finally {
      setIsAddingTag(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#EEF0F4] px-4 py-3">
        <span className="text-sm font-medium text-[#344054]">{selectedIds.size}件選択</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={selectedIds.size === 0} className="border-[#D0D5DD] text-[#475467]">
              一括操作
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => setTagDialogOpen(true)}>
              <Tag size={14} />
              タグを追加
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {OTHER_BULK_ACTIONS.map((action) => (
              <DropdownMenuItem key={action} onSelect={() => console.info('[bulk-action]', action, [...selectedIds])}>
                {action}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox
                aria-label="すべて選択"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={onToggleSelectAll}
              />
            </TableHead>
            <TableHead className="w-14">画像</TableHead>
            <TableHead className="min-w-[84px]">SKU</TableHead>
            <TableHead className="min-w-[160px]">商品名</TableHead>
            <TableHead className="min-w-[110px]">ブランド</TableHead>
            <TableHead className="min-w-[190px]">カテゴリ</TableHead>
            <TableHead className="min-w-[170px]">タグ</TableHead>
            <TableHead className="min-w-[80px]">ステータス</TableHead>
            <TableHead className="min-w-[126px]">SEOスコア/課題</TableHead>
            <TableHead className="min-w-[88px] text-right">アクション</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell colSpan={COLUMN_COUNT}>
                  <Skeleton className="h-10 w-full" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && error && (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="py-12 text-center">
                <p className="text-sm font-medium text-[#B42318]">{error}</p>
                <Button variant="outline" size="sm" className="mt-3 border-[#D0D5DD] text-[#475467]" onClick={onRetry}>
                  <RefreshCw size={14} />
                  再読み込み
                </Button>
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !error && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="py-12 text-center">
                <p className="text-sm font-medium text-[#344054]">条件に一致する商品がありません</p>
                <p className="mt-1 text-sm text-[#98A2B3]">検索条件を変更してください</p>
                <Button variant="outline" size="sm" className="mt-3 border-[#D0D5DD] text-[#475467]" onClick={onClearFilters}>
                  検索条件をクリア
                </Button>
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            !error &&
            items.map((item) => (
              <TableRow key={item.id} className="cursor-pointer" onClick={() => goToDetail(item.sku)}>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    aria-label={`${item.name}を選択`}
                    checked={selectedIds.has(item.id)}
                    onChange={() => onToggleSelect(item.id)}
                  />
                </TableCell>
                <TableCell>
                  <ProductThumbnail src={item.imageUrl} alt={item.name} />
                </TableCell>
                <TableCell className="text-xs text-[#475467]">{item.sku}</TableCell>
                <TableCell className="max-w-[220px]">
                  <p className="line-clamp-2 text-sm font-medium text-[#111827]">{getDisplayName(item, nameLocale)}</p>
                  {item.shortDescription && <p className="truncate text-xs text-[#667085]">{item.shortDescription}</p>}
                </TableCell>
                <TableCell className="text-sm text-[#344054]">{item.brand}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <ProductCategoryCell item={item} categoryMap={categoryMap} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {item.tags && item.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-[#EEF0FE] py-0.5 pl-2 pr-1 text-xs font-medium text-[#3157E5]"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => onRemoveTag(item.id, tag)}
                            aria-label={`タグ「${tag}」を削除`}
                            className="rounded-full p-0.5 hover:bg-[#D6DEFB]"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-[#98A2B3]">なし</span>
                  )}
                </TableCell>
                <TableCell>
                  <ProductStatusBadge status={item.status} />
                </TableCell>
                <TableCell>
                  <SeoScoreBadge score={item.seoScore} issueType={item.seoIssue} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 border-[#D0D5DD] text-[#475467]"
                      aria-label="編集"
                      onClick={() => goToDetail(item.sku)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-8 text-[#667085]" aria-label="その他の操作">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setPreviewItem(item)}>
                          <Eye size={14} />
                          プレビュー
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {MORE_ACTIONS.map((action) => (
                          <DropdownMenuItem key={action} onSelect={() => console.info('[row-action]', action, item.sku)}>
                            {action}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => console.info('[row-action]', 'アーカイブ', item.sku)}
                        >
                          アーカイブ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {!isLoading && !error && items.length > 0 && (
        <ProductPagination page={page} limit={limit} total={total} onPageChange={onPageChange} />
      )}

      <Dialog open={previewItem !== null} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{previewItem?.name}</DialogTitle>
            <DialogDescription>SKU: {previewItem?.sku}</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-[#667085]">プレビュー機能は準備中です。実データ接続後にEC上の表示イメージを確認できるようになります。</p>
        </DialogContent>
      </Dialog>

      <Dialog
        open={tagDialogOpen}
        onOpenChange={(open) => {
          setTagDialogOpen(open);
          if (!open) setTagInput('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タグを追加</DialogTitle>
            <DialogDescription>{selectedIds.size}件の商品にタグを追加します。</DialogDescription>
          </DialogHeader>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="タグ名を入力（例: セール対象）"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirmAddTag();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagDialogOpen(false)} className="border-[#D0D5DD] text-[#475467]">
              キャンセル
            </Button>
            <Button
              onClick={handleConfirmAddTag}
              disabled={!tagInput.trim() || isAddingTag}
              className="bg-[#3157E5] hover:bg-[#2748C7] hover:opacity-100"
            >
              追加する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

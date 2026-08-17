import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ImageOff, MoreVertical, Pencil, RefreshCw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
import type { ProductListItem } from '../types/product';

const BULK_ACTIONS = ['SEO分析', 'AI翻訳', '再同期', 'エクスポート'];
const MORE_ACTIONS = ['再同期', 'AI分析', '複製', 'CSV出力'];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface ProductTableProps {
  items: ProductListItem[];
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
}

export default function ProductTable({
  items,
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
}: ProductTableProps) {
  const navigate = useNavigate();
  const [previewItem, setPreviewItem] = useState<ProductListItem | null>(null);

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const goToDetail = (sku: string) => navigate(`/app/products/${sku}`);

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
            {BULK_ACTIONS.map((action) => (
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
            <TableHead className="min-w-[104px]">SKU</TableHead>
            <TableHead className="min-w-[220px]">商品名</TableHead>
            <TableHead className="min-w-[76px]">ブランド</TableHead>
            <TableHead className="min-w-[120px]">Store View</TableHead>
            <TableHead className="min-w-[80px]">ステータス</TableHead>
            <TableHead className="min-w-[126px]">SEOスコア/課題</TableHead>
            <TableHead className="min-w-[110px]">更新日</TableHead>
            <TableHead className="min-w-[128px] text-right">アクション</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell colSpan={10}>
                  <Skeleton className="h-10 w-full" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && error && (
            <TableRow>
              <TableCell colSpan={10} className="py-12 text-center">
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
              <TableCell colSpan={10} className="py-12 text-center">
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
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-md border border-[#EEF0F4] object-contain" />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-md border border-[#EEF0F4] bg-[#F8FAFC] text-[#98A2B3]">
                      <ImageOff size={18} />
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-[#475467]">{item.sku}</TableCell>
                <TableCell className="max-w-[320px]">
                  <p className="line-clamp-2 text-sm font-medium text-[#111827]">{item.name}</p>
                  {item.shortDescription && <p className="truncate text-xs text-[#667085]">{item.shortDescription}</p>}
                </TableCell>
                <TableCell className="text-sm text-[#344054]">{item.brand}</TableCell>
                <TableCell className="text-sm text-[#344054]">{item.storeView}</TableCell>
                <TableCell>
                  <ProductStatusBadge status={item.status} />
                </TableCell>
                <TableCell>
                  <SeoScoreBadge score={item.seoScore} issueType={item.seoIssue} />
                </TableCell>
                <TableCell>
                  <p className="text-sm text-[#344054]">{formatDateTime(item.updatedAt)}</p>
                  <p className="text-xs text-[#98A2B3]">{item.updatedBy}</p>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 border-[#D0D5DD] px-2 text-[#475467]"
                      onClick={() => goToDetail(item.sku)}
                    >
                      <Pencil size={13} />
                      編集
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 border-[#D0D5DD] px-2 text-[#475467]"
                      onClick={() => setPreviewItem(item)}
                    >
                      <Eye size={13} />
                      プレビュー
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-8 text-[#667085]" aria-label="その他の操作">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
    </div>
  );
}

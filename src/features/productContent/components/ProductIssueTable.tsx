import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageOff, Pencil, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ProductIssueBadge from './ProductIssueBadge';
import ProductPagination from './ProductPagination';
import type { ProductIssueItem } from '../types/productIssue';

const COLUMN_COUNT = 6;

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
    <img src={src} alt={alt} onError={() => setFailed(true)} className="h-12 w-12 rounded-md border border-[#EEF0F4] object-contain" />
  );
}

interface ProductIssueTableProps {
  items: ProductIssueItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onClearFilters: () => void;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function ProductIssueTable({
  items,
  isLoading,
  error,
  onRetry,
  onClearFilters,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: ProductIssueTableProps) {
  const navigate = useNavigate();
  const goToDetail = (sku: string) => navigate(`/app/products/${sku}`);

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white">
      {!isLoading && !error && items.length > 0 && (
        <div className="flex items-center justify-end border-b border-[#EEF0F4] px-4 py-3">
          <ProductPagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
            className="shrink-0 flex-nowrap border-t-0 p-0"
          />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-14">画像</TableHead>
            <TableHead className="min-w-[84px]">SKU</TableHead>
            <TableHead className="min-w-[200px]">商品名</TableHead>
            <TableHead className="min-w-[110px]">ブランド</TableHead>
            <TableHead className="min-w-[260px]">検出された課題</TableHead>
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
                <p className="text-sm font-medium text-[#344054]">条件に一致する改善候補商品がありません</p>
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
              <TableRow key={item.sku} className="cursor-pointer" onClick={() => goToDetail(item.sku)}>
                <TableCell>
                  <ProductThumbnail src={item.imageUrl} alt={item.nameJa} />
                </TableCell>
                <TableCell className="text-xs text-[#475467]">{item.sku}</TableCell>
                <TableCell className="max-w-[260px]">
                  <p className="line-clamp-2 text-sm font-medium text-[#111827]">{item.nameJa}</p>
                  {(item.nameZhTw || item.nameEn) && (
                    <p className="truncate text-xs text-[#667085]">
                      {[item.nameZhTw, item.nameEn].filter(Boolean).join(' / ')}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-sm text-[#344054]">{item.brand}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-wrap gap-1">
                    {item.issues.map((issue) => (
                      <ProductIssueBadge key={issue} type={issue} />
                    ))}
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 border-[#D0D5DD] text-[#475467]"
                      aria-label="編集"
                      onClick={() => goToDetail(item.sku)}
                    >
                      <Pencil size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {!isLoading && !error && items.length > 0 && (
        <ProductPagination page={page} limit={limit} total={total} onPageChange={onPageChange} onLimitChange={onLimitChange} />
      )}
    </div>
  );
}

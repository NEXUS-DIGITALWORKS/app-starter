import { useNavigate } from 'react-router-dom';
import { Pencil, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CategoryBadge from './CategoryBadge';
import CategoryIssueBadge from './CategoryIssueBadge';
import CategoryPagination from './CategoryPagination';
import type { CategoryIssueItem } from '../types/categoryIssue';

const COLUMN_COUNT = 7;

interface CategoryIssueTableProps {
  items: CategoryIssueItem[];
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

export default function CategoryIssueTable({
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
}: CategoryIssueTableProps) {
  const navigate = useNavigate();
  const goToDetail = (code: string) => navigate(`/app/categories?code=${encodeURIComponent(code)}`);

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[96px]">コード</TableHead>
            <TableHead className="min-w-[200px]">カテゴリ名</TableHead>
            <TableHead className="min-w-[110px]">種別</TableHead>
            <TableHead className="min-w-[110px] text-right">所属商品数</TableHead>
            <TableHead className="min-w-[130px] text-right">直近1年売上</TableHead>
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
                <p className="text-sm font-medium text-[#344054]">条件に一致する改善候補カテゴリがありません</p>
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
              <TableRow key={item.id} className="cursor-pointer" onClick={() => goToDetail(item.code)}>
                <TableCell className="text-xs text-[#475467]">{item.code}</TableCell>
                <TableCell className="max-w-[260px]">
                  <p className="line-clamp-2 text-sm font-medium text-[#111827]">{item.nameJa || '(名称未設定)'}</p>
                  {(item.nameZhTw || item.nameEn) && (
                    <p className="truncate text-xs text-[#667085]">{[item.nameZhTw, item.nameEn].filter(Boolean).join(' / ')}</p>
                  )}
                  {item.parentNameJa && <p className="truncate text-xs text-[#98A2B3]">親: {item.parentNameJa}</p>}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <CategoryBadge categoryType={item.categoryType} />
                </TableCell>
                <TableCell className="text-right text-sm text-[#344054]">{item.productCount.toLocaleString()}</TableCell>
                <TableCell className="text-right text-sm text-[#344054]">¥{Math.round(item.salesTotal1y).toLocaleString()}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-wrap gap-1">
                    {item.issues.map((issue) => (
                      <CategoryIssueBadge key={issue} type={issue} />
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
                      onClick={() => goToDetail(item.code)}
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
        <CategoryPagination page={page} limit={limit} total={total} onPageChange={onPageChange} onLimitChange={onLimitChange} />
      )}
    </div>
  );
}

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pagination,
  PaginationButton,
  PaginationEllipsis,
  PaginationIconButton,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ELLIPSIS = 'ellipsis' as const;
const LIMIT_OPTIONS = [20, 50, 100, 200];

function buildPageList(current: number, totalPages: number): (number | typeof ELLIPSIS)[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages = new Set<number>([1, 2, totalPages - 1, totalPages, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result: (number | typeof ELLIPSIS)[] = [];
  sorted.forEach((page, idx) => {
    if (idx > 0 && page - sorted[idx - 1] > 1) result.push(ELLIPSIS);
    result.push(page);
  });
  return result;
}

interface ProductPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function ProductPagination({ page, limit, total, onPageChange, onLimitChange }: ProductPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(total, page * limit);
  const pages = buildPageList(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#EEF0F4] px-4 py-3 sm:flex-row">
      <div className="flex items-center gap-3">
        <p className="text-sm text-[#667085]">
          {total.toLocaleString()}件中 {start}〜{end}件を表示
        </p>
        <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
          <SelectTrigger className="h-8 w-[110px]" aria-label="表示件数">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIMIT_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}件表示
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Pagination>
        <PaginationIconButton aria-label="最初のページ" onClick={() => onPageChange(1)} disabled={page === 1}>
          <ChevronsLeft className="h-4 w-4" />
        </PaginationIconButton>
        <PaginationIconButton aria-label="前のページ" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          <ChevronLeft className="h-4 w-4" />
        </PaginationIconButton>

        {pages.map((p, idx) =>
          p === ELLIPSIS ? (
            <PaginationEllipsis key={`ellipsis-${idx}`} />
          ) : (
            <PaginationButton key={p} isActive={p === page} onClick={() => onPageChange(p)} aria-label={`${p}ページ目`}>
              {p}
            </PaginationButton>
          ),
        )}

        <PaginationIconButton aria-label="次のページ" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
          <ChevronRight className="h-4 w-4" />
        </PaginationIconButton>
        <PaginationIconButton aria-label="最後のページ" onClick={() => onPageChange(totalPages)} disabled={page === totalPages}>
          <ChevronsRight className="h-4 w-4" />
        </PaginationIconButton>
      </Pagination>
    </div>
  );
}

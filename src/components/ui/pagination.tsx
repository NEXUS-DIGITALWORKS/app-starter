import * as React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';

const Pagination = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <nav aria-label="ページネーション" className={cn('flex items-center gap-1', className)} {...props} />
);

const PaginationEllipsis = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span aria-hidden className={cn('flex h-8 w-8 items-center justify-center text-[#98A2B3]', className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
  </span>
);

interface PaginationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

const PaginationButton = React.forwardRef<HTMLButtonElement, PaginationButtonProps>(
  ({ className, isActive, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40',
        isActive
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F8FAFC]',
        className,
      )}
      {...props}
    />
  ),
);
PaginationButton.displayName = 'PaginationButton';

const PaginationIconButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] bg-white text-[#475467] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      {...props}
    />
  ),
);
PaginationIconButton.displayName = 'PaginationIconButton';

export { Pagination, PaginationButton, PaginationIconButton, PaginationEllipsis, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight };

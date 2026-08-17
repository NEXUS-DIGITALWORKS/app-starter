import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface ProductBreadcrumbProps {
  sku: string;
}

export default function ProductBreadcrumb({ sku }: ProductBreadcrumbProps) {
  return (
    <nav aria-label="パンくず" className="flex min-w-0 items-center gap-1.5 text-sm text-[#667085]">
      <Link to="/app" className="shrink-0 font-medium text-[#475467] hover:text-[#3157E5]">
        商品一覧
      </Link>
      <ChevronRight size={14} className="shrink-0" />
      <span className="shrink-0 font-medium text-[#475467]">{sku}</span>
      <ChevronRight size={14} className="shrink-0" />
      <span className="truncate font-semibold text-[#111827]">Description編集</span>
    </nav>
  );
}

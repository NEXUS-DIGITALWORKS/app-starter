import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Category } from '../types';

interface CategoryProductCountProps {
  category: Category;
  count: number;
}

// 「このカテゴリの商品を見る」導線。/app/products?category=<code> でカテゴリ絞り込み状態の
// 商品一覧へ遷移する（URLパラメータでフィルタ状態を保持、useProductFilters.ts側で解決）。
export default function CategoryProductCount({ category, count }: CategoryProductCountProps) {
  return (
    <Link
      to={`/app/products?category=${encodeURIComponent(category.code)}`}
      className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm transition-colors hover:bg-[#F8FAFC]"
    >
      <span className="text-[#344054]">
        所属商品数 <span className="font-semibold tabular-nums text-[#111827]">{count}</span> 件
      </span>
      <span className="flex items-center gap-1 font-medium text-[#3157E5]">
        商品を見る
        <ChevronRight size={14} />
      </span>
    </Link>
  );
}

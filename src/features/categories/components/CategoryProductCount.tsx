import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { CategoryCountMode } from '../hooks/useCategoryTree';
import type { Category } from '../types';

interface CategoryProductCountProps {
  category: Category;
  count: number;
  countMode: CategoryCountMode;
}

const COUNT_LABEL: Record<CategoryCountMode, string> = {
  linked: '所属商品数（紐づけ件数）',
  actual: '所属商品数（実件数・非公開を除く）',
};

// 「このカテゴリの商品を見る」導線。/app/products?category=<code> でカテゴリ絞り込み状態の
// 商品一覧へ遷移する（URLパラメータでフィルタ状態を保持、useProductFilters.ts側で解決）。
export default function CategoryProductCount({ category, count, countMode }: CategoryProductCountProps) {
  return (
    <Link
      to={`/app/products?category=${encodeURIComponent(category.code)}`}
      className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm transition-colors hover:bg-[#F8FAFC]"
    >
      <span className="text-[#344054]">
        {COUNT_LABEL[countMode]} <span className="font-semibold tabular-nums text-[#111827]">{count}</span> 件
      </span>
      <span className="flex items-center gap-1 font-medium text-[#3157E5]">
        商品を見る
        <ChevronRight size={14} />
      </span>
    </Link>
  );
}

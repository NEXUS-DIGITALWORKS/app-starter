import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FolderClock, Layers, ListChecks } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ProductSummaryCards from '../features/productContent/components/ProductSummaryCards';
import { fetchProductListSummary } from '../features/productContent/api/productListApi';
import { fetchProductIssues } from '../features/productContent/api/productIssuesApi';
import { fetchCategories } from '../features/categories/api/categoriesApi';
import { fetchSavedDiagnosisHistory, fetchSavedSelectionHistory } from '../features/app-history/lib/resultsRepo';
import type { ProductListSummary } from '../features/productContent/types/product';

type OtherCounts = {
  categories: number;
  productIssues: number;
  savedHistory: number;
};

type OtherCard = {
  key: keyof OtherCounts;
  label: string;
  icon: typeof Layers;
  href: string;
};

const OTHER_CARDS: OtherCard[] = [
  { key: 'categories', label: 'カテゴリ数', icon: Layers, href: '/app/categories' },
  { key: 'productIssues', label: '改善候補あり商品', icon: ListChecks, href: '/app/products/improvements' },
  { key: 'savedHistory', label: '保存済み診断・構成', icon: FolderClock, href: '/app/history' },
];

export default function AppHome() {
  const { session, profile } = useAuth();
  const name = profile?.display_name || session?.user.email || '';

  const [productSummary, setProductSummary] = useState<ProductListSummary | null>(null);
  const [otherCounts, setOtherCounts] = useState<OtherCounts | null>(null);

  useEffect(() => {
    let ignore = false;

    fetchProductListSummary().then((summary) => {
      if (!ignore) setProductSummary(summary);
    });

    Promise.all([
      fetchCategories(),
      fetchProductIssues(),
      fetchSavedDiagnosisHistory(50),
      fetchSavedSelectionHistory(50),
    ]).then(([categories, issues, diagnosisHistory, selectionHistory]) => {
      if (ignore) return;
      setOtherCounts({
        categories: categories.length,
        productIssues: issues.length,
        savedHistory: diagnosisHistory.length + selectionHistory.length,
      });
    });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="max-w-6xl">
      <h1 className="m-0 text-2xl font-bold text-[#0F172A]">{name ? `ようこそ、${name}さん` : 'ホーム'}</h1>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">商品情報整備AI（Beta）</h2>
            <p className="mt-1 text-sm text-[#667085]">SKU単位で商品情報を整理・翻訳・SEO整備します</p>
          </div>
          <Link
            to="/app/products"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[#3157E5] hover:text-[#2748C7]"
          >
            商品一覧を見る
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-4">
          <ProductSummaryCards summary={productSummary} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[#111827]">その他の集計</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {OTHER_CARDS.map(({ key, label, icon: Icon, href }) => (
            <Link
              key={key}
              to={href}
              className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 transition-colors hover:border-[#3157E5] hover:bg-[#F8FAFC]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF0FE] text-[#3157E5]">
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-[#667085]">{label}</span>
                <span className="block text-xl font-bold text-[#111827]">{otherCounts ? otherCounts[key] : '—'}</span>
              </span>
              <ArrowRight size={16} className="shrink-0 text-[#98A2B3]" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

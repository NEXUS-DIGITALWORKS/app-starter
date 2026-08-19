import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductIssueFilterBar from '../components/ProductIssueFilterBar';
import ProductIssueSummaryCards from '../components/ProductIssueSummaryCards';
import ProductIssueTable from '../components/ProductIssueTable';
import { useProductIssues } from '../hooks/useProductIssues';

export default function ProductImprovementsPage() {
  const {
    items,
    total,
    totalIssueProducts,
    issueCounts,
    isLoading,
    error,
    search,
    setSearch,
    issueTypes,
    toggleIssueType,
    clearFilters,
    page,
    limit,
    setPage,
    setLimit,
    refresh,
  } = useProductIssues();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <nav aria-label="パンくず" className="mb-1 flex items-center gap-1.5 text-sm text-[#667085]">
          <Link to="/app" className="flex items-center gap-1 font-medium text-[#475467] hover:text-[#3157E5]">
            <Home size={13} />
            Home
          </Link>
          <ChevronRight size={14} />
          <Link to="/app/products" className="font-medium text-[#475467] hover:text-[#3157E5]">
            商品一覧
          </Link>
          <ChevronRight size={14} />
          <span className="font-semibold text-[#111827]">改善候補</span>
        </nav>
        <h1 className="text-2xl font-bold text-[#111827]">改善候補商品</h1>
        <p className="mt-1 text-sm text-[#667085]">
          商品名・説明文の言語間の不整合や、文字数不足、売上実績などをルールベースで検査し、整備が必要そうな商品を抽出します。
        </p>
      </div>

      <ProductIssueSummaryCards totalIssueProducts={totalIssueProducts} issueCounts={issueCounts} isLoading={isLoading} />

      <ProductIssueFilterBar
        search={search}
        onSearchChange={setSearch}
        issueTypes={issueTypes}
        onToggleIssueType={toggleIssueType}
        onClear={clearFilters}
      />

      <ProductIssueTable
        items={items}
        isLoading={isLoading}
        error={error}
        onRetry={refresh}
        onClearFilters={clearFilters}
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  );
}

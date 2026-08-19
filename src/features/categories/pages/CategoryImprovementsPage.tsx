import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import CategoryIssueFilterBar from '../components/CategoryIssueFilterBar';
import CategoryIssueSummaryCards from '../components/CategoryIssueSummaryCards';
import CategoryIssueTable from '../components/CategoryIssueTable';
import { useCategoryIssues } from '../hooks/useCategoryIssues';
import { isSupabaseConfigured } from '../../../lib/supabaseClient';

export default function CategoryImprovementsPage() {
  const {
    items,
    total,
    totalIssueCategories,
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
  } = useCategoryIssues();

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center text-sm text-[#667085]">
        <p className="font-medium text-[#111827]">Supabaseが未設定です</p>
        <p>カテゴリ改善候補機能を利用するには .env に VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY を設定してください。</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <nav aria-label="パンくず" className="mb-1 flex items-center gap-1.5 text-sm text-[#667085]">
          <Link to="/app" className="flex items-center gap-1 font-medium text-[#475467] hover:text-[#3157E5]">
            <Home size={13} />
            Home
          </Link>
          <ChevronRight size={14} />
          <Link to="/app/categories" className="font-medium text-[#475467] hover:text-[#3157E5]">
            カテゴリ管理
          </Link>
          <ChevronRight size={14} />
          <span className="font-semibold text-[#111827]">改善候補</span>
        </nav>
        <h1 className="text-2xl font-bold text-[#111827]">改善候補カテゴリ</h1>
        <p className="mt-1 text-sm text-[#667085]">
          所属商品数の少なさや直近の売上実績、多言語名・説明文の未設定などをルールベースで検査し、整備が必要そうなカテゴリを抽出します。
        </p>
      </div>

      <CategoryIssueSummaryCards totalIssueCategories={totalIssueCategories} issueCounts={issueCounts} isLoading={isLoading} />

      <CategoryIssueFilterBar
        search={search}
        onSearchChange={setSearch}
        issueTypes={issueTypes}
        onToggleIssueType={toggleIssueType}
        onClear={clearFilters}
      />

      <CategoryIssueTable
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

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Download, Home, RefreshCw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductListToolbar from '../components/ProductListToolbar';
import ProductFilterSidebar from '../components/ProductFilterSidebar';
import ProductSummaryCards from '../components/ProductSummaryCards';
import ProductTable from '../components/ProductTable';
import ProductImportDialog from '../components/ProductImportDialog';
import { useProductFilters } from '../hooks/useProductFilters';

export default function ProductListPage() {
  const [importOpen, setImportOpen] = useState(false);

  const {
    searchInput,
    setSearchInput,
    skuInput,
    setSkuInput,
    ingredientInput,
    setIngredientInput,
    filters,
    setStoreView,
    setBrand,
    setCategory,
    setTag,
    setUpdatedWithin,
    toggleStatus,
    toggleSeoIssue,
    clearStatusFilter,
    clearSeoIssueFilter,
    setSingleStatus,
    setSingleSeoIssue,
    setPage,
    clearFilters,
    items,
    total,
    isLoading,
    error,
    summary,
    availableTags,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    addTags,
    removeTag,
    refresh,
  } = useProductFilters();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <nav aria-label="パンくず" className="mb-1 flex items-center gap-1.5 text-sm text-[#667085]">
            <Link to="/app" className="flex items-center gap-1 font-medium text-[#475467] hover:text-[#3157E5]">
              <Home size={13} />
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="font-semibold text-[#111827]">商品一覧</span>
          </nav>
          <h1 className="text-2xl font-bold text-[#111827]">商品一覧</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="border-[#D0D5DD] text-[#475467]" onClick={() => setImportOpen(true)}>
            <Upload size={14} />
            商品データ取込
          </Button>
          <Button variant="outline" size="sm" className="border-[#D0D5DD] text-[#475467]" onClick={() => console.info('[products] エクスポート')}>
            <Download size={14} />
            エクスポート
          </Button>
          <Button size="sm" onClick={() => console.info('[products] 新規同期')}>
            <RefreshCw size={14} />
            新規同期
          </Button>
        </div>
      </div>

      <ProductListToolbar
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        skuInput={skuInput}
        onSkuInputChange={setSkuInput}
        ingredientInput={ingredientInput}
        onIngredientInputChange={setIngredientInput}
        filters={filters}
        availableTags={availableTags}
        onStoreViewChange={setStoreView}
        onBrandChange={setBrand}
        onSingleStatusChange={setSingleStatus}
        onSingleSeoIssueChange={setSingleSeoIssue}
        onTagChange={setTag}
        onClear={clearFilters}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <ProductFilterSidebar
          filters={filters}
          onToggleStatus={toggleStatus}
          onToggleSeoIssue={toggleSeoIssue}
          onClearStatus={clearStatusFilter}
          onClearSeoIssue={clearSeoIssueFilter}
          onCategoryChange={setCategory}
          onUpdatedWithinChange={setUpdatedWithin}
          onClear={clearFilters}
        />

        <div className="min-w-0 flex-1 space-y-4">
          <ProductSummaryCards summary={summary} />

          <ProductTable
            items={items}
            isLoading={isLoading}
            error={error}
            onRetry={() => setPage(filters.page)}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onClearFilters={clearFilters}
            page={filters.page}
            limit={filters.limit}
            total={total}
            onPageChange={setPage}
            onAddTag={addTags}
            onRemoveTag={removeTag}
          />
        </div>
      </div>

      <ProductImportDialog open={importOpen} onOpenChange={setImportOpen} onImported={refresh} />
    </div>
  );
}

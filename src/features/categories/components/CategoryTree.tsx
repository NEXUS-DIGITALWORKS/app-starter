import { Plus } from 'lucide-react';
import { Tree } from '@/components/ui/tree';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CategoryTreeNode from './CategoryTreeNode';
import CategorySearchBar from './CategorySearchBar';
import CategoryFilters from './CategoryFilters';
import type { CategoryCountMode } from '../hooks/useCategoryTree';
import type { UseCategoryManagementReturn } from '../hooks/useCategoryManagement';

interface CategoryTreeProps {
  state: UseCategoryManagementReturn;
}

export default function CategoryTree({ state }: CategoryTreeProps) {
  const {
    tree,
    isLoading,
    searchInput,
    setSearchInput,
    filters,
    setCategoryType,
    setIsActive,
    visibleIds,
    expandedIds,
    toggleExpand,
    selectedId,
    select,
    openCreate,
    countMode,
    setCountMode,
  } = state;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#111827]">カテゴリ一覧</h2>
        <Button size="sm" onClick={() => openCreate(null)} className="h-8 gap-1 px-2.5 text-xs">
          <Plus size={14} />
          追加
        </Button>
      </div>

      <CategorySearchBar value={searchInput} onChange={setSearchInput} />
      <CategoryFilters
        categoryType={filters.categoryType}
        onCategoryTypeChange={setCategoryType}
        isActive={filters.isActive}
        onIsActiveChange={setIsActive}
      />

      <div className="flex items-center justify-between gap-2 text-xs text-[#667085]">
        <span>商品数の表示</span>
        <Select value={countMode} onValueChange={(v) => setCountMode(v as CategoryCountMode)}>
          <SelectTrigger className="h-8 w-[168px] text-xs" aria-label="商品数の表示">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linked">紐づけ件数</SelectItem>
            <SelectItem value="actual">実件数（非公開を除く）</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-[#EEF0F4]">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full" />
            ))}
          </div>
        ) : tree.length === 0 ? (
          <p className="p-4 text-sm text-[#98A2B3]">カテゴリがありません</p>
        ) : (
          <Tree className="p-1.5">
            {tree.map((node) => (
              <CategoryTreeNode
                key={node.id}
                node={node}
                depth={0}
                selectedId={selectedId}
                expandedIds={expandedIds}
                visibleIds={visibleIds}
                onSelect={select}
                onToggleExpand={toggleExpand}
              />
            ))}
          </Tree>
        )}
      </div>
    </div>
  );
}

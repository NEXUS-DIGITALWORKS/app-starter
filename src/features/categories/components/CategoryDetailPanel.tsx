import { ChevronRight } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import CategoryPathPreview from './CategoryPathPreview';
import CategoryProductCount from './CategoryProductCount';
import CategoryProductList from './CategoryProductList';
import { getAncestors, getChildren } from '../lib/categoryTree';
import { getCategoryDisplayName } from '../lib/categoryName';
import type { UseCategoryManagementReturn } from '../hooks/useCategoryManagement';

interface CategoryDetailPanelProps {
  state: UseCategoryManagementReturn;
}

export default function CategoryDetailPanel({ state }: CategoryDetailPanelProps) {
  const { categories, selectedCategory, productCountOf, select, openCreate } = state;

  if (!selectedCategory) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] text-sm text-[#98A2B3]">
        左のツリーからカテゴリを選択してください
      </div>
    );
  }

  const ancestors = getAncestors(categories, selectedCategory.id);
  const children = getChildren(categories, selectedCategory.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-1 text-xs text-[#98A2B3]">
        {ancestors.map((c, i) => (
          <span key={c.id} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} />}
            <button type="button" onClick={() => select(c.id)} className="hover:text-[#3157E5] hover:underline">
              {getCategoryDisplayName(c)}
            </button>
          </span>
        ))}
      </div>

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-[#667085]">{selectedCategory.code}</span>
              <CategoryBadge categoryType={selectedCategory.categoryType} />
              {!selectedCategory.isActive && (
                <span className="rounded-full bg-[#EEF0F4] px-2 py-0.5 text-xs font-medium text-[#667085]">無効</span>
              )}
            </div>
            <h1 className="mt-1 text-xl font-bold text-[#111827]">{getCategoryDisplayName(selectedCategory)}</h1>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
          <dt className="text-[#667085]">日本語名</dt>
          <dd className="text-[#344054]">{selectedCategory.nameJa || '—'}</dd>
          <dt className="text-[#667085]">英語名</dt>
          <dd className="text-[#344054]">{selectedCategory.nameEn || '—'}</dd>
          <dt className="text-[#667085]">繁体字名</dt>
          <dd className="text-[#344054]">{selectedCategory.nameZhTw || '—'}</dd>
          {selectedCategory.description && (
            <>
              <dt className="text-[#667085]">説明</dt>
              <dd className="text-[#344054]">{selectedCategory.description}</dd>
            </>
          )}
          <dt className="text-[#667085]">外部カテゴリID</dt>
          <dd className="text-[#344054]">{selectedCategory.externalCategoryId || '—'}</dd>
          <dt className="text-[#667085]">Magento カテゴリID（日本語/英語）</dt>
          <dd className="text-[#344054]">{selectedCategory.magentoCategoryId || '—'}</dd>
          <dt className="text-[#667085]">Magento カテゴリID（繁体字）</dt>
          <dd className="text-[#344054]">{selectedCategory.magentoCategoryIdZhTw || '—'}</dd>
        </dl>
      </div>

      <CategoryProductCount category={selectedCategory} count={productCountOf(selectedCategory.id)} />

      <CategoryPathPreview categories={categories} categoryId={selectedCategory.id} />

      <CategoryProductList category={selectedCategory} categories={categories} />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#111827]">子カテゴリ（{children.length}）</h2>
          <button type="button" onClick={() => openCreate(selectedCategory.id)} className="text-xs font-medium text-[#3157E5] hover:underline">
            + 配下に追加
          </button>
        </div>
        {children.length === 0 ? (
          <p className="text-sm text-[#98A2B3]">子カテゴリはありません</p>
        ) : (
          <ul className="divide-y divide-[#EEF0F4]">
            {children.map((child) => (
              <li key={child.id}>
                <button
                  type="button"
                  onClick={() => select(child.id)}
                  className="flex w-full items-center justify-between gap-3 py-2 text-left text-sm hover:text-[#3157E5]"
                >
                  <span>
                    <span className="mr-2 font-mono text-xs text-[#98A2B3]">{child.code}</span>
                    {getCategoryDisplayName(child)}
                  </span>
                  <span className="text-xs tabular-nums text-[#98A2B3]">{productCountOf(child.id)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

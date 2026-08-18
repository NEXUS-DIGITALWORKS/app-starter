import { Star, X } from 'lucide-react';
import CategorySelector from './CategorySelector';
import { formatCategoryCode, getCategoryDisplayName } from '../lib/categoryName';
import type { UseProductCategoryEditorReturn } from '../hooks/useProductCategoryEditor';

interface ProductCategoryEditorProps {
  state: UseProductCategoryEditorReturn;
  editable: boolean;
}

// 商品編集画面(ProductSummaryCard.tsx)へ組み込むカテゴリ設定UI。
// タグ(TagList)と同様、追加・削除は即時保存で行う（isDirtyのドラフト差分には含めない）。
export default function ProductCategoryEditor({ state, editable }: ProductCategoryEditorProps) {
  const { links, allCategories, addCategory, removeCategory, setPrimary } = state;

  const primary = links.find((l) => l.isPrimary);
  const others = links.filter((l) => !l.isPrimary);

  if (!editable) {
    return links.length === 0 ? (
      <span className="text-xs text-[#98A2B3]">未設定</span>
    ) : (
      <div className="flex flex-wrap items-center gap-1.5">
        {links.map((l) => (
          <span
            key={l.categoryId}
            className="inline-flex items-center gap-1 rounded-full bg-[#EEF0FE] py-0.5 px-2 text-xs font-medium text-[#3157E5]"
          >
            {l.isPrimary && <Star size={10} className="fill-current" />}
            {formatCategoryCode(l.category.code)} {getCategoryDisplayName(l.category)}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {primary && (
        <div>
          <p className="mb-1 text-xs font-semibold text-[#667085]">メインカテゴリ</p>
          <CategoryPill link={primary} onRemove={() => removeCategory(primary.categoryId)} isPrimary />
        </div>
      )}

      {others.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold text-[#667085]">その他カテゴリ</p>
          <div className="flex flex-wrap gap-1.5">
            {others.map((l) => (
              <CategoryPill
                key={l.categoryId}
                link={l}
                onRemove={() => removeCategory(l.categoryId)}
                onSetPrimary={() => setPrimary(l.categoryId)}
              />
            ))}
          </div>
        </div>
      )}

      <CategorySelector
        categories={allCategories}
        excludeIds={links.map((l) => l.categoryId)}
        onSelect={(c) => addCategory(c.id)}
        placeholder="カテゴリを追加（コード・名称で検索）"
      />
    </div>
  );
}

function CategoryPill({
  link,
  onRemove,
  onSetPrimary,
  isPrimary,
}: {
  link: { categoryId: string; category: { code: string; nameJa: string | null; nameEn: string | null; nameZhTw: string | null } };
  onRemove: () => void;
  onSetPrimary?: () => void;
  isPrimary?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF0FE] py-0.5 pl-2 pr-1 text-xs font-medium text-[#3157E5]">
      {isPrimary && <Star size={10} className="fill-current" />}
      {onSetPrimary && (
        <button type="button" onClick={onSetPrimary} aria-label="メインカテゴリに設定" className="rounded-full p-0.5 hover:bg-[#D6DEFB]">
          <Star size={10} />
        </button>
      )}
      {formatCategoryCode(link.category.code)} {getCategoryDisplayName(link.category)}
      <button type="button" onClick={onRemove} aria-label="カテゴリを解除" className="rounded-full p-0.5 hover:bg-[#D6DEFB]">
        <X size={11} />
      </button>
    </span>
  );
}

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import ProductCategoryEditor from '../../categories/components/ProductCategoryEditor';
import type { UseProductCategoryEditorReturn } from '../../categories/hooks/useProductCategoryEditor';
import type { Product } from '../types';

interface ProductSummaryCardProps {
  product: Product;
  editable: boolean;
  onChangeName: (field: 'name' | 'nameZhHant' | 'nameEn', value: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  categoryEditorState: UseProductCategoryEditorReturn;
}

const NAME_FIELDS: { key: 'name' | 'nameZhHant' | 'nameEn'; label: string }[] = [
  { key: 'name', label: '商品名' },
  { key: 'nameZhHant', label: '商品名（繁体字）' },
  { key: 'nameEn', label: '商品名（英語）' },
];

function TagList({ tags, onAddTag, onRemoveTag }: { tags: string[]; onAddTag: (tag: string) => void; onRemoveTag: (tag: string) => void }) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (!input.trim()) return;
    onAddTag(input);
    setInput('');
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-[#EEF0FE] py-0.5 pl-2 pr-1 text-xs font-medium text-[#3157E5]"
        >
          {tag}
          <button
            type="button"
            onClick={() => onRemoveTag(tag)}
            aria-label={`タグ「${tag}」を削除`}
            className="rounded-full p-0.5 hover:bg-[#D6DEFB]"
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <div className="flex items-center gap-1">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="タグを追加"
          className="h-7 w-28 rounded-md border border-[#D0D5DD] bg-white px-2 text-xs text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5]"
        />
        <button
          type="button"
          onClick={handleAdd}
          aria-label="タグを追加"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#D0D5DD] text-[#475467] hover:bg-[#F8FAFC]"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function ProductSummaryCard({
  product,
  editable,
  onChangeName,
  onAddTag,
  onRemoveTag,
  categoryEditorState,
}: ProductSummaryCardProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <img
          src={product.imagePath}
          alt={product.name}
          className="h-40 w-40 shrink-0 rounded-lg border border-[#EEF0F4] bg-[#F8FAFC] object-contain sm:h-48 sm:w-48"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
          }}
        />
        <div className="min-w-0 flex-1 space-y-4">
          {!editable && (
            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
              <dt className="text-[#667085]">SKU:</dt>
              <dd className="font-medium text-[#111827]">{product.sku}</dd>
              <dt className="text-[#667085]">商品名:</dt>
              <dd className="text-[#344054]">{product.name}</dd>
              <dt className="text-[#667085]">商品名（繁体字）:</dt>
              <dd className="text-[#344054]">{product.nameZhHant}</dd>
              <dt className="text-[#667085]">商品名（英語）:</dt>
              <dd className="text-[#344054]">{product.nameEn}</dd>
              <dt className="text-[#667085]">ブランド:</dt>
              <dd className="text-[#344054]">{product.brand}</dd>
              <dt className="text-[#667085]">販売価格:</dt>
              <dd className="font-medium text-[#344054]">{product.price}</dd>
              <dt className="text-[#667085]">タグ:</dt>
              <dd>
                <TagList tags={product.tags ?? []} onAddTag={onAddTag} onRemoveTag={onRemoveTag} />
              </dd>
              <dt className="text-[#667085]">カテゴリ:</dt>
              <dd>
                <ProductCategoryEditor state={categoryEditorState} editable={false} />
              </dd>
            </dl>
          )}

          {editable && (
            <>
              <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
                <dt className="text-[#667085]">SKU:</dt>
                <dd className="font-medium text-[#111827]">{product.sku}</dd>
                <dt className="text-[#667085]">ブランド:</dt>
                <dd className="text-[#344054]">{product.brand}</dd>
                <dt className="text-[#667085]">販売価格:</dt>
                <dd className="font-medium text-[#344054]">{product.price}</dd>
                <dt className="text-[#667085]">タグ:</dt>
                <dd>
                  <TagList tags={product.tags ?? []} onAddTag={onAddTag} onRemoveTag={onRemoveTag} />
                </dd>
                <dt className="text-[#667085]">カテゴリ:</dt>
                <dd>
                  <ProductCategoryEditor state={categoryEditorState} editable />
                </dd>
              </dl>

              <div className="space-y-3 border-t border-[#EEF0F4] pt-3">
                {NAME_FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <label className="mb-1 block text-xs font-semibold text-[#667085]" htmlFor={`product-${key}`}>
                      {label}
                    </label>
                    <input
                      id={`product-${key}`}
                      value={product[key]}
                      onChange={(e) => onChangeName(key, e.target.value)}
                      className="w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5]"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

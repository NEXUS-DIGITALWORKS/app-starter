import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import CategorySelector from './CategorySelector';
import { formatCategoryCode, getCategoryDisplayName, CATEGORY_TYPE_LABEL } from '../lib/categoryName';
import { getDescendantIds } from '../lib/categoryTree';
import { CATEGORY_TYPES } from '../types';
import type { Category, CategoryType, CreateCategoryInput, UpdateCategoryInput } from '../types';

interface CategoryFormProps {
  categories: Category[];
  initial?: Category; // 指定時は編集モード
  defaultParentId?: string | null; // 新規作成時、ツリーの特定ノードから「配下に追加」した場合
  isSaving: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onSubmit: (input: CreateCategoryInput | UpdateCategoryInput) => void;
}

export default function CategoryForm({
  categories,
  initial,
  defaultParentId = null,
  isSaving,
  errorMessage,
  onCancel,
  onSubmit,
}: CategoryFormProps) {
  const isEdit = Boolean(initial);

  const [code, setCode] = useState(initial?.code ?? '');
  const [parent, setParent] = useState<Category | null>(
    initial?.parentId ? categories.find((c) => c.id === initial.parentId) ?? null : categories.find((c) => c.id === defaultParentId) ?? null,
  );
  const [categoryType, setCategoryType] = useState<CategoryType>(initial?.categoryType ?? 'standard');
  const [nameJa, setNameJa] = useState(initial?.nameJa ?? '');
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? '');
  const [nameZhTw, setNameZhTw] = useState(initial?.nameZhTw ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [externalCategoryId, setExternalCategoryId] = useState(initial?.externalCategoryId ?? '');
  const [magentoCategoryId, setMagentoCategoryId] = useState(initial?.magentoCategoryId ?? '');
  const [magentoCategoryIdZhTw, setMagentoCategoryIdZhTw] = useState(initial?.magentoCategoryIdZhTw ?? '');
  const [codeChangeAcknowledged, setCodeChangeAcknowledged] = useState(!isEdit);

  useEffect(() => {
    setCodeChangeAcknowledged(!isEdit || code === initial?.code);
  }, [code, isEdit, initial?.code]);

  // 自分自身・自分の子孫は親カテゴリの選択候補から除外する（循環参照防止のUX側の補助）。
  const excludedParentIds = initial ? [initial.id, ...getDescendantIds(categories, initial.id)] : [];

  const codeChanged = isEdit && code !== initial?.code;

  const handleSubmit = () => {
    const input: CreateCategoryInput = {
      code,
      parentId: parent?.id ?? null,
      categoryType,
      nameJa,
      nameEn,
      nameZhTw,
      description,
      sortOrder,
      isActive,
      externalCategoryId,
      magentoCategoryId,
      magentoCategoryIdZhTw,
    };
    onSubmit(input);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-[#667085]" htmlFor="category-code">
          カテゴリコード
        </label>
        <input
          id="category-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5]"
        />
        {codeChanged && (
          <div className="mt-2 flex items-start gap-2 rounded-md border border-[#FFE9C7] bg-[#FFFBEB] p-2.5 text-xs text-[#B45309]">
            <Checkbox checked={codeChangeAcknowledged} onChange={(e) => setCodeChangeAcknowledged(e.target.checked)} className="mt-0.5" />
            <span>
              カテゴリコードは外部システム連携に使われる可能性があります。「{initial?.code}」から「{code}」へ変更してよろしいですか？（商品との関連はカテゴリIDで保持されるため、変更しても壊れません）
            </span>
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[#667085]">親カテゴリ</label>
        {parent ? (
          <div className="flex items-center justify-between rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm">
            <span>
              <span className="mr-2 font-mono text-xs text-[#98A2B3]">{formatCategoryCode(parent.code)}</span>
              {getCategoryDisplayName(parent)}
            </span>
            <button type="button" onClick={() => setParent(null)} className="text-xs text-[#3157E5] hover:underline">
              解除
            </button>
          </div>
        ) : (
          <CategorySelector
            categories={categories}
            excludeIds={excludedParentIds}
            onSelect={setParent}
            placeholder="親カテゴリを検索（未指定でルート）"
          />
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[#667085]" htmlFor="category-type">
          カテゴリ種別
        </label>
        <Select value={categoryType} onValueChange={(v) => setCategoryType(v as CategoryType)}>
          <SelectTrigger id="category-type" className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {CATEGORY_TYPE_LABEL[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {([
        ['category-name-ja', '日本語名', nameJa, setNameJa],
        ['category-name-en', '英語名', nameEn, setNameEn],
        ['category-name-zh-tw', '繁体字名', nameZhTw, setNameZhTw],
      ] as const).map(([id, label, value, setValue]) => (
        <div key={id}>
          <label className="mb-1 block text-xs font-semibold text-[#667085]" htmlFor={id}>
            {label}
          </label>
          <input
            id={id}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5]"
          />
        </div>
      ))}

      <div>
        <label className="mb-1 block text-xs font-semibold text-[#667085]" htmlFor="category-description">
          説明
        </label>
        <textarea
          id="category-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5]"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold text-[#667085]" htmlFor="category-sort-order">
            表示順
          </label>
          <input
            id="category-sort-order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5]"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold text-[#667085]" htmlFor="category-external-id">
            外部カテゴリID
          </label>
          <input
            id="category-external-id"
            value={externalCategoryId}
            onChange={(e) => setExternalCategoryId(e.target.value)}
            className="w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5]"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold text-[#667085]" htmlFor="category-magento-id">
            Magento カテゴリID（日本語/英語）
          </label>
          <input
            id="category-magento-id"
            value={magentoCategoryId}
            onChange={(e) => setMagentoCategoryId(e.target.value)}
            className="w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5]"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold text-[#667085]" htmlFor="category-magento-id-zh-tw">
            Magento カテゴリID（繁体字）
          </label>
          <input
            id="category-magento-id-zh-tw"
            value={magentoCategoryIdZhTw}
            onChange={(e) => setMagentoCategoryIdZhTw(e.target.value)}
            className="w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5]"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[#344054]">
        <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        有効
      </label>

      {errorMessage && <p className="rounded-md bg-[#FEF3F2] px-3 py-2 text-xs text-[#B42318]">{errorMessage}</p>}

      <div className="flex justify-end gap-2 border-t border-[#EEF0F4] pt-3">
        <Button variant="outline" size="sm" onClick={onCancel}>
          キャンセル
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={isSaving || !code.trim() || (codeChanged && !codeChangeAcknowledged)}>
          {isSaving ? '保存中...' : '保存'}
        </Button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Pencil, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CategoryForm from './CategoryForm';
import DeactivateCategoryDialog from './DeactivateCategoryDialog';
import { getCategoryDisplayName } from '../lib/categoryName';
import type { UseCategoryManagementReturn } from '../hooks/useCategoryManagement';

interface CategoryEditorProps {
  state: UseCategoryManagementReturn;
}

export default function CategoryEditor({ state }: CategoryEditorProps) {
  const {
    categories,
    selectedCategory,
    formMode,
    createParentId,
    closeForm,
    openEdit,
    submitCreate,
    submitUpdate,
    deactivate,
    reactivate,
    isSaving,
    formError,
    productCountOf,
  } = state;

  const [deactivateTarget, setDeactivateTarget] = useState<string | null>(null);
  const targetCategory = deactivateTarget ? categories.find((c) => c.id === deactivateTarget) ?? null : null;

  if (formMode === 'create') {
    return (
      <div>
        <h2 className="mb-4 text-sm font-semibold text-[#111827]">カテゴリを追加</h2>
        <CategoryForm
          categories={categories}
          defaultParentId={createParentId}
          isSaving={isSaving}
          errorMessage={formError}
          onCancel={closeForm}
          onSubmit={(input) => submitCreate(input as Parameters<typeof submitCreate>[0])}
        />
      </div>
    );
  }

  if (formMode === 'edit' && selectedCategory) {
    return (
      <div>
        <h2 className="mb-4 text-sm font-semibold text-[#111827]">カテゴリを編集</h2>
        <CategoryForm
          categories={categories}
          initial={selectedCategory}
          isSaving={isSaving}
          errorMessage={formError}
          onCancel={closeForm}
          onSubmit={(input) => submitUpdate(selectedCategory.id, input)}
        />
      </div>
    );
  }

  if (!selectedCategory) {
    return <p className="text-sm text-[#98A2B3]">カテゴリを選択すると編集操作を行えます</p>;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-[#111827]">
        <span className="mr-2 font-mono text-xs text-[#98A2B3]">{selectedCategory.code}</span>
        {getCategoryDisplayName(selectedCategory)}
      </h2>

      <Button size="sm" variant="outline" className="w-full justify-start gap-2" onClick={() => openEdit(selectedCategory.id)}>
        <Pencil size={14} />
        基本情報を編集
      </Button>

      {selectedCategory.isActive ? (
        <Button
          size="sm"
          variant="destructive"
          className="w-full justify-start gap-2"
          onClick={() => setDeactivateTarget(selectedCategory.id)}
        >
          無効化する
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => reactivate(selectedCategory.id)}
          disabled={isSaving}
        >
          <RotateCcw size={14} />
          再度有効化する
        </Button>
      )}

      <DeactivateCategoryDialog
        category={targetCategory}
        productCount={targetCategory ? productCountOf(targetCategory.id) : 0}
        isSaving={isSaving}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={async () => {
          if (!deactivateTarget) return;
          await deactivate(deactivateTarget);
          setDeactivateTarget(null);
        }}
      />
    </div>
  );
}

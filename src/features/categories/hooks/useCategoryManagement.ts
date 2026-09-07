import { useState } from 'react';
import { useCategoryTree } from './useCategoryTree';
import { createCategory, deactivateCategory, reactivateCategory, updateCategory } from '../api/categoriesApi';
import { findCategory } from '../lib/categoryTree';
import { isCodeDuplicate, wouldCreateCycle } from '../lib/categoryValidation';
import { CategoryCodeConflictError, type CreateCategoryInput, type UpdateCategoryInput } from '../types';

export type CategoryFormMode = 'view' | 'create' | 'edit';

export function useCategoryManagement() {
  const treeState = useCategoryTree();
  const { categories, productCounts, reload } = treeState;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<CategoryFormMode>('view');
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedCategory = selectedId ? findCategory(categories, selectedId) : undefined;

  const select = (id: string) => {
    setSelectedId(id);
    setFormMode('view');
    setFormError(null);
  };

  const openCreate = (parentId: string | null = null) => {
    setCreateParentId(parentId);
    setFormMode('create');
    setFormError(null);
  };

  const openEdit = (id: string) => {
    setSelectedId(id);
    setFormMode('edit');
    setFormError(null);
  };

  const closeForm = () => {
    setFormMode('view');
    setFormError(null);
  };

  const submitCreate = async (input: CreateCategoryInput) => {
    if (isCodeDuplicate(categories, input.code)) {
      setFormError(`カテゴリコード「${input.code}」は既に使用されています`);
      return false;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const created = await createCategory(input);
      reload();
      setSelectedId(created.id);
      setFormMode('view');
      return true;
    } catch (err) {
      setFormError(err instanceof CategoryCodeConflictError ? err.message : 'カテゴリの作成に失敗しました');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const submitUpdate = async (id: string, input: UpdateCategoryInput) => {
    if (input.code && isCodeDuplicate(categories, input.code, id)) {
      setFormError(`カテゴリコード「${input.code}」は既に使用されています`);
      return false;
    }
    if (input.parentId !== undefined && wouldCreateCycle(categories, id, input.parentId)) {
      setFormError('このカテゴリを配下の子孫カテゴリの下に移動することはできません');
      return false;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      await updateCategory(id, input);
      reload();
      setFormMode('view');
      return true;
    } catch (err) {
      setFormError(err instanceof CategoryCodeConflictError ? err.message : 'カテゴリの更新に失敗しました');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deactivate = async (id: string) => {
    setIsSaving(true);
    try {
      await deactivateCategory(id);
      reload();
    } finally {
      setIsSaving(false);
    }
  };

  const reactivate = async (id: string) => {
    setIsSaving(true);
    try {
      await reactivateCategory(id);
      reload();
    } finally {
      setIsSaving(false);
    }
  };

  const productCountOf = (id: string) => productCounts[id] ?? 0;

  return {
    ...treeState,
    selectedId,
    selectedCategory,
    select,
    formMode,
    createParentId,
    openCreate,
    openEdit,
    closeForm,
    submitCreate,
    submitUpdate,
    deactivate,
    reactivate,
    isSaving,
    formError,
    productCountOf,
  };
}

export type UseCategoryManagementReturn = ReturnType<typeof useCategoryManagement>;

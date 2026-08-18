import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import type { Category, CategoryType, CreateCategoryInput, UpdateCategoryInput } from '../types';
import { CategoryCodeConflictError } from '../types';

// categories テーブルの列は snake_case、フロントのドメイン型は camelCase。
// この変換はこのファイル内に閉じ込め、呼び出し側には camelCase の Category のみを渡す。

const CATEGORY_COLUMNS =
  'id, code, parent_id, level, category_type, name_ja, name_en, name_zh_tw, description, sort_order, is_active, external_category_id, magento_category_id, magento_category_id_zh_tw, created_at, updated_at';

type CategoryRow = {
  id: string;
  code: string;
  parent_id: string | null;
  level: number;
  category_type: CategoryType;
  name_ja: string | null;
  name_en: string | null;
  name_zh_tw: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  external_category_id: string | null;
  magento_category_id: string | null;
  magento_category_id_zh_tw: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: CategoryRow): Category {
  return {
    id: row.id,
    code: row.code,
    parentId: row.parent_id,
    level: row.level,
    categoryType: row.category_type,
    nameJa: row.name_ja,
    nameEn: row.name_en,
    nameZhTw: row.name_zh_tw,
    description: row.description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    externalCategoryId: row.external_category_id,
    magentoCategoryId: row.magento_category_id,
    magentoCategoryIdZhTw: row.magento_category_id_zh_tw,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const UNIQUE_VIOLATION = '23505';

export async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_COLUMNS)
    .order('sort_order', { ascending: true })
    .order('code', { ascending: true });

  if (error) return [];
  return (data as CategoryRow[]).map(mapRow);
}

// category_product_counts ビュー（supabase/migrations/setup_product_categories.sql）を使い、
// カテゴリごとの商品件数をN+1なしで一括取得する。
export async function fetchCategoryProductCounts(): Promise<Record<string, number>> {
  if (!isSupabaseConfigured()) return {};

  const { data, error } = await supabase.from('category_product_counts').select('category_id, product_count');
  if (error || !data) return {};

  const counts: Record<string, number> = {};
  for (const row of data as { category_id: string; product_count: number }[]) {
    counts[row.category_id] = row.product_count;
  }
  return counts;
}

export async function fetchCategoryById(id: string): Promise<Category | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase.from('categories').select(CATEGORY_COLUMNS).eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapRow(data as CategoryRow);
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      code: input.code.trim(),
      parent_id: input.parentId,
      category_type: input.categoryType,
      name_ja: input.nameJa?.trim() || null,
      name_en: input.nameEn?.trim() || null,
      name_zh_tw: input.nameZhTw?.trim() || null,
      description: input.description?.trim() || null,
      sort_order: input.sortOrder ?? 0,
      is_active: input.isActive ?? true,
      external_category_id: input.externalCategoryId?.trim() || null,
      magento_category_id: input.magentoCategoryId?.trim() || null,
      magento_category_id_zh_tw: input.magentoCategoryIdZhTw?.trim() || null,
    })
    .select(CATEGORY_COLUMNS)
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) throw new CategoryCodeConflictError(input.code);
    throw error;
  }
  return mapRow(data as CategoryRow);
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
  const patch: Record<string, unknown> = {};
  if (input.code !== undefined) patch.code = input.code.trim();
  if (input.parentId !== undefined) patch.parent_id = input.parentId;
  if (input.categoryType !== undefined) patch.category_type = input.categoryType;
  if (input.nameJa !== undefined) patch.name_ja = input.nameJa?.trim() || null;
  if (input.nameEn !== undefined) patch.name_en = input.nameEn?.trim() || null;
  if (input.nameZhTw !== undefined) patch.name_zh_tw = input.nameZhTw?.trim() || null;
  if (input.description !== undefined) patch.description = input.description?.trim() || null;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.isActive !== undefined) patch.is_active = input.isActive;
  if (input.externalCategoryId !== undefined) patch.external_category_id = input.externalCategoryId?.trim() || null;
  if (input.magentoCategoryId !== undefined) patch.magento_category_id = input.magentoCategoryId?.trim() || null;
  if (input.magentoCategoryIdZhTw !== undefined) patch.magento_category_id_zh_tw = input.magentoCategoryIdZhTw?.trim() || null;

  const { data, error } = await supabase.from('categories').update(patch).eq('id', id).select(CATEGORY_COLUMNS).single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) throw new CategoryCodeConflictError(String(patch.code ?? ''));
    throw error;
  }
  return mapRow(data as CategoryRow);
}

export async function deactivateCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').update({ is_active: false }).eq('id', id);
  if (error) throw error;
}

export async function reactivateCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').update({ is_active: true }).eq('id', id);
  if (error) throw error;
}

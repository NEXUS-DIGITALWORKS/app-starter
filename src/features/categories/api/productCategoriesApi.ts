import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import type { Category, CategorySource, CategoryType, ProductCategoryLink, ProductCategoryWithDetail } from '../types';

const LINK_COLUMNS = 'id, product_id, category_id, is_primary, sort_order, source, confidence, created_at, updated_at';

const LINK_WITH_CATEGORY_COLUMNS = `${LINK_COLUMNS}, category:categories(id, code, parent_id, level, category_type, name_ja, name_en, name_zh_tw, description, sort_order, is_active, external_category_id, magento_category_id, magento_category_id_zh_tw, created_at, updated_at)`;

type LinkRow = {
  id: string;
  product_id: string;
  category_id: string;
  is_primary: boolean;
  sort_order: number;
  source: CategorySource;
  confidence: number | null;
  created_at: string;
  updated_at: string;
};

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

type LinkWithCategoryRow = LinkRow & { category: CategoryRow };

function mapLink(row: LinkRow): ProductCategoryLink {
  return {
    id: row.id,
    productId: row.product_id,
    categoryId: row.category_id,
    isPrimary: row.is_primary,
    sortOrder: row.sort_order,
    source: row.source,
    confidence: row.confidence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCategory(row: CategoryRow): Category {
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

function mapLinkWithCategory(row: LinkWithCategoryRow): ProductCategoryWithDetail {
  return { ...mapLink(row), category: mapCategory(row.category) };
}

export async function fetchProductCategories(sku: string): Promise<ProductCategoryWithDetail[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('product_categories')
    .select(LINK_WITH_CATEGORY_COLUMNS)
    .eq('product_id', sku)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return (data as unknown as LinkWithCategoryRow[]).map(mapLinkWithCategory);
}

// 商品一覧など複数SKUの関連を1クエリでまとめて取得する（N+1回避）。
export async function fetchProductCategoryLinksMap(skus: string[]): Promise<Record<string, ProductCategoryWithDetail[]>> {
  if (!isSupabaseConfigured() || skus.length === 0) return {};

  const { data, error } = await supabase
    .from('product_categories')
    .select(LINK_WITH_CATEGORY_COLUMNS)
    .in('product_id', skus)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true });

  if (error || !data) return {};

  const map: Record<string, ProductCategoryWithDetail[]> = {};
  for (const row of data as unknown as LinkWithCategoryRow[]) {
    const link = mapLinkWithCategory(row);
    (map[link.productId] ??= []).push(link);
  }
  return map;
}

export async function addProductCategory(
  sku: string,
  categoryId: string,
  opts?: { isPrimary?: boolean; source?: CategorySource },
): Promise<void> {
  const { error } = await supabase.from('product_categories').insert({
    product_id: sku,
    category_id: categoryId,
    is_primary: opts?.isPrimary ?? false,
    source: opts?.source ?? 'manual',
  });
  if (error) throw error;
}

export async function removeProductCategory(sku: string, categoryId: string): Promise<void> {
  const { error } = await supabase.from('product_categories').delete().eq('product_id', sku).eq('category_id', categoryId);
  if (error) throw error;
}

// 1商品1メインカテゴリを保つため、他のリンクのis_primaryを先にfalseへ倒してから対象をtrueにする。
export async function setPrimaryCategory(sku: string, categoryId: string): Promise<void> {
  const { error: clearError } = await supabase
    .from('product_categories')
    .update({ is_primary: false })
    .eq('product_id', sku)
    .neq('category_id', categoryId);
  if (clearError) throw clearError;

  const { error: setError } = await supabase
    .from('product_categories')
    .update({ is_primary: true })
    .eq('product_id', sku)
    .eq('category_id', categoryId);
  if (setError) throw setError;
}

export async function bulkAddCategory(skus: string[], categoryId: string): Promise<void> {
  if (skus.length === 0) return;
  const { error } = await supabase
    .from('product_categories')
    .upsert(
      skus.map((sku) => ({ product_id: sku, category_id: categoryId, source: 'manual' as const })),
      { onConflict: 'product_id,category_id', ignoreDuplicates: true },
    );
  if (error) throw error;
}

export async function bulkRemoveCategory(skus: string[], categoryId: string): Promise<void> {
  if (skus.length === 0) return;
  const { error } = await supabase.from('product_categories').delete().in('product_id', skus).eq('category_id', categoryId);
  if (error) throw error;
}

export async function fetchProductIdsByCategory(categoryId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase.from('product_categories').select('product_id').eq('category_id', categoryId);
  if (error || !data) return [];
  return (data as { product_id: string }[]).map((row) => row.product_id);
}

// 商品一覧のカテゴリ複数選択フィルタ用。指定カテゴリのいずれかに属する商品ID（OR条件）を返す。
export async function fetchProductIdsByCategories(categoryIds: string[]): Promise<string[]> {
  if (!isSupabaseConfigured() || categoryIds.length === 0) return [];

  const { data, error } = await supabase.from('product_categories').select('product_id').in('category_id', categoryIds);
  if (error || !data) return [];
  return [...new Set((data as { product_id: string }[]).map((row) => row.product_id))];
}

import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import { fetchProductCategoryLinksMap, fetchProductIdsByCategories } from '../../categories/api/productCategoriesApi';
import { getProductImageUrl } from '../lib/productImage';
import type { ProductListFilters, ProductListItem, ProductListResult, ProductListSummary, ProductStatus, StoreView } from '../types/product';

interface ProductRow {
  sku: string;
  name_ja: string;
  brand: string | null;
  name_zh_tw: string | null;
  name_en: string | null;
  short_description: string | null;
  short_description_length: number | null;
  description_length: number | null;
  ingredients: string | null;
  ec_status: 'enabled' | 'disabled';
  workflow_status: 'draft' | 'editing' | 'review_requested' | 'approved' | 'applied';
  base_image: string | null;
  store_view_name: string | null;
  updated_at: string;
  sales_total_1y: number;
}

// UI側(ProductStatus)とDB側(workflow_status)は別々の設計背景を持つ列挙値
// （UI: published/draft/needs_review/approval_pending/private、DB: draft/editing/review_requested/approved/applied）
// のため厳密な1:1対応ではなく、ワークフローの進行段階が近いもの同士を対応付けた暫定マッピング。
const WORKFLOW_TO_STATUS: Record<ProductRow['workflow_status'], ProductStatus> = {
  draft: 'draft',
  editing: 'draft',
  review_requested: 'needs_review',
  approved: 'approval_pending',
  applied: 'published',
};

const STATUS_TO_WORKFLOW: Record<ProductStatus, ProductRow['workflow_status'][]> = {
  draft: ['draft', 'editing'],
  needs_review: ['review_requested'],
  approval_pending: ['approved'],
  published: ['applied'],
  private: [],
};

const STORE_VIEWS: StoreView[] = ['Japan Store View', 'Taiwan Store View', 'English Store View'];

function toStoreView(value: string | null): StoreView {
  return (STORE_VIEWS as string[]).includes(value ?? '') ? (value as StoreView) : 'Japan Store View';
}

// PostgRESTの.or()フィルタ構文はカンマ・括弧を条件区切りとして解釈するため、
// 検索語にそれらの文字が含まれる場合はダブルクオートで囲んで値全体をリテラル扱いにする。
function toOrFilterValue(pattern: string): string {
  if (!/[,()]/.test(pattern)) return pattern;
  return `"${pattern.replace(/"/g, '\\"')}"`;
}

function mapRow(row: ProductRow, tags: string[], categoryIds: string[], primaryCategoryId: string | null): ProductListItem {
  return {
    id: row.sku,
    sku: row.sku,
    imageUrl: row.base_image ? getProductImageUrl(row.base_image) : undefined,
    name: row.name_ja,
    nameZhTw: row.name_zh_tw ?? undefined,
    nameEn: row.name_en ?? undefined,
    shortDescription: row.short_description ?? undefined,
    shortDescriptionLength: row.short_description_length ?? undefined,
    descriptionLength: row.description_length ?? undefined,
    ingredients: row.ingredients ?? undefined,
    brand: row.brand ?? '',
    storeView: toStoreView(row.store_view_name),
    category: 'スキンケア', // レガシー項目（types/product.ts参照）。実データでは未使用のため固定値。
    status: WORKFLOW_TO_STATUS[row.workflow_status] ?? 'draft',
    seoScore: null, // SEO診断はAI生成の別テーブル想定でまだ未実装（setup_products.sqlのコメント参照）
    seoIssue: 'unrated',
    updatedAt: row.updated_at,
    updatedBy: '',
    tags,
    categoryIds,
    primaryCategoryId,
    salesTotal1y: row.sales_total_1y ?? 0,
  };
}

async function fetchProductTagsMap(skus: string[]): Promise<Record<string, string[]>> {
  if (skus.length === 0) return {};
  const { data, error } = await supabase.from('product_tags').select('product_id, tag').in('product_id', skus);
  if (error || !data) return {};
  const map: Record<string, string[]> = {};
  for (const row of data as { product_id: string; tag: string }[]) {
    (map[row.product_id] ??= []).push(row.tag);
  }
  return map;
}

export async function fetchProducts(filters: ProductListFilters): Promise<ProductListResult> {
  if (!isSupabaseConfigured()) return { items: [], total: 0 };

  if (filters.status.length > 0) {
    const workflowValues = filters.status.flatMap((s) => STATUS_TO_WORKFLOW[s]);
    if (workflowValues.length === 0) return { items: [], total: 0 };
  }

  let categorySkuFilter: string[] | null = null;
  if (filters.categoryIds.length > 0) {
    categorySkuFilter = await fetchProductIdsByCategories(filters.categoryIds);
    if (categorySkuFilter.length === 0) return { items: [], total: 0 };
  }

  let tagSkuFilter: string[] | null = null;
  if (filters.tag !== 'all') {
    const { data } = await supabase.from('product_tags').select('product_id').eq('tag', filters.tag);
    tagSkuFilter = (data as { product_id: string }[] | null)?.map((r) => r.product_id) ?? [];
    if (tagSkuFilter.length === 0) return { items: [], total: 0 };
  }

  // sales_total_1y（直近1年の累積売上）順ソートのため、products単体ではなく
  // 集計済みビュー（product_list_with_sales）から取得する。他の絞り込み条件は
  // productsと同じカラムを持つためそのまま適用できる。
  let query = supabase.from('product_list_with_sales').select('*', { count: 'exact' });

  const search = filters.search.trim();
  if (search) {
    const pattern = toOrFilterValue(`%${search}%`);
    query = query.or(`name_ja.ilike.${pattern},short_description.ilike.${pattern},sku.ilike.${pattern}`);
  }
  const ingredient = filters.ingredient.trim();
  if (ingredient) query = query.ilike('ingredients', `%${ingredient}%`);
  if (filters.skuList.length > 0) query = query.in('sku', filters.skuList);
  if (filters.shortDescriptionLengthMin != null) query = query.gte('short_description_length', filters.shortDescriptionLengthMin);
  if (filters.shortDescriptionLengthMax != null) query = query.lte('short_description_length', filters.shortDescriptionLengthMax);
  if (filters.descriptionLengthMin != null) query = query.gte('description_length', filters.descriptionLengthMin);
  if (filters.descriptionLengthMax != null) query = query.lte('description_length', filters.descriptionLengthMax);
  if (filters.status.length > 0) {
    query = query.in('workflow_status', filters.status.flatMap((s) => STATUS_TO_WORKFLOW[s]));
  }
  if (categorySkuFilter) query = query.in('sku', categorySkuFilter);
  if (tagSkuFilter) query = query.in('sku', tagSkuFilter);
  if (filters.updatedWithin !== 'all') {
    const days = filters.updatedWithin === 'today' ? 1 : filters.updatedWithin === '7d' ? 7 : 30;
    query = query.gte('updated_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
  }

  const start = (filters.page - 1) * filters.limit;
  query = query.order(filters.sortBy, { ascending: false }).range(start, start + filters.limit - 1);

  const { data, error, count } = await query;
  if (error || !data) return { items: [], total: 0 };

  const rows = data as ProductRow[];
  const skus = rows.map((r) => r.sku);
  const [tagsMap, categoryLinksMap] = await Promise.all([fetchProductTagsMap(skus), fetchProductCategoryLinksMap(skus)]);

  const items = rows.map((row) => {
    const links = categoryLinksMap[row.sku] ?? [];
    return mapRow(
      row,
      tagsMap[row.sku] ?? [],
      links.map((l) => l.categoryId),
      links.find((l) => l.isPrimary)?.categoryId ?? null,
    );
  });

  return { items, total: count ?? items.length };
}

export async function addTagToProducts(ids: string[], tag: string): Promise<void> {
  const trimmed = tag.trim();
  if (!trimmed || ids.length === 0) return;
  const { error } = await supabase
    .from('product_tags')
    .upsert(
      ids.map((sku) => ({ product_id: sku, tag: trimmed, source: 'manual' as const })),
      { onConflict: 'product_id,tag', ignoreDuplicates: true },
    );
  if (error) throw error;
}

export async function removeTagFromProduct(id: string, tag: string): Promise<void> {
  const { error } = await supabase.from('product_tags').delete().eq('product_id', id).eq('tag', tag);
  if (error) throw error;
}

export async function fetchAvailableTags(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from('product_tags').select('tag');
  if (error || !data) return [];
  const tagSet = new Set((data as { tag: string }[]).map((r) => r.tag));
  return [...tagSet].sort((a, b) => a.localeCompare(b, 'ja'));
}

// カテゴリ単位のCSV出力（src/features/categories）向け。指定SKU群の商品情報をまとめて取得する。
export async function fetchProductsBySkus(skus: string[]): Promise<ProductListItem[]> {
  if (!isSupabaseConfigured() || skus.length === 0) return [];
  const { data, error } = await supabase.from('product_list_with_sales').select('*').in('sku', skus);
  if (error || !data) return [];

  const rows = data as ProductRow[];
  const [tagsMap, categoryLinksMap] = await Promise.all([fetchProductTagsMap(skus), fetchProductCategoryLinksMap(skus)]);

  return rows.map((row) => {
    const links = categoryLinksMap[row.sku] ?? [];
    return mapRow(
      row,
      tagsMap[row.sku] ?? [],
      links.map((l) => l.categoryId),
      links.find((l) => l.isPrimary)?.categoryId ?? null,
    );
  });
}

export async function fetchProductListSummary(): Promise<ProductListSummary> {
  if (!isSupabaseConfigured()) {
    return { total: 0, needsReview: 0, seoIssues: 0, published: 0, untranslated: 0, approvalPending: 0 };
  }

  const base = () => supabase.from('products').select('*', { count: 'exact', head: true });

  const [totalRes, needsReviewRes, publishedRes, approvalPendingRes, untranslatedRes] = await Promise.all([
    base(),
    base().eq('workflow_status', 'review_requested'),
    base().eq('workflow_status', 'applied'),
    base().eq('workflow_status', 'approved'),
    base().or('name_zh_tw.is.null,name_en.is.null'),
  ]);

  return {
    total: totalRes.count ?? 0,
    needsReview: needsReviewRes.count ?? 0,
    seoIssues: 0, // SEO診断は未実装のため常に0（実装後にSEO結果テーブルの集計に置き換える）
    published: publishedRes.count ?? 0,
    untranslated: untranslatedRes.count ?? 0,
    approvalPending: approvalPendingRes.count ?? 0,
  };
}

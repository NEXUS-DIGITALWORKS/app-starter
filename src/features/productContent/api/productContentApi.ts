import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import { getProductImageUrl } from '../lib/productImage';
import type {
  EcVisibility,
  ExtractedFeature,
  LocaleSeo,
  ProductContentText,
  ProductWorkspace,
} from '../types';

// Component から直接fetchしない。呼び出し側のシグネチャはmock時代から変えていない。

interface ProductRow {
  sku: string;
  brand: string | null;
  name_ja: string;
  name_zh_tw: string | null;
  name_en: string | null;
  price: number | null;
  ec_status: 'enabled' | 'disabled';
  ec_visibility: EcVisibility | null;
  workflow_status: 'draft' | 'editing' | 'review_requested' | 'approved' | 'applied';
  short_description: string | null;
  description_ja: string | null;
  ingredients: string | null;
  usage_notes: string | null;
  short_description_zh_tw: string | null;
  short_description_en: string | null;
  description_zh_tw: string | null;
  description_en: string | null;
  ingredients_zh_tw: string | null;
  ingredients_en: string | null;
  usage_notes_zh_tw: string | null;
  usage_notes_en: string | null;
  magento_entity_id: string | null;
  store_id: string | null;
  store_view_code: string | null;
  store_view_name: string | null;
  locale: string | null;
  meta_title_ja: string | null;
  meta_description_ja: string | null;
  url_key: string | null;
  meta_title_zh_tw: string | null;
  meta_title_en: string | null;
  meta_description_zh_tw: string | null;
  meta_description_en: string | null;
  base_image: string | null;
  small_image: string | null;
  thumbnail: string | null;
  magento_created_at: string | null;
  magento_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

const EC_STATUS_LABEL: Record<ProductRow['ec_status'], string> = {
  enabled: '公開中',
  disabled: '非公開',
};

const emptyContentText = (): ProductContentText => ({
  shortDescription: '',
  description: '',
  ingredients: '',
  usageNotes: '',
});

async function fetchTags(sku: string): Promise<string[]> {
  const { data, error } = await supabase.from('product_tags').select('tag').eq('product_id', sku);
  if (error || !data) return [];
  return (data as { tag: string }[]).map((r) => r.tag);
}

// products/product_tags（Magento由来の原本データ＋人が確定した繁体字/英語版）を実データ化する。
// AI翻訳の下書き（人が確定する前の提案）・抽出特徴量・SEO診断issuesは生成結果を保存する
// テーブルが未実装のため、ここでは常に空のプレースホルダを返す。
function toWorkspace(row: ProductRow, tags: string[]): ProductWorkspace {
  const original: ProductContentText = {
    shortDescription: row.short_description ?? '',
    description: row.description_ja ?? '',
    ingredients: row.ingredients ?? '',
    usageNotes: row.usage_notes ?? '',
  };
  const zhHantEdited: ProductContentText = {
    shortDescription: row.short_description_zh_tw ?? '',
    description: row.description_zh_tw ?? '',
    ingredients: row.ingredients_zh_tw ?? '',
    usageNotes: row.usage_notes_zh_tw ?? '',
  };
  const enEdited: ProductContentText = {
    shortDescription: row.short_description_en ?? '',
    description: row.description_en ?? '',
    ingredients: row.ingredients_en ?? '',
    usageNotes: row.usage_notes_en ?? '',
  };

  const imagePaths = [
    { key: 'base_image' as const, label: 'Base Image', path: row.base_image },
    { key: 'small_image' as const, label: 'Small Image', path: row.small_image },
    { key: 'thumbnail' as const, label: 'Thumbnail', path: row.thumbnail },
  ].filter((img): img is { key: 'base_image' | 'small_image' | 'thumbnail'; label: string; path: string } => Boolean(img.path));

  return {
    product: {
      id: row.sku,
      sku: row.sku,
      brand: row.brand ?? '',
      name: row.name_ja,
      nameZhHant: row.name_zh_tw ?? '',
      nameEn: row.name_en ?? '',
      price: row.price != null ? `¥${row.price.toLocaleString('ja-JP')}` : '',
      ecStatus: row.ec_status,
      ecStatusLabel: EC_STATUS_LABEL[row.ec_status],
      ecVisibility: row.ec_visibility ?? 'Catalog & Search',
      workflowStatus: row.workflow_status,
      imagePath: row.base_image ? getProductImageUrl(row.base_image) : '',
      tags,
      createdAt: row.magento_created_at ?? row.created_at,
      updatedAt: row.updated_at,
    },
    storeView: {
      id: row.sku,
      productId: row.sku,
      storeId: row.store_id ?? '',
      storeViewCode: row.store_view_code ?? '',
      storeViewName: row.store_view_name ?? '',
      locale: row.locale ?? '',
    },
    content: {
      storeViewId: row.sku,
      original,
      zhHant: { aiTranslation: emptyContentText(), edited: zhHantEdited },
      en: { aiTranslation: emptyContentText(), edited: enEdited },
    },
    attributes: [],
    extractedFeatures: [],
    missingFields: [],
    seo: {
      original: {
        issues: [],
        suggestion: {
          metaTitle: row.meta_title_ja ?? '',
          metaDescription: row.meta_description_ja ?? '',
          urlKey: row.url_key ?? '',
        },
      },
      zhHant: {
        issues: [],
        suggestion: { metaTitle: row.meta_title_zh_tw ?? '', metaDescription: row.meta_description_zh_tw ?? '', urlKey: '' },
      },
      en: {
        issues: [],
        suggestion: { metaTitle: row.meta_title_en ?? '', metaDescription: row.meta_description_en ?? '', urlKey: '' },
      },
    },
    metadata: {
      entityId: row.magento_entity_id ?? '',
      sku: row.sku,
      metaTitle: row.meta_title_ja ?? '',
      metaDescription: row.meta_description_ja,
      urlKey: row.url_key ?? '',
      baseImage: row.base_image ?? '',
      smallImage: row.small_image ?? '',
      thumbnail: row.thumbnail ?? '',
    },
    images: imagePaths.map((img) => ({ key: img.key, label: img.label, path: getProductImageUrl(img.path), alt: null })),
    stats: {
      imageCount: new Set(imagePaths.map((img) => img.path)).size,
    },
  };
}

export async function fetchProductWorkspace(sku: string): Promise<ProductWorkspace | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from('products').select('*').eq('sku', sku).maybeSingle();
  if (error || !data) return null;
  const tags = await fetchTags(sku);
  return toWorkspace(data as ProductRow, tags);
}

export interface SaveProductContentInput {
  sku: string;
  storeViewId: string;
  original: ProductContentText;
  zhHant: ProductContentText;
  en: ProductContentText;
  productName: { name: string; nameZhHant: string; nameEn: string };
  extractedFeatures: ExtractedFeature[];
  seo: { original: LocaleSeo; zhHant: LocaleSeo; en: LocaleSeo };
}

export async function saveProductContent(input: SaveProductContentInput): Promise<{ savedAt: string }> {
  // 抽出特徴量・SEO診断issuesはAI生成結果を保存するテーブルが未実装のため保存対象外。
  // それ以外（原文・商品名・繁体字/英語の確定済み本文・メタタイトル/ディスクリプション）はproductsに書き戻す。
  const { error } = await supabase
    .from('products')
    .update({
      name_ja: input.productName.name,
      name_zh_tw: input.productName.nameZhHant,
      name_en: input.productName.nameEn,
      short_description: input.original.shortDescription,
      description_ja: input.original.description,
      ingredients: input.original.ingredients,
      usage_notes: input.original.usageNotes,
      short_description_zh_tw: input.zhHant.shortDescription,
      description_zh_tw: input.zhHant.description,
      ingredients_zh_tw: input.zhHant.ingredients,
      usage_notes_zh_tw: input.zhHant.usageNotes,
      short_description_en: input.en.shortDescription,
      description_en: input.en.description,
      ingredients_en: input.en.ingredients,
      usage_notes_en: input.en.usageNotes,
      meta_title_zh_tw: input.seo.zhHant.suggestion.metaTitle,
      meta_description_zh_tw: input.seo.zhHant.suggestion.metaDescription,
      meta_title_en: input.seo.en.suggestion.metaTitle,
      meta_description_en: input.seo.en.suggestion.metaDescription,
    })
    .eq('sku', input.sku);
  if (error) throw error;
  return { savedAt: new Date().toISOString() };
}

export async function addTagToProduct(sku: string, tag: string): Promise<void> {
  const trimmed = tag.trim();
  if (!trimmed) return;
  const { error } = await supabase
    .from('product_tags')
    .upsert({ product_id: sku, tag: trimmed, source: 'manual' as const }, { onConflict: 'product_id,tag', ignoreDuplicates: true });
  if (error) throw error;
}

export async function removeTagFromProduct(sku: string, tag: string): Promise<void> {
  const { error } = await supabase.from('product_tags').delete().eq('product_id', sku).eq('tag', tag);
  if (error) throw error;
}

export interface RequestApprovalInput {
  sku: string;
  requestedBy: string;
  comment?: string;
}

export async function requestApproval(input: RequestApprovalInput): Promise<{ requestId: string; requestedAt: string }> {
  // TODO: 承認ワークフロー用テーブルは未実装のためモックのまま
  console.info('[productContentApi] requestApproval (mock)', input);
  return new Promise((resolve) => setTimeout(() => resolve({ requestId: `appr_${Date.now()}`, requestedAt: new Date().toISOString() }), 250));
}

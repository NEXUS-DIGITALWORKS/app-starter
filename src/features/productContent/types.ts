// Product Content Studio: 商品情報整備AI のドメイン型定義
// 設計方針: Source（原文）/ AI Suggestion（AI提案）/ Human Edited（人間編集）/ Approved（承認済）を
// 常に別データとして保持し、AI生成結果で元データを上書きしない。

export type EcStatus = 'enabled' | 'disabled';
export type EcVisibility = 'Catalog & Search' | 'Catalog' | 'Search' | 'Not Visible Individually';

// EC側のStatus/Visibilityとは別に管理する内部ワークフロー状態
export type WorkflowStatus = 'draft' | 'editing' | 'review_requested' | 'approved' | 'applied';

export interface Product {
  id: string;
  sku: string;
  brand: string;
  name: string; // 商品名（日本語・マスターデータ）
  nameZhHant: string; // 商品名（繁体字）
  nameEn: string; // 商品名（英語）
  price: string;
  ecStatus: EcStatus;
  ecStatusLabel: string;
  ecVisibility: EcVisibility;
  workflowStatus: WorkflowStatus;
  imagePath: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductStoreView {
  id: string;
  productId: string;
  storeId: string;
  storeViewCode: string;
  storeViewName: string;
  locale: string;
}

export interface ProductContentText {
  shortDescription: string;
  description: string;
  ingredients: string;
  usageNotes: string;
}

export type ContentVersionType = 'source' | 'translation' | 'ai_suggestion' | 'edited' | 'approved';

// 翻訳先言語。原文（日本語）から、この2言語へAI翻訳→人による編集を行う。
export type TargetLocale = 'zhHant' | 'en';

// ターゲット言語ごとのコンテンツ（AI翻訳結果 / 人による編集後）
export interface LocaleContent {
  aiTranslation: ProductContentText;
  edited: ProductContentText;
}

// storeView単位の本文コンテンツ。原文（日本語・マスターデータ）を起点に、
// 繁体字・英語それぞれへAI翻訳→人による編集を行う。
export interface ProductContent {
  storeViewId: string;
  original: ProductContentText;
  zhHant: LocaleContent;
  en: LocaleContent;
}

export type AttributeStatus = 'missing' | 'partial' | 'available' | 'unknown';

export interface ProductAttribute {
  key: string;
  label: string;
  value: string | string[] | null;
  unit?: string;
  status: AttributeStatus;
  confidence?: number;
}

export type SourceType =
  | 'magento'
  | 'csv'
  | 'manufacturer_site'
  | 'product_site'
  | 'external_ec'
  | 'product_api'
  | 'manual'
  | 'ai_generated';

export interface ProductSource {
  id: string;
  productId: string;
  sourceType: SourceType;
  sourceName: string;
  sourceUrl?: string;
  retrievedAt: string;
}

export interface ProductFieldSource {
  fieldKey: string;
  value: string;
  sourceId: string;
  confidence?: number;
}

export type SeoSeverity = 'critical' | 'warning' | 'info';

export interface SeoIssue {
  id: string;
  field: string;
  severity: SeoSeverity;
  message: string;
}

export interface SeoSuggestion {
  metaTitle: string;
  metaDescription: string;
  urlKey: string;
}

// SEO診断・改善案は商品概要と同様、原文（日本語）・繁体字・英語それぞれの
// store view ごとにmeta_title/meta_description/url_keyが異なるため言語別に保持する。
export interface LocaleSeo {
  issues: SeoIssue[];
  suggestion: SeoSuggestion;
}

export interface MissingField {
  key: string;
  label: string;
  status: AttributeStatus;
}

export interface ExtractedFeature {
  key: string;
  label: string;
  value: string;
}

export type AiTaskType =
  | 'translate'
  | 'improve_description'
  | 'extract_features'
  | 'seo_analysis'
  | 'seo_generation'
  | 'image_alt_generation';

export interface AiRun {
  id: string;
  productId: string;
  taskType: AiTaskType;
  provider: string;
  model: string;
  status: 'pending' | 'success' | 'error';
  createdAt: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface ApprovalRequest {
  id: string;
  productId: string;
  requestedBy: string;
  requestedAt: string;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  comment?: string;
}

// 元データ（Magento取得値そのもの、編集用データとは分離して保持）
export interface ProductMagentoMetadata {
  entityId: string;
  sku: string;
  metaTitle: string;
  metaDescription: string | null;
  urlKey: string;
  baseImage: string;
  smallImage: string;
  thumbnail: string;
}

export interface ProductImageAsset {
  key: 'base_image' | 'small_image' | 'thumbnail';
  label: string;
  path: string;
  alt: string | null;
  aiAltSuggestion?: string;
}

export interface ProductStats {
  imageCount: number;
}

// 画面で扱う「1商品・1StoreView分」のまとまり
export interface ProductWorkspace {
  product: Product;
  storeView: ProductStoreView;
  content: ProductContent;
  attributes: ProductAttribute[];
  extractedFeatures: ExtractedFeature[];
  missingFields: MissingField[];
  seo: {
    original: LocaleSeo;
    zhHant: LocaleSeo;
    en: LocaleSeo;
  };
  metadata: ProductMagentoMetadata;
  images: ProductImageAsset[];
  stats: ProductStats;
}

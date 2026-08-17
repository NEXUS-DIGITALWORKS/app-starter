import type { ExtractedFeature, ProductContentText, SeoIssue, SeoSuggestion } from '../types';

// AI機能のStub層。UI ComponentからAI Providerを直接呼び出さない構造にするため、
// 実際の生成処理（Backend経由でのOpenAI/Claude呼び出し）に差し替わるまでの仮実装。
// AIは商品情報にない内容を創作しない前提（不明点はここでは原文をそのまま返す＝架空の情報を足さない）。

const MOCK_DELAY_MS = 500;

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function translateProduct(original: ProductContentText): Promise<ProductContentText> {
  // TODO: Backend `POST /api/products/:sku/translate` に置き換える
  return delay({ ...original });
}

export async function improveProductDescription(current: ProductContentText): Promise<ProductContentText> {
  // TODO: Backend `POST /api/products/:sku/improve` に置き換える
  return delay({ ...current });
}

export async function extractProductFeatures(content: ProductContentText): Promise<ExtractedFeature[]> {
  // TODO: Backend `POST /api/products/:sku/extract-features` に置き換える
  void content;
  return delay([]);
}

export async function analyzeProductSeo(content: ProductContentText): Promise<SeoIssue[]> {
  // TODO: Backend `POST /api/products/:sku/seo/analyze` に置き換える
  void content;
  return delay([]);
}

export async function generateProductSeo(content: ProductContentText): Promise<SeoSuggestion> {
  // TODO: Backend `POST /api/products/:sku/seo/generate` に置き換える
  return delay({ metaTitle: '', metaDescription: '', urlKey: '' }).then((empty) => ({
    ...empty,
    metaTitle: content.shortDescription.slice(0, 40),
  }));
}

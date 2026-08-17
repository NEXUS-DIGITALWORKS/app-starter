import { mockProductWorkspace, MOCK_SKU } from '../data/mockProduct';
import type { ProductContentText, ProductWorkspace } from '../types';

// Component から直接fetchしない。実データ接続時はこのファイルの中身だけを
// Supabase/Backend API呼び出しに差し替える（呼び出し側のシグネチャは変えない）。

const MOCK_DELAY_MS = 250;

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function fetchProductWorkspace(sku: string): Promise<ProductWorkspace | null> {
  if (sku !== MOCK_SKU) return delay(null);
  return delay(structuredClone(mockProductWorkspace));
}

export interface SaveProductContentInput {
  sku: string;
  storeViewId: string;
  improvedJa: ProductContentText;
}

export async function saveProductContent(input: SaveProductContentInput): Promise<{ savedAt: string }> {
  // TODO: 実データ接続時は PUT /api/products/:sku/content 相当に置き換える
  console.info('[productContentApi] saveProductContent (mock)', input);
  return delay({ savedAt: new Date().toISOString() });
}

export interface RequestApprovalInput {
  sku: string;
  requestedBy: string;
  comment?: string;
}

export async function requestApproval(input: RequestApprovalInput): Promise<{ requestId: string; requestedAt: string }> {
  // TODO: 実データ接続時は POST /api/products/:sku/approval 相当に置き換える
  console.info('[productContentApi] requestApproval (mock)', input);
  return delay({ requestId: `appr_${Date.now()}`, requestedAt: new Date().toISOString() });
}

/**
 * vitest向けのRegistryフィクスチャ。
 * D1 seed生成（scripts/registry-seed）と同じ buildRegistryDataFromSource() を単一ソースとして
 * 再利用することで、シードデータとテストデータのドリフトを防ぐ。
 */
export { buildRegistryDataFromSource } from '../../scripts/registry-seed/fromSource'

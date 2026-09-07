import { getLatest } from '../api/stackRegistryClient'
import type { RegistryData } from './types'

/**
 * Registry全体をアプリ起動時に1回fetchしてモジュール単位に保持するキャッシュ。
 * diagnosisEngine.ts / matchEngine.ts など既存の同期関数シグネチャを変えずに
 * マスターデータをRegistry参照へ切り替えるための土台（RegistryProviderがloadRegistry()を呼ぶ）。
 */
let cache: RegistryData | null = null
let inFlight: Promise<RegistryData> | null = null

export async function loadRegistry(): Promise<RegistryData> {
  if (cache) return cache
  if (!inFlight) {
    inFlight = getLatest()
      .then((data) => {
        cache = data
        return data
      })
      .finally(() => {
        inFlight = null
      })
  }
  return inFlight
}

/** ロード済みであれば同期的にRegistryDataを返す。未ロードの場合は例外を投げる（呼び出し側はRegistryGateでロード完了を保証すること）。 */
export function getRegistrySync(): RegistryData {
  if (!cache) {
    throw new Error('Registry is not loaded yet. Wrap the caller with <RegistryGate> or call loadRegistry() first.')
  }
  return cache
}

export function getRegistryOrNull(): RegistryData | null {
  return cache
}

/** 失敗後の再取得やvitestのテスト間クリーンアップのため、キャッシュを明示的に破棄する */
export function resetRegistry(): void {
  cache = null
  inFlight = null
}

/** vitest専用：Registryフィクスチャを直接注入する */
export function setRegistryForTesting(data: RegistryData): void {
  cache = data
}

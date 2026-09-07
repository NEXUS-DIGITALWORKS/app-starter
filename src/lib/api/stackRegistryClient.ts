import type { RegistryData } from '../registry/types'

const BASE_URL = (import.meta.env.VITE_REGISTRY_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

type ApiSuccess<T> = { data: T; meta: Record<string, unknown> }
type ApiError = { error: { code: string; message: string } }

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { signal })
  const body = (await res.json()) as ApiSuccess<T> | ApiError
  if (!res.ok || 'error' in body) {
    const message = 'error' in body ? body.error.message : `Registry API request failed (${res.status})`
    throw new Error(message)
  }
  return body.data
}

/** GET /api/v1/registry（published最新版）を取得する。RegistryProviderがアプリ起動時に1回だけ呼ぶ想定。 */
export async function getLatest(signal?: AbortSignal): Promise<RegistryData> {
  return fetchJson<RegistryData>('/api/v1/registry', signal)
}

/** 取得済み RegistryData への同期lookup（ネットワークアクセスなし） */
export function findTechnology(data: RegistryData, slug: string) {
  return data.technologies.find((t) => t.id === slug)
}

export function findStackPreset(data: RegistryData, id: string) {
  return data.stacks.find((s) => s.id === id)
}

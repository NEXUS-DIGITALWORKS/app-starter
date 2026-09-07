const BASE_URL = (import.meta.env.VITE_REGISTRY_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

type ApiSuccess<T> = { data: T; meta: Record<string, unknown> }
type ApiError = { error: { code: string; message: string } }

export class AdminApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

async function request<T>(path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const responseBody = (await res.json()) as ApiSuccess<T> | ApiError
  if (!res.ok || 'error' in responseBody) {
    if ('error' in responseBody) throw new AdminApiError(responseBody.error.code, responseBody.error.message)
    throw new AdminApiError('UNKNOWN', `Admin API request failed (${res.status})`)
  }
  return responseBody.data
}

type Resource = 'technologies' | 'categories' | 'tags' | 'stacks' | 'rules'

export function createEntity<T = { id: string }>(resource: Resource, body: unknown): Promise<T> {
  return request<T>(`/api/v1/admin/${resource}`, 'POST', body)
}

export function updateEntity<T = { id: string }>(resource: Resource, id: string, body: unknown): Promise<T> {
  return request<T>(`/api/v1/admin/${resource}/${encodeURIComponent(id)}`, 'PATCH', body)
}

export function deleteEntity<T = { id: string }>(resource: Resource, id: string): Promise<T> {
  return request<T>(`/api/v1/admin/${resource}/${encodeURIComponent(id)}`, 'DELETE')
}

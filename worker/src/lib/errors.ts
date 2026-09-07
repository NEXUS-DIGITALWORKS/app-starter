export function jsonSuccess(data: unknown, meta: Record<string, unknown>, headers: Record<string, string>): Response {
  return new Response(JSON.stringify({ data, meta }), { headers: { ...headers, 'content-type': 'application/json' } })
}

export function jsonError(code: string, message: string, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { ...headers, 'content-type': 'application/json' },
  })
}

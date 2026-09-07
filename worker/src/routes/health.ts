export function healthRoute(headers: Record<string, string>): Response {
  return new Response(JSON.stringify({ data: { status: 'ok' }, meta: {} }), {
    headers: { ...headers, 'content-type': 'application/json' },
  })
}

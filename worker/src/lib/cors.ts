const LOCALHOST_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/

/**
 * 許可オリジンを解決する。設定値(ALLOWED_ORIGIN)と厳密一致する場合はそれを返し、
 * 双方がlocalhost/127.0.0.1系オリジンの場合はポート番号の違いを許容する
 * （Viteは既定ポートが埋まっていると次のポートへフォールバックするため、
 *   ローカル開発体験を優先してここだけ緩める。本番相当のCloudflare Access配下運用は
 *   別のALLOWED_ORIGIN設定で厳密一致に戻す想定）。
 */
export function resolveAllowedOrigin(request: Request, allowedOrigin: string): string {
  const requestOrigin = request.headers.get('Origin')
  if (!requestOrigin) return allowedOrigin
  if (allowedOrigin === '*' || requestOrigin === allowedOrigin) return requestOrigin
  if (LOCALHOST_ORIGIN_PATTERN.test(requestOrigin) && LOCALHOST_ORIGIN_PATTERN.test(allowedOrigin)) return requestOrigin
  return allowedOrigin
}

export function buildCorsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

export function handleCorsPreflight(request: Request, origin: string): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: buildCorsHeaders(origin) })
  }
  return null
}

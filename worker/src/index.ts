import { D1RegistryRepository } from './repositories/d1RegistryRepository'
import { D1AdminRepository } from './repositories/d1AdminRepository'
import { RegistryService } from './services/registryService'
import { AdminService } from './services/adminService'
import { registryRoute, registryVersionRoute, stacksRoute, technologiesRoute } from './routes/registry'
import { adminTechnologiesRoute } from './routes/adminTechnologies'
import { adminCategoriesRoute } from './routes/adminCategories'
import { adminTagsRoute } from './routes/adminTags'
import { adminStacksRoute } from './routes/adminStacks'
import { adminRulesRoute } from './routes/adminRules'
import { healthRoute } from './routes/health'
import { buildCorsHeaders, handleCorsPreflight, resolveAllowedOrigin } from './lib/cors'
import { jsonError } from './lib/errors'

export interface Env {
  DB: D1Database
  ALLOWED_ORIGIN: string
}

type AdminRouteHandler = (
  service: AdminService,
  headers: Record<string, string>,
  method: string,
  id: string | undefined,
  body: unknown,
) => Promise<Response>

const ADMIN_ROUTES: Record<string, AdminRouteHandler> = {
  technologies: adminTechnologiesRoute,
  categories: adminCategoriesRoute,
  tags: adminTagsRoute,
  stacks: adminStacksRoute,
  rules: adminRulesRoute,
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = resolveAllowedOrigin(request, env.ALLOWED_ORIGIN ?? '*')
    const preflight = handleCorsPreflight(request, origin)
    if (preflight) return preflight

    const headers = buildCorsHeaders(origin)
    const url = new URL(request.url)
    const segments = url.pathname.split('/').filter(Boolean) // e.g. ['api','v1','registry','2026.09.1']

    if (segments[0] !== 'api' || segments[1] !== 'v1') {
      return jsonError('NOT_FOUND', `${url.pathname} not found.`, 404, headers)
    }

    if (segments[2] === 'health' && request.method === 'GET') {
      return healthRoute(headers)
    }

    // ---- Admin API（POST/PATCH/DELETE）------------------------------------
    // 既知のギャップ: 認証チェックなし。ローカル開発限定・未デプロイのため許容している。
    // 本番相当のCloudflare Access統合はP7で対応する（指示書25章）。
    if (segments[2] === 'admin') {
      const resource = segments[3]
      const routeHandler = resource ? ADMIN_ROUTES[resource] : undefined
      if (!routeHandler) return jsonError('NOT_FOUND', `${url.pathname} not found.`, 404, headers)
      if (!['POST', 'PATCH', 'DELETE'].includes(request.method)) {
        return jsonError('METHOD_NOT_ALLOWED', `${request.method} is not supported on ${url.pathname}`, 405, headers)
      }

      let body: unknown
      if (request.method === 'POST' || request.method === 'PATCH') {
        try {
          body = await request.json()
        } catch {
          return jsonError('VALIDATION_ERROR', 'Request body must be valid JSON.', 400, headers)
        }
      }

      const adminRepository = new D1AdminRepository(env.DB)
      const registryRepository = new D1RegistryRepository(env.DB)
      const adminService = new AdminService(registryRepository, adminRepository)
      const id = segments[4] ? decodeURIComponent(segments[4]) : undefined
      return routeHandler(adminService, headers, request.method, id, body)
    }

    // ---- 読み取り専用API（GETのみ）------------------------------------------
    if (request.method !== 'GET') {
      return jsonError('METHOD_NOT_ALLOWED', `${request.method} is not supported on ${url.pathname}`, 405, headers)
    }

    const repository = new D1RegistryRepository(env.DB)
    const service = new RegistryService(repository)

    if (segments[2] === 'registry' && segments[3] === 'version' && segments.length === 4) {
      return registryVersionRoute(service, headers)
    }
    if (segments[2] === 'registry' && segments.length === 4) {
      return registryRoute(service, headers, decodeURIComponent(segments[3]))
    }
    if (segments[2] === 'registry' && segments.length === 3) {
      return registryRoute(service, headers)
    }
    if (segments[2] === 'technologies') {
      return technologiesRoute(service, headers, segments[3] ? decodeURIComponent(segments[3]) : undefined)
    }
    if (segments[2] === 'stacks') {
      return stacksRoute(service, headers, segments[3] ? decodeURIComponent(segments[3]) : undefined)
    }

    return jsonError('NOT_FOUND', `${url.pathname} not found.`, 404, headers)
  },
}

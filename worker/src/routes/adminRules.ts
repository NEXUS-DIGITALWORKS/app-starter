import type { AdminService } from '../services/adminService'
import { jsonError } from '../lib/errors'
import { handleAdminRequest } from './adminErrors'

/** POST /api/v1/admin/rules, DELETE /api/v1/admin/rules/:id（一覧・編集は無し） */
export async function adminRulesRoute(
  service: AdminService,
  headers: Record<string, string>,
  method: string,
  id: string | undefined,
  body: unknown,
): Promise<Response> {
  if (method === 'POST' && !id) return handleAdminRequest(headers, () => service.createRule(body))
  if (method === 'DELETE' && id) return handleAdminRequest(headers, () => service.deleteRule(id))
  return jsonError('METHOD_NOT_ALLOWED', `${method} is not supported on this route.`, 405, headers)
}

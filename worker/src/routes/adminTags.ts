import type { AdminService } from '../services/adminService'
import { jsonError } from '../lib/errors'
import { handleAdminRequest } from './adminErrors'

/** POST /api/v1/admin/tags, PATCH|DELETE /api/v1/admin/tags/:id */
export async function adminTagsRoute(
  service: AdminService,
  headers: Record<string, string>,
  method: string,
  id: string | undefined,
  body: unknown,
): Promise<Response> {
  if (method === 'POST' && !id) return handleAdminRequest(headers, () => service.createTag(body))
  if (method === 'PATCH' && id) return handleAdminRequest(headers, () => service.updateTag(id, body))
  if (method === 'DELETE' && id) return handleAdminRequest(headers, () => service.deleteTag(id))
  return jsonError('METHOD_NOT_ALLOWED', `${method} is not supported on this route.`, 405, headers)
}

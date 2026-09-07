import type { AdminService } from '../services/adminService'
import { jsonError } from '../lib/errors'
import { handleAdminRequest } from './adminErrors'

/** POST /api/v1/admin/categories, PATCH|DELETE /api/v1/admin/categories/:id */
export async function adminCategoriesRoute(
  service: AdminService,
  headers: Record<string, string>,
  method: string,
  id: string | undefined,
  body: unknown,
): Promise<Response> {
  if (method === 'POST' && !id) return handleAdminRequest(headers, () => service.createCategory(body))
  if (method === 'PATCH' && id) return handleAdminRequest(headers, () => service.updateCategory(id, body))
  if (method === 'DELETE' && id) return handleAdminRequest(headers, () => service.deleteCategory(id))
  return jsonError('METHOD_NOT_ALLOWED', `${method} is not supported on this route.`, 405, headers)
}

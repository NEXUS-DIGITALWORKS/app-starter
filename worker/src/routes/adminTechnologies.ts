import type { AdminService } from '../services/adminService'
import { jsonError } from '../lib/errors'
import { handleAdminRequest } from './adminErrors'

/** POST /api/v1/admin/technologies, PATCH|DELETE /api/v1/admin/technologies/:id */
export async function adminTechnologiesRoute(
  service: AdminService,
  headers: Record<string, string>,
  method: string,
  id: string | undefined,
  body: unknown,
): Promise<Response> {
  if (method === 'POST' && !id) return handleAdminRequest(headers, () => service.createTechnology(body))
  if (method === 'PATCH' && id) return handleAdminRequest(headers, () => service.updateTechnology(id, body))
  if (method === 'DELETE' && id) return handleAdminRequest(headers, () => service.deleteTechnology(id))
  return jsonError('METHOD_NOT_ALLOWED', `${method} is not supported on this route.`, 405, headers)
}

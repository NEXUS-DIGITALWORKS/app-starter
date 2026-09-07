import type { AdminService } from '../services/adminService'
import { jsonError } from '../lib/errors'
import { handleAdminRequest } from './adminErrors'

/** POST /api/v1/admin/stacks, PATCH|DELETE /api/v1/admin/stacks/:id */
export async function adminStacksRoute(
  service: AdminService,
  headers: Record<string, string>,
  method: string,
  id: string | undefined,
  body: unknown,
): Promise<Response> {
  if (method === 'POST' && !id) return handleAdminRequest(headers, () => service.createStackPreset(body))
  if (method === 'PATCH' && id) return handleAdminRequest(headers, () => service.updateStackPreset(id, body))
  if (method === 'DELETE' && id) return handleAdminRequest(headers, () => service.deleteStackPreset(id))
  return jsonError('METHOD_NOT_ALLOWED', `${method} is not supported on this route.`, 405, headers)
}

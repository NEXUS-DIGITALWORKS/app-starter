import { AdminConflictError, AdminNotFoundError, AdminValidationError } from '../services/adminService'
import { jsonError, jsonSuccess } from '../lib/errors'

/** Admin系ルート共通のtry/catch→HTTPステータスマッピング。全adminXxx routesから共有する。 */
export async function handleAdminRequest(headers: Record<string, string>, fn: () => Promise<{ id: string }>): Promise<Response> {
  try {
    const result = await fn()
    return jsonSuccess(result, {}, headers)
  } catch (err) {
    if (err instanceof AdminValidationError) return jsonError('VALIDATION_ERROR', err.message, 400, headers)
    if (err instanceof AdminNotFoundError) return jsonError('NOT_FOUND', err.message, 404, headers)
    if (err instanceof AdminConflictError) return jsonError('CONFLICT', err.message, 409, headers)
    return jsonError('INTERNAL_ERROR', err instanceof Error ? err.message : 'unknown error', 500, headers)
  }
}

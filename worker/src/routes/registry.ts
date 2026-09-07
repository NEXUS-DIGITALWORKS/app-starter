import { RegistryNotFoundError, RegistryService } from '../services/registryService'
import { jsonError, jsonSuccess } from '../lib/errors'

async function resolveRegistry(service: RegistryService, versionLabel: string | undefined) {
  return versionLabel ? service.getRegistryByVersion(versionLabel) : service.getLatestRegistry()
}

/** GET /api/v1/registry, GET /api/v1/registry/:version — Registry全体取得（最重要API） */
export async function registryRoute(
  service: RegistryService,
  headers: Record<string, string>,
  versionLabel?: string,
): Promise<Response> {
  try {
    const data = await resolveRegistry(service, versionLabel)
    return jsonSuccess(data, { registryVersion: data.version.versionLabel }, headers)
  } catch (err) {
    if (err instanceof RegistryNotFoundError) return jsonError('NOT_FOUND', err.message, 404, headers)
    return jsonError('INTERNAL_ERROR', err instanceof Error ? err.message : 'unknown error', 500, headers)
  }
}

/** GET /api/v1/registry/version */
export async function registryVersionRoute(service: RegistryService, headers: Record<string, string>): Promise<Response> {
  try {
    const data = await service.getLatestRegistry()
    return jsonSuccess(data.version, { registryVersion: data.version.versionLabel }, headers)
  } catch (err) {
    if (err instanceof RegistryNotFoundError) return jsonError('NOT_FOUND', err.message, 404, headers)
    return jsonError('INTERNAL_ERROR', err instanceof Error ? err.message : 'unknown error', 500, headers)
  }
}

/** GET /api/v1/technologies, GET /api/v1/technologies/:slug */
export async function technologiesRoute(
  service: RegistryService,
  headers: Record<string, string>,
  slug?: string,
): Promise<Response> {
  try {
    const data = await service.getLatestRegistry()
    if (slug) {
      const technology = data.technologies.find((t) => t.id === slug)
      if (!technology) return jsonError('NOT_FOUND', `Technology "${slug}" not found.`, 404, headers)
      return jsonSuccess(technology, { registryVersion: data.version.versionLabel }, headers)
    }
    return jsonSuccess(data.technologies, { registryVersion: data.version.versionLabel }, headers)
  } catch (err) {
    if (err instanceof RegistryNotFoundError) return jsonError('NOT_FOUND', err.message, 404, headers)
    return jsonError('INTERNAL_ERROR', err instanceof Error ? err.message : 'unknown error', 500, headers)
  }
}

/** GET /api/v1/stacks, GET /api/v1/stacks/:slug */
export async function stacksRoute(service: RegistryService, headers: Record<string, string>, slug?: string): Promise<Response> {
  try {
    const data = await service.getLatestRegistry()
    if (slug) {
      const stack = data.stacks.find((s) => s.id === slug)
      if (!stack) return jsonError('NOT_FOUND', `Stack "${slug}" not found.`, 404, headers)
      return jsonSuccess(stack, { registryVersion: data.version.versionLabel }, headers)
    }
    return jsonSuccess(data.stacks, { registryVersion: data.version.versionLabel }, headers)
  } catch (err) {
    if (err instanceof RegistryNotFoundError) return jsonError('NOT_FOUND', err.message, 404, headers)
    return jsonError('INTERNAL_ERROR', err instanceof Error ? err.message : 'unknown error', 500, headers)
  }
}

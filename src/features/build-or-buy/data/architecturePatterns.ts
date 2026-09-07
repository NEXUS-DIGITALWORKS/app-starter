import { getRegistrySync } from '../../../lib/registry/registryCache'
import { selectArchitecturePatterns } from '../../../lib/registry/selectors'
import type { ArchitecturePattern } from '../types'

export function getArchitecturePatterns(): ArchitecturePattern[] {
  return selectArchitecturePatterns(getRegistrySync())
}

export function getArchitecturePattern(id: string): ArchitecturePattern | undefined {
  return getArchitecturePatterns().find((pattern) => pattern.id === id)
}

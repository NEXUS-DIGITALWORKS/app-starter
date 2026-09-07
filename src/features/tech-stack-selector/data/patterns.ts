import { getRegistrySync } from '../../../lib/registry/registryCache'
import { selectAllPatternIds, selectPatternMap, selectPatterns } from '../../../lib/registry/selectors'
import type { Pattern } from '../types'

export function getPatterns(): Pattern[] {
  return selectPatterns(getRegistrySync())
}

export function getPatternMap(): Record<string, Pattern> {
  return selectPatternMap(getRegistrySync())
}

export function getAllPatternIds(): string[] {
  return selectAllPatternIds(getRegistrySync())
}

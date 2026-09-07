import { getRegistrySync } from '../../../lib/registry/registryCache'
import { selectTechCategories } from '../../../lib/registry/selectors'
import type { TechCategory } from '../types'

export function getCategories(): TechCategory[] {
  return selectTechCategories(getRegistrySync())
}

import { getRegistrySync } from '../../../lib/registry/registryCache'
import { selectElementDetails } from '../../../lib/registry/selectors'
import type { ElementDetail } from './elementDetails.seed'

export type { ElementDetail } from './elementDetails.seed'

export function getElementDetails(): Record<string, ElementDetail> {
  return selectElementDetails(getRegistrySync())
}

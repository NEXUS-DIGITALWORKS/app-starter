import { getRegistrySync } from '../../../lib/registry/registryCache'
import { selectPatternDetails } from '../../../lib/registry/selectors'
import type { PatternDetail } from './patternDetails.seed'

export type { PatternDetail } from './patternDetails.seed'

export function getPatternDetails(): Record<string, PatternDetail> {
  return selectPatternDetails(getRegistrySync())
}

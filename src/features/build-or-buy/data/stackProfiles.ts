import { getRegistrySync } from '../../../lib/registry/registryCache'
import { selectStackProfiles } from '../../../lib/registry/selectors'
import type { StackProfile } from '../types'

export function getStackProfiles(): StackProfile[] {
  return selectStackProfiles(getRegistrySync())
}

export function findStackProfile(appTypeId: string, patternId: string): StackProfile | undefined {
  const profiles = getStackProfiles()
  const exact = profiles.find((profile) => profile.patternId === patternId && profile.appTypeIds.includes(appTypeId))
  if (exact) return exact
  return profiles.find((profile) => profile.patternId === patternId)
}

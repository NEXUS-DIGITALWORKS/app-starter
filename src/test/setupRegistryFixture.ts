import { beforeAll } from 'vitest'
import { setRegistryForTesting } from '../lib/registry/registryCache'
import { buildRegistryDataFromSource } from './registryFixture'

beforeAll(() => {
  setRegistryForTesting(buildRegistryDataFromSource())
})

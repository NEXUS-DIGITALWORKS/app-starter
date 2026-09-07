import { getRegistrySync } from '../../../lib/registry/registryCache'
import { selectExistingSaasOptionToProductId, selectSaasProducts } from '../../../lib/registry/selectors'
import type { SaasProduct } from './saasProducts.seed'

export type { SaasProduct } from './saasProducts.seed'

export function getSaasProducts(): SaasProduct[] {
  return selectSaasProducts(getRegistrySync())
}

export function getExistingSaasOptionToProductId(): Record<string, string> {
  return selectExistingSaasOptionToProductId(getRegistrySync())
}

export function findSaasProducts(appTypeId: string, patternId?: string): SaasProduct[] {
  const candidates = getSaasProducts().filter((product) => product.appTypeIds.includes(appTypeId))
  const preferred = candidates.filter((product) => patternId && product.preferWhenPatternIds?.includes(patternId))
  const rest = candidates.filter((product) => !preferred.includes(product))
  return [...preferred, ...rest].slice(0, 2)
}

export function estimateSaasMonthlyCost(product: SaasProduct, userCount: number): number {
  return product.monthlyBaseFee + product.monthlyPricePerUser * Math.max(userCount, 1)
}

/**
 * retail.org.ai
 *
 * Ontology package for retail
 *
 * @example
 * ```typescript
 * import { Retail, things } from 'retail.org.ai'
 * ```
 *
 * @see https://retail.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type {
  Retail,
  RetailSubsector,
  RetailSubsectorType,
  SalesChannel,
  MotorVehicleDealers,
  FoodBeverageStores,
  ClothingStores,
  GeneralMerchandise,
  ElectronicsAppliances,
  NonstoreRetailers,
  AnyRetail
} from './types'

// Import types for runtime use
import type { Retail, AnyRetail } from './types'

/**
 * Collection of all retail instances
 * Fetched from https://retail.org.ai
 */
export const things: Promise<AnyRetail[]> = fetch('https://retail.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Retail by ID
 */
export async function get(id: string): Promise<AnyRetail | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://retail.org.ai/${id}`)
}

/**
 * Search retail by name or description
 */
export async function search(query: string): Promise<AnyRetail[]> {
  const items = await things
  const q = query.toLowerCase()
  return items.filter(item =>
    item.name?.toLowerCase().includes(q) ||
    item.description?.toLowerCase().includes(q)
  )
}

/**
 * Domain metadata
 */
export const domain = {
  '@context': 'https://retail.org.ai',
  '@id': 'https://retail.org.ai',
  name: 'retail.org.ai',
  parent: 'industries.org.ai',
  naicsCodes: ['44', '45'],
  description: 'NAICS 44-45: Retail Trade - Establishments selling merchandise for personal or household consumption',
  types: [
    'Retail',
    'MotorVehicleDealers',          // 441
    'FurnitureStores',              // 442
    'ElectronicsAppliances',        // 443
    'BuildingMaterials',            // 444
    'FoodBeverageStores',           // 445
    'HealthPersonalCare',           // 446
    'GasolineStations',             // 447
    'ClothingStores',               // 448
    'SportingGoodsHobby',           // 451
    'GeneralMerchandise',           // 452
    'MiscellaneousRetailers',       // 453
    'NonstoreRetailers'             // 454
  ]
} as const

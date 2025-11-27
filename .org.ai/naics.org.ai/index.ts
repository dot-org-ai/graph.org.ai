/**
 * naics.org.ai
 *
 * North American Industry Classification System (NAICS)
 * Full complexity with all hierarchical levels.
 *
 * For simple industry access, use industries.org.ai instead.
 *
 * @example
 * ```typescript
 * import { sectors, subsectors, nationalIndustries } from 'naics.org.ai'
 *
 * // Get all 2-digit sectors
 * const allSectors = await sectors
 *
 * // Get specific 6-digit code
 * const cloud = await nationalIndustries.get('518210')
 *
 * // Search across all levels
 * const tech = await nationalIndustries.search('computing')
 * ```
 *
 * @see https://naics.org.ai
 * @see https://www.census.gov/naics/
 * @license CC-BY-SA-4.0
 */

import { createOntology } from 'schema.org.ai'
import type {
  Sector,
  Subsector,
  IndustryGroup,
  NAICSIndustry,
  NationalIndustry,
  NAICSCode
} from './types'

export * from './types'

/**
 * NAICS Sectors (2-digit codes)
 * 20 top-level economic sectors
 */
export const sectors = createOntology<Sector>({
  domain: 'naics.org.ai',
  name: 'sectors'
})

/**
 * NAICS Subsectors (3-digit codes)
 */
export const subsectors = createOntology<Subsector>({
  domain: 'naics.org.ai',
  name: 'subsectors'
})

/**
 * NAICS Industry Groups (4-digit codes)
 */
export const industryGroups = createOntology<IndustryGroup>({
  domain: 'naics.org.ai',
  name: 'industryGroups'
})

/**
 * NAICS Industries (5-digit codes)
 */
export const naicsIndustries = createOntology<NAICSIndustry>({
  domain: 'naics.org.ai',
  name: 'naicsIndustries'
})

/**
 * NAICS National Industries (6-digit codes)
 * Most granular level, US-specific
 */
export const nationalIndustries = createOntology<NationalIndustry>({
  domain: 'naics.org.ai',
  name: 'nationalIndustries'
})

/**
 * All NAICS codes (all levels combined)
 */
export const codes = createOntology<NAICSCode>({
  domain: 'naics.org.ai',
  name: 'codes'
})

/**
 * Get a NAICS code by its numeric code (auto-detects level)
 */
export async function getByCode(naicsCode: string): Promise<NAICSCode | undefined> {
  const all = await codes
  return all.find(item => item.naicsCode === naicsCode)
}

/**
 * Get parent code
 */
export async function getParent(naicsCode: string): Promise<NAICSCode | undefined> {
  if (naicsCode.length <= 2) return undefined
  const parentCode = naicsCode.slice(0, -1)
  return getByCode(parentCode)
}

/**
 * Get children codes
 */
export async function getChildren(naicsCode: string): Promise<NAICSCode[]> {
  const all = await codes
  return all.filter(item =>
    item.naicsCode.startsWith(naicsCode) &&
    item.naicsCode.length === naicsCode.length + 1
  )
}

/**
 * naics.org.ai - Type Definitions
 *
 * North American Industry Classification System (NAICS)
 * Full complexity with all hierarchical levels.
 *
 * For simple industry access, use industries.org.ai instead.
 *
 * @see https://naics.org.ai
 * @see https://www.census.gov/naics/
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

/**
 * Base NAICS code interface
 */
interface NAICSBase extends Thing {
  '@context': 'https://naics.org.ai'
  /** NAICS numeric code */
  naicsCode: string
  /** Code description from NAICS */
  title: string
  /** Parent code in hierarchy */
  parent?: string
  /** Child codes */
  children?: string[]
}

/**
 * Sector - 2-digit NAICS code
 *
 * @example
 * { naicsCode: '11', title: 'Agriculture, Forestry, Fishing and Hunting' }
 * { naicsCode: '51', title: 'Information' }
 * { naicsCode: '52', title: 'Finance and Insurance' }
 */
export interface Sector extends NAICSBase {
  '@type': 'https://naics.org.ai/Sector'
  naicsCode: `${number}${number}` // 2 digits
}

/**
 * Subsector - 3-digit NAICS code
 *
 * @example
 * { naicsCode: '111', title: 'Crop Production', parent: '11' }
 * { naicsCode: '518', title: 'Computing Infrastructure Providers, Data Processing, Web Hosting, and Related Services' }
 */
export interface Subsector extends NAICSBase {
  '@type': 'https://naics.org.ai/Subsector'
  naicsCode: `${number}${number}${number}` // 3 digits
  sector: string
}

/**
 * IndustryGroup - 4-digit NAICS code
 *
 * @example
 * { naicsCode: '1111', title: 'Oilseed and Grain Farming', parent: '111' }
 * { naicsCode: '5182', title: 'Computing Infrastructure Providers, Data Processing, and Web Hosting' }
 */
export interface IndustryGroup extends NAICSBase {
  '@type': 'https://naics.org.ai/IndustryGroup'
  naicsCode: `${number}${number}${number}${number}` // 4 digits
  subsector: string
}

/**
 * NAICSIndustry - 5-digit NAICS code
 *
 * @example
 * { naicsCode: '11111', title: 'Soybean Farming', parent: '1111' }
 * { naicsCode: '51821', title: 'Computing Infrastructure Providers' }
 */
export interface NAICSIndustry extends NAICSBase {
  '@type': 'https://naics.org.ai/NAICSIndustry'
  naicsCode: `${number}${number}${number}${number}${number}` // 5 digits
  industryGroup: string
}

/**
 * NationalIndustry - 6-digit NAICS code (US-specific)
 *
 * @example
 * { naicsCode: '111110', title: 'Soybean Farming' }
 * { naicsCode: '518210', title: 'Computing Infrastructure Providers, Data Processing, Web Hosting, and Related Services' }
 */
export interface NationalIndustry extends NAICSBase {
  '@type': 'https://naics.org.ai/NationalIndustry'
  naicsCode: `${number}${number}${number}${number}${number}${number}` // 6 digits
  naicsIndustry: string
  /** SIC code crosswalk */
  sicCodes?: string[]
  /** ISIC code crosswalk */
  isicCode?: string
}

/**
 * Union of all NAICS types
 */
export type NAICSCode = Sector | Subsector | IndustryGroup | NAICSIndustry | NationalIndustry

/**
 * NAICS hierarchy levels
 */
export type NAICSLevel = 'Sector' | 'Subsector' | 'IndustryGroup' | 'NAICSIndustry' | 'NationalIndustry'

/**
 * Get the level from a NAICS code length
 */
export function getLevel(code: string): NAICSLevel {
  switch (code.length) {
    case 2: return 'Sector'
    case 3: return 'Subsector'
    case 4: return 'IndustryGroup'
    case 5: return 'NAICSIndustry'
    case 6: return 'NationalIndustry'
    default: throw new Error(`Invalid NAICS code length: ${code.length}`)
  }
}

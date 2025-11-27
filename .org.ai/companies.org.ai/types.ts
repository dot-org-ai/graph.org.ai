/**
 * companies.org.ai - Type Definitions
 *
 * Registered corporate entities.
 *
 * @see https://companies.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Business } from 'business.org.ai'

/**
 * Company - https://companies.org.ai/Company
 */
export interface Company extends Business {
  '@context': 'https://companies.org.ai'
  '@type': 'https://companies.org.ai/Company'
  '@id': string
  name: string
  description?: string
}

/**
 * Corporation - https://companies.org.ai/Corporation
 */
export interface Corporation extends Business {
  '@context': 'https://companies.org.ai'
  '@type': 'https://companies.org.ai/Corporation'
  '@id': string
  name: string
  description?: string
}


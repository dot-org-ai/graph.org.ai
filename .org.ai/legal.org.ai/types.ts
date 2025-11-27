/**
 * legal.org.ai - Type Definitions
 *
 * Legal documents and processes.
 *
 * @see https://legal.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Law } from 'law.org.ai'

/**
 * LegalService - https://legal.org.ai/LegalService
 */
export interface LegalService extends Law {
  '@context': 'https://legal.org.ai'
  '@type': 'https://legal.org.ai/LegalService'
  '@id': string
  name: string
  description?: string
}


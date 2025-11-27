/**
 * hospitality.org.ai - Type Definitions
 *
 * Ontology types for hospitality
 *
 * @see https://hospitality.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Business } from 'business.org.ai'

/**
 * Hospitality - https://hospitality.org.ai/Hospitality
 */
export interface Hospitality extends Business {
  '@context': 'https://hospitality.org.ai'
  '@type': 'https://hospitality.org.ai/Hospitality'
  '@id': string
  name: string
  description?: string
}


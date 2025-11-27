/**
 * enterprises.org.ai - Type Definitions
 *
 * Ontology types for enterprises
 *
 * @see https://enterprises.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Business } from 'business.org.ai'

/**
 * Enterprises - https://enterprises.org.ai/Enterprises
 */
export interface Enterprises extends Business {
  '@context': 'https://enterprises.org.ai'
  '@type': 'https://enterprises.org.ai/Enterprises'
  '@id': string
  name: string
  description?: string
}


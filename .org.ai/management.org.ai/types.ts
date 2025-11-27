/**
 * management.org.ai - Type Definitions
 *
 * Ontology types for management
 *
 * @see https://management.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Business } from 'business.org.ai'

/**
 * Management - https://management.org.ai/Management
 */
export interface Management extends Business {
  '@context': 'https://management.org.ai'
  '@type': 'https://management.org.ai/Management'
  '@id': string
  name: string
  description?: string
}


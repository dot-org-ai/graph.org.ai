/**
 * contracts.org.ai - Type Definitions
 *
 * Ontology types for contracts
 *
 * @see https://contracts.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Law } from 'law.org.ai'

/**
 * Contracts - https://contracts.org.ai/Contracts
 */
export interface Contracts extends Law {
  '@context': 'https://contracts.org.ai'
  '@type': 'https://contracts.org.ai/Contracts'
  '@id': string
  name: string
  description?: string
}


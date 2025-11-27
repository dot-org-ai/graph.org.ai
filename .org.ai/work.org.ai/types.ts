/**
 * work.org.ai - Type Definitions
 *
 * Ontology types for work
 *
 * @see https://work.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Business } from 'business.org.ai'

/**
 * Work - https://work.org.ai/Work
 */
export interface Work extends Business {
  '@context': 'https://work.org.ai'
  '@type': 'https://work.org.ai/Work'
  '@id': string
  name: string
  description?: string
}


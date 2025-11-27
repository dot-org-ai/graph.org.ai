/**
 * molecules.org.ai - Type Definitions
 *
 * Ontology types for molecules
 *
 * @see https://molecules.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Science } from 'science.org.ai'

/**
 * Molecules - https://molecules.org.ai/Molecules
 */
export interface Molecules extends Science {
  '@context': 'https://molecules.org.ai'
  '@type': 'https://molecules.org.ai/Molecules'
  '@id': string
  name: string
  description?: string
}


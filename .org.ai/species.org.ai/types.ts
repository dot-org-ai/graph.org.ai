/**
 * species.org.ai - Type Definitions
 *
 * Ontology types for species
 *
 * @see https://species.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Science } from 'science.org.ai'

/**
 * Species - https://species.org.ai/Species
 */
export interface Species extends Science {
  '@context': 'https://species.org.ai'
  '@type': 'https://species.org.ai/Species'
  '@id': string
  name: string
  description?: string
}


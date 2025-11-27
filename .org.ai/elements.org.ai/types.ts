/**
 * elements.org.ai - Type Definitions
 *
 * Ontology types for elements
 *
 * @see https://elements.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Science } from 'science.org.ai'

/**
 * Elements - https://elements.org.ai/Elements
 */
export interface Elements extends Science {
  '@context': 'https://elements.org.ai'
  '@type': 'https://elements.org.ai/Elements'
  '@id': string
  name: string
  description?: string
}


/**
 * safety.org.ai - Type Definitions
 *
 * Ontology types for safety
 *
 * @see https://safety.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Agi } from 'agi.org.ai'

/**
 * Safety - https://safety.org.ai/Safety
 */
export interface Safety extends Agi {
  '@context': 'https://safety.org.ai'
  '@type': 'https://safety.org.ai/Safety'
  '@id': string
  name: string
  description?: string
}


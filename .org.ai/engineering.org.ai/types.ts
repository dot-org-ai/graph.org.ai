/**
 * engineering.org.ai - Type Definitions
 *
 * Ontology types for engineering
 *
 * @see https://engineering.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Work } from 'work.org.ai'

/**
 * Engineering - https://engineering.org.ai/Engineering
 */
export interface Engineering extends Work {
  '@context': 'https://engineering.org.ai'
  '@type': 'https://engineering.org.ai/Engineering'
  '@id': string
  name: string
  description?: string
}


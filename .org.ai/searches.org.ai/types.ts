/**
 * searches.org.ai - Type Definitions
 *
 * Ontology types for searches
 *
 * @see https://searches.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Agents } from 'agents.org.ai'

/**
 * Searches - https://searches.org.ai/Searches
 */
export interface Searches extends Agents {
  '@context': 'https://searches.org.ai'
  '@type': 'https://searches.org.ai/Searches'
  '@id': string
  name: string
  description?: string
}


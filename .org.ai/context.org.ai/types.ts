/**
 * context.org.ai - Type Definitions
 *
 * Ontology types for context
 *
 * @see https://context.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Agents } from 'agents.org.ai'

/**
 * Context - https://context.org.ai/Context
 */
export interface Context extends Agents {
  '@context': 'https://context.org.ai'
  '@type': 'https://context.org.ai/Context'
  '@id': string
  name: string
  description?: string
}


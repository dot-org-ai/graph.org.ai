/**
 * ideas.org.ai - Type Definitions
 *
 * Ontology types for ideas
 *
 * @see https://ideas.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Knowledge } from 'knowledge.org.ai'

/**
 * Ideas - https://ideas.org.ai/Ideas
 */
export interface Ideas extends Knowledge {
  '@context': 'https://ideas.org.ai'
  '@type': 'https://ideas.org.ai/Ideas'
  '@id': string
  name: string
  description?: string
}


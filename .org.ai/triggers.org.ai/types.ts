/**
 * triggers.org.ai - Type Definitions
 *
 * Ontology types for triggers
 *
 * @see https://triggers.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Agents } from 'agents.org.ai'

/**
 * Triggers - https://triggers.org.ai/Triggers
 */
export interface Triggers extends Agents {
  '@context': 'https://triggers.org.ai'
  '@type': 'https://triggers.org.ai/Triggers'
  '@id': string
  name: string
  description?: string
}


/**
 * agi.org.ai - Type Definitions
 *
 * Ontology types for agi
 *
 * @see https://agi.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Agents } from 'agents.org.ai'

/**
 * Agi - https://agi.org.ai/Agi
 */
export interface Agi extends Agents {
  '@context': 'https://agi.org.ai'
  '@type': 'https://agi.org.ai/Agi'
  '@id': string
  name: string
  description?: string
}


/**
 * people.org.ai - Type Definitions
 *
 * Human beings.
 *
 * @see https://people.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Agents } from 'agents.org.ai'

/**
 * Person - https://people.org.ai/Person
 */
export interface Person extends Agents {
  '@context': 'https://people.org.ai'
  '@type': 'https://people.org.ai/Person'
  '@id': string
  name: string
  description?: string
}


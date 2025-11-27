/**
 * agents.org.ai - Type Definitions
 *
 * Autonomous or semi-autonomous actors.
 *
 * @see https://agents.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Nouns } from 'nouns.org.ai'

/**
 * Agent - https://agents.org.ai/Agent
 */
export interface Agent extends Nouns {
  '@context': 'https://agents.org.ai'
  '@type': 'https://agents.org.ai/Agent'
  '@id': string
  name: string
  description?: string
}


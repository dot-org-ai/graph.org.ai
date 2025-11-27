/**
 * schedules.org.ai - Type Definitions
 *
 * Ontology types for schedules
 *
 * @see https://schedules.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Agents } from 'agents.org.ai'

/**
 * Schedules - https://schedules.org.ai/Schedules
 */
export interface Schedules extends Agents {
  '@context': 'https://schedules.org.ai'
  '@type': 'https://schedules.org.ai/Schedules'
  '@id': string
  name: string
  description?: string
}


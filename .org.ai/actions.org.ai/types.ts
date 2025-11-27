/**
 * actions.org.ai - Type Definitions
 *
 * Something done by an agent.
 *
 * @see https://actions.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Verbs } from 'verbs.org.ai'

/**
 * Action - https://actions.org.ai/Action
 */
export interface Action extends Verbs {
  '@context': 'https://actions.org.ai'
  '@type': 'https://actions.org.ai/Action'
  '@id': string
  name: string
  description?: string
}


/**
 * events.org.ai - Type Definitions
 *
 * Unified event model connecting verbs to 5W+H (Who, What, Where, When, Why, How), extending EPCIS.
 *
 * @see https://events.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Verbs } from 'verbs.org.ai'

/**
 * Event - https://events.org.ai/Event
 */
export interface Event extends Verbs {
  '@context': 'https://events.org.ai'
  '@type': 'https://events.org.ai/Event'
  '@id': string
  name: string
  description?: string
}


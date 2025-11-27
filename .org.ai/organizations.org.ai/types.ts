/**
 * organizations.org.ai - Type Definitions
 *
 * Structured groups of people.
 *
 * @see https://organizations.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Agents } from 'agents.org.ai'

/**
 * Organization - https://organizations.org.ai/Organization
 */
export interface Organization extends Agents {
  '@context': 'https://organizations.org.ai'
  '@type': 'https://organizations.org.ai/Organization'
  '@id': string
  name: string
  description?: string
}


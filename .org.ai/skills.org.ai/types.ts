/**
 * skills.org.ai - Type Definitions
 *
 * Abilities required for tasks.
 *
 * @see https://skills.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Knowledge } from 'knowledge.org.ai'

/**
 * Skill - https://skills.org.ai/Skill
 */
export interface Skill extends Knowledge {
  '@context': 'https://skills.org.ai'
  '@type': 'https://skills.org.ai/Skill'
  '@id': string
  name: string
  description?: string
}


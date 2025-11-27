/**
 * science.org.ai - Type Definitions
 *
 * Systematic enterprise that builds and organizes knowledge.
 *
 * @see https://science.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Knowledge } from 'knowledge.org.ai'

/**
 * Science - https://science.org.ai/Science
 */
export interface Science extends Knowledge {
  '@context': 'https://science.org.ai'
  '@type': 'https://science.org.ai/Science'
  '@id': string
  name: string
  description?: string
}


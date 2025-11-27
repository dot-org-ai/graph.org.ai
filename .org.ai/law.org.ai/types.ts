/**
 * law.org.ai - Type Definitions
 *
 * Legal systems and legislation.
 *
 * @see https://law.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Knowledge } from 'knowledge.org.ai'

/**
 * Legislation - https://law.org.ai/Legislation
 */
export interface Legislation extends Knowledge {
  '@context': 'https://law.org.ai'
  '@type': 'https://law.org.ai/Legislation'
  '@id': string
  name: string
  description?: string
}


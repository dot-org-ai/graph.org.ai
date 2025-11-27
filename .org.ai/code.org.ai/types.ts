/**
 * code.org.ai - Type Definitions
 *
 * Ontology types for code
 *
 * @see https://code.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Tech } from 'tech.org.ai'

/**
 * Code - https://code.org.ai/Code
 */
export interface Code extends Tech {
  '@context': 'https://code.org.ai'
  '@type': 'https://code.org.ai/Code'
  '@id': string
  name: string
  description?: string
}


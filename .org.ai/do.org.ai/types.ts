/**
 * do.org.ai - Type Definitions
 *
 * Ontology types for do
 *
 * @see https://do.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

/**
 * Do - https://do.org.ai/Do
 */
export interface Do extends Thing {
  '@context': 'https://do.org.ai'
  '@type': 'https://do.org.ai/Do'
  '@id': string
  name: string
  description?: string
}


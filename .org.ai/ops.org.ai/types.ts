/**
 * ops.org.ai - Type Definitions
 *
 * Ontology types for ops
 *
 * @see https://ops.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Work } from 'work.org.ai'

/**
 * Ops - https://ops.org.ai/Ops
 */
export interface Ops extends Work {
  '@context': 'https://ops.org.ai'
  '@type': 'https://ops.org.ai/Ops'
  '@id': string
  name: string
  description?: string
}


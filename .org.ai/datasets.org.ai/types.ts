/**
 * datasets.org.ai - Type Definitions
 *
 * Structured collections of data.
 *
 * @see https://datasets.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Knowledge } from 'knowledge.org.ai'

/**
 * Dataset - https://datasets.org.ai/Dataset
 */
export interface Dataset extends Knowledge {
  '@context': 'https://datasets.org.ai'
  '@type': 'https://datasets.org.ai/Dataset'
  '@id': string
  name: string
  description?: string
}


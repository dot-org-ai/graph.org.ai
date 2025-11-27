/**
 * research.org.ai - Type Definitions
 *
 * Ontology types for research
 *
 * @see https://research.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Knowledge } from 'knowledge.org.ai'

/**
 * Research - https://research.org.ai/Research
 */
export interface Research extends Knowledge {
  '@context': 'https://research.org.ai'
  '@type': 'https://research.org.ai/Research'
  '@id': string
  name: string
  description?: string
}


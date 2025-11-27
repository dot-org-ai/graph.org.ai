/**
 * wiki.org.ai - Type Definitions
 *
 * Ontology types for wiki
 *
 * @see https://wiki.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Knowledge } from 'knowledge.org.ai'

/**
 * Wiki - https://wiki.org.ai/Wiki
 */
export interface Wiki extends Knowledge {
  '@context': 'https://wiki.org.ai'
  '@type': 'https://wiki.org.ai/Wiki'
  '@id': string
  name: string
  description?: string
}


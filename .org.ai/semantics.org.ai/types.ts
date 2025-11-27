/**
 * semantics.org.ai - Type Definitions
 *
 * Ontology types for semantics
 *
 * @see https://semantics.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Language } from 'language.org.ai'

/**
 * Semantics - https://semantics.org.ai/Semantics
 */
export interface Semantics extends Language {
  '@context': 'https://semantics.org.ai'
  '@type': 'https://semantics.org.ai/Semantics'
  '@id': string
  name: string
  description?: string
}


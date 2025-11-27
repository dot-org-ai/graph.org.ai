/**
 * materials.org.ai - Type Definitions
 *
 * Ontology types for materials
 *
 * @see https://materials.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Science } from 'science.org.ai'

/**
 * Materials - https://materials.org.ai/Materials
 */
export interface Materials extends Science {
  '@context': 'https://materials.org.ai'
  '@type': 'https://materials.org.ai/Materials'
  '@id': string
  name: string
  description?: string
}


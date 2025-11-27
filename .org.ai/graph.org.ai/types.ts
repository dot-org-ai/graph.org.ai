/**
 * graph.org.ai - Type Definitions
 *
 * The meta-graph definition and core ontology for the .org.ai ecosystem.
 *
 * @see https://graph.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

/**
 * Graph - https://graph.org.ai/Graph
 */
export interface Graph extends Thing {
  '@context': 'https://graph.org.ai'
  '@type': 'https://graph.org.ai/Graph'
  '@id': string
  name: string
  description?: string
}

/**
 * Ontology - https://graph.org.ai/Ontology
 */
export interface Ontology extends Thing {
  '@context': 'https://graph.org.ai'
  '@type': 'https://graph.org.ai/Ontology'
  '@id': string
  name: string
  description?: string
}

/**
 * Schema - https://graph.org.ai/Schema
 */
export interface Schema extends Thing {
  '@context': 'https://graph.org.ai'
  '@type': 'https://graph.org.ai/Schema'
  '@id': string
  name: string
  description?: string
}


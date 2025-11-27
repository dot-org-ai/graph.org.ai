/**
 * genes.org.ai - Type Definitions
 *
 * Ontology types for genes
 *
 * @see https://genes.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Science } from 'science.org.ai'

/**
 * Genes - https://genes.org.ai/Genes
 */
export interface Genes extends Science {
  '@context': 'https://genes.org.ai'
  '@type': 'https://genes.org.ai/Genes'
  '@id': string
  name: string
  description?: string
}


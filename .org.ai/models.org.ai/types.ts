/**
 * models.org.ai - Type Definitions
 *
 * AI and Statistical Models.
 *
 * @see https://models.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Tech } from 'tech.org.ai'

/**
 * AIModel - https://models.org.ai/AIModel
 */
export interface AIModel extends Tech {
  '@context': 'https://models.org.ai'
  '@type': 'https://models.org.ai/AIModel'
  '@id': string
  name: string
  description?: string
}

/**
 * MLModel - https://models.org.ai/MLModel
 */
export interface MLModel extends Tech {
  '@context': 'https://models.org.ai'
  '@type': 'https://models.org.ai/MLModel'
  '@id': string
  name: string
  description?: string
}


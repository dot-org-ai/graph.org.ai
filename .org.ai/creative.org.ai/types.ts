/**
 * creative.org.ai - Type Definitions
 *
 * Creative works.
 *
 * @see https://creative.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Media } from 'media.org.ai'

/**
 * CreativeWork - https://creative.org.ai/CreativeWork
 */
export interface CreativeWork extends Media {
  '@context': 'https://creative.org.ai'
  '@type': 'https://creative.org.ai/CreativeWork'
  '@id': string
  name: string
  description?: string
}


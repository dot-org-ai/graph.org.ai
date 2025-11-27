/**
 * content.org.ai - Type Definitions
 *
 * Media content.
 *
 * @see https://content.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Media } from 'media.org.ai'

/**
 * MediaObject - https://content.org.ai/MediaObject
 */
export interface MediaObject extends Media {
  '@context': 'https://content.org.ai'
  '@type': 'https://content.org.ai/MediaObject'
  '@id': string
  name: string
  description?: string
}


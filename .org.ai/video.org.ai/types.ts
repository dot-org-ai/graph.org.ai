/**
 * video.org.ai - Type Definitions
 *
 * Ontology types for video
 *
 * @see https://video.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Media } from 'media.org.ai'

/**
 * Video - https://video.org.ai/Video
 */
export interface Video extends Media {
  '@context': 'https://video.org.ai'
  '@type': 'https://video.org.ai/Video'
  '@id': string
  name: string
  description?: string
}


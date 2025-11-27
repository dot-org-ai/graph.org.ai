/**
 * apis.org.ai - Type Definitions
 *
 * Application Programming Interfaces.
 *
 * @see https://apis.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Tech } from 'tech.org.ai'

/**
 * WebAPI - https://apis.org.ai/WebAPI
 */
export interface WebAPI extends Tech {
  '@context': 'https://apis.org.ai'
  '@type': 'https://apis.org.ai/WebAPI'
  '@id': string
  name: string
  description?: string
}


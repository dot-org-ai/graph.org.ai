/**
 * tech.org.ai - Type Definitions
 *
 * Technology stacks and software.
 *
 * @see https://tech.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Things } from 'things.org.ai'

/**
 * Technology - https://tech.org.ai/Technology
 */
export interface Technology extends Things {
  '@context': 'https://tech.org.ai'
  '@type': 'https://tech.org.ai/Technology'
  '@id': string
  name: string
  description?: string
}

/**
 * Stack - https://tech.org.ai/Stack
 */
export interface Stack extends Things {
  '@context': 'https://tech.org.ai'
  '@type': 'https://tech.org.ai/Stack'
  '@id': string
  name: string
  description?: string
}


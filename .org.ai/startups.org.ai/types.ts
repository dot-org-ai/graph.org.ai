/**
 * startups.org.ai - Type Definitions
 *
 * New business ventures.
 *
 * @see https://startups.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Business } from 'business.org.ai'

/**
 * Startup - https://startups.org.ai/Startup
 */
export interface Startup extends Business {
  '@context': 'https://startups.org.ai'
  '@type': 'https://startups.org.ai/Startup'
  '@id': string
  name: string
  description?: string
}


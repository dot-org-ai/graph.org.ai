/**
 * transport.org.ai - Type Definitions
 *
 * Ontology types for transport
 *
 * @see https://transport.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Business } from 'business.org.ai'

/**
 * Transport - https://transport.org.ai/Transport
 */
export interface Transport extends Business {
  '@context': 'https://transport.org.ai'
  '@type': 'https://transport.org.ai/Transport'
  '@id': string
  name: string
  description?: string
}


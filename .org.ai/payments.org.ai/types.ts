/**
 * payments.org.ai - Type Definitions
 *
 * Ontology types for payments
 *
 * @see https://payments.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Business } from 'business.org.ai'

/**
 * Payments - https://payments.org.ai/Payments
 */
export interface Payments extends Business {
  '@context': 'https://payments.org.ai'
  '@type': 'https://payments.org.ai/Payments'
  '@id': string
  name: string
  description?: string
}


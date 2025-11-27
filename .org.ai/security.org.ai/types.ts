/**
 * security.org.ai - Type Definitions
 *
 * Ontology types for security
 *
 * @see https://security.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Tech } from 'tech.org.ai'

/**
 * Security - https://security.org.ai/Security
 */
export interface Security extends Tech {
  '@context': 'https://security.org.ai'
  '@type': 'https://security.org.ai/Security'
  '@id': string
  name: string
  description?: string
}


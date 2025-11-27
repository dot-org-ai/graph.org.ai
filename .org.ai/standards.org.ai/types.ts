/**
 * standards.org.ai - Type Definitions
 *
 * International standards and classification systems not owned by platform.
 *
 * @see https://standards.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Knowledge } from 'knowledge.org.ai'

/**
 * Standards - https://standards.org.ai/Standards
 */
export interface Standards extends Knowledge {
  '@context': 'https://standards.org.ai'
  '@type': 'https://standards.org.ai/Standards'
  '@id': string
  name: string
  description?: string
}


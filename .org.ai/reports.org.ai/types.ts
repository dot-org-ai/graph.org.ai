/**
 * reports.org.ai - Type Definitions
 *
 * Ontology types for reports
 *
 * @see https://reports.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Media } from 'media.org.ai'

/**
 * Reports - https://reports.org.ai/Reports
 */
export interface Reports extends Media {
  '@context': 'https://reports.org.ai'
  '@type': 'https://reports.org.ai/Reports'
  '@id': string
  name: string
  description?: string
}


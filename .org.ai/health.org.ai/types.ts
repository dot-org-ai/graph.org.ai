/**
 * health.org.ai - Type Definitions
 *
 * Health and medical related concepts.
 *
 * @see https://health.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Science } from 'science.org.ai'

/**
 * MedicalEntity - https://health.org.ai/MedicalEntity
 */
export interface MedicalEntity extends Science {
  '@context': 'https://health.org.ai'
  '@type': 'https://health.org.ai/MedicalEntity'
  '@id': string
  name: string
  description?: string
}


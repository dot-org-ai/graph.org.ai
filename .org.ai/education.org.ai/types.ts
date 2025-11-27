/**
 * education.org.ai - Type Definitions
 *
 * Learning, teaching, and training.
 *
 * @see https://education.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Knowledge } from 'knowledge.org.ai'

/**
 * EducationalOrganization - https://education.org.ai/EducationalOrganization
 */
export interface EducationalOrganization extends Knowledge {
  '@context': 'https://education.org.ai'
  '@type': 'https://education.org.ai/EducationalOrganization'
  '@id': string
  name: string
  description?: string
}

/**
 * Course - https://education.org.ai/Course
 */
export interface Course extends Knowledge {
  '@context': 'https://education.org.ai'
  '@type': 'https://education.org.ai/Course'
  '@id': string
  name: string
  description?: string
}


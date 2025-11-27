/**
 * courses.org.ai - Type Definitions
 *
 * Ontology types for courses
 *
 * @see https://courses.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Education } from 'education.org.ai'

/**
 * Courses - https://courses.org.ai/Courses
 */
export interface Courses extends Education {
  '@context': 'https://courses.org.ai'
  '@type': 'https://courses.org.ai/Courses'
  '@id': string
  name: string
  description?: string
}


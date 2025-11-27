/**
 * robotics.org.ai - Type Definitions
 *
 * Ontology types for robotics
 *
 * @see https://robotics.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Tech } from 'tech.org.ai'

/**
 * Robotics - https://robotics.org.ai/Robotics
 */
export interface Robotics extends Tech {
  '@context': 'https://robotics.org.ai'
  '@type': 'https://robotics.org.ai/Robotics'
  '@id': string
  name: string
  description?: string
}


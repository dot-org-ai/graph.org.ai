/**
 * onet.org.ai - Type Definitions
 *
 * Standardized occupational skills, tools, and technology classifications.
 *
 * @see https://onet.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Standards } from 'standards.org.ai'

/**
 * Occupation - https://onet.org.ai/Occupation
 */
export interface Occupation extends Standards {
  '@context': 'https://onet.org.ai'
  '@type': 'https://onet.org.ai/Occupation'
  '@id': string
  name: string
  description?: string
}

/**
 * Task - https://onet.org.ai/Task
 */
export interface Task extends Standards {
  '@context': 'https://onet.org.ai'
  '@type': 'https://onet.org.ai/Task'
  '@id': string
  name: string
  description?: string
}

/**
 * Activity - https://onet.org.ai/Activity
 */
export interface Activity extends Standards {
  '@context': 'https://onet.org.ai'
  '@type': 'https://onet.org.ai/Activity'
  '@id': string
  name: string
  description?: string
}

/**
 * Tool - https://onet.org.ai/Tool
 */
export interface Tool extends Standards {
  '@context': 'https://onet.org.ai'
  '@type': 'https://onet.org.ai/Tool'
  '@id': string
  name: string
  description?: string
}

/**
 * Technology - https://onet.org.ai/Technology
 */
export interface Technology extends Standards {
  '@context': 'https://onet.org.ai'
  '@type': 'https://onet.org.ai/Technology'
  '@id': string
  name: string
  description?: string
}

/**
 * Skill - https://onet.org.ai/Skill
 */
export interface Skill extends Standards {
  '@context': 'https://onet.org.ai'
  '@type': 'https://onet.org.ai/Skill'
  '@id': string
  name: string
  description?: string
}


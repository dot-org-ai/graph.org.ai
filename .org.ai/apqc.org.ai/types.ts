/**
 * apqc.org.ai - Type Definitions
 *
 * Standardized business process and activity classifications.
 *
 * @see https://apqc.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Standards } from 'standards.org.ai'

/**
 * Process - https://apqc.org.ai/Process
 */
export interface Process extends Standards {
  '@context': 'https://apqc.org.ai'
  '@type': 'https://apqc.org.ai/Process'
  '@id': string
  name: string
  description?: string
}

/**
 * Activity - https://apqc.org.ai/Activity
 */
export interface Activity extends Standards {
  '@context': 'https://apqc.org.ai'
  '@type': 'https://apqc.org.ai/Activity'
  '@id': string
  name: string
  description?: string
}

/**
 * Task - https://apqc.org.ai/Task
 */
export interface Task extends Standards {
  '@context': 'https://apqc.org.ai'
  '@type': 'https://apqc.org.ai/Task'
  '@id': string
  name: string
  description?: string
}


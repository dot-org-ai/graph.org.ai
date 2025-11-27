/**
 * activities.org.ai - Type Definitions
 *
 * Standardized definitions of ongoing actions and processes.
 *
 * @see https://activities.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Actions } from 'actions.org.ai'

/**
 * Activity - https://activities.org.ai/Activity
 */
export interface Activity extends Actions {
  '@context': 'https://activities.org.ai'
  '@type': 'https://activities.org.ai/Activity'
  '@id': string
  name: string
  description?: string
}


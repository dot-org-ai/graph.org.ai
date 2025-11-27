/**
 * jobs.org.ai - Type Definitions
 *
 * Employment roles and listings.
 *
 * @see https://jobs.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Work } from 'work.org.ai'

/**
 * JobPosting - https://jobs.org.ai/JobPosting
 */
export interface JobPosting extends Work {
  '@context': 'https://jobs.org.ai'
  '@type': 'https://jobs.org.ai/JobPosting'
  '@id': string
  name: string
  description?: string
}

/**
 * Role - https://jobs.org.ai/Role
 */
export interface Role extends Work {
  '@context': 'https://jobs.org.ai'
  '@type': 'https://jobs.org.ai/Role'
  '@id': string
  name: string
  description?: string
}


/**
 * jobs.org.ai
 *
 * Employment roles and listings.
 *
 * @example
 * ```typescript
 * import { JobPosting, things } from 'jobs.org.ai'
 * ```
 *
 * @see https://jobs.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { JobPosting, Role } from './types'

// Import types for runtime use
import type { JobPosting, Role } from './types'

/**
 * Collection of all jobs instances
 * Fetched from https://jobs.org.ai
 */
export const things: Promise<(JobPosting | Role)[]> = fetch('https://jobs.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific JobPosting by ID
 */
export async function get(id: string): Promise<JobPosting | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://jobs.org.ai/${id}`)
}

/**
 * Search jobs by name or description
 */
export async function search(query: string): Promise<(JobPosting | Role)[]> {
  const items = await things
  const q = query.toLowerCase()
  return items.filter(item =>
    item.name?.toLowerCase().includes(q) ||
    item.description?.toLowerCase().includes(q)
  )
}

/**
 * Domain metadata
 */
export const domain = {
  '@context': 'https://jobs.org.ai',
  '@id': 'https://jobs.org.ai',
  name: 'jobs.org.ai',
  parent: 'work.org.ai',
  types: ['JobPosting', 'Role']
} as const

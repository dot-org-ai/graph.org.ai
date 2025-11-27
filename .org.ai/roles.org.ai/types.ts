/**
 * roles.org.ai - Type Definitions
 *
 * Capabilities and functions assigned to agents.
 *
 * @see https://roles.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Agents } from 'agents.org.ai'

/**
 * Role - https://roles.org.ai/Role
 */
export interface Role extends Agents {
  '@context': 'https://roles.org.ai'
  '@type': 'https://roles.org.ai/Role'
  '@id': string
  name: string
  description?: string
}


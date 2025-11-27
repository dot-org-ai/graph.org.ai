/**
 * workflows.org.ai - Type Definitions
 *
 * Ontology types for workflows
 *
 * @see https://workflows.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Agents } from 'agents.org.ai'

/**
 * Workflows - https://workflows.org.ai/Workflows
 */
export interface Workflows extends Agents {
  '@context': 'https://workflows.org.ai'
  '@type': 'https://workflows.org.ai/Workflows'
  '@id': string
  name: string
  description?: string
}


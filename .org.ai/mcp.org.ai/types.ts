/**
 * mcp.org.ai - Type Definitions
 *
 * Ontology types for mcp
 *
 * @see https://mcp.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Agents } from 'agents.org.ai'

/**
 * Mcp - https://mcp.org.ai/Mcp
 */
export interface Mcp extends Agents {
  '@context': 'https://mcp.org.ai'
  '@type': 'https://mcp.org.ai/Mcp'
  '@id': string
  name: string
  description?: string
}


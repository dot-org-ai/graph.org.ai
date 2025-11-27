/**
 * agents.md.org.ai - Type Definitions
 *
 * Standard specification for AGENTS.md files, defining agent profiles and capabilities.
 *
 * @see https://agents.md.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Markdown } from 'markdown.org.ai'

/**
 * AgentProfile - https://agents.md.org.ai/AgentProfile
 */
export interface AgentProfile extends Markdown {
  '@context': 'https://agents.md.org.ai'
  '@type': 'https://agents.md.org.ai/AgentProfile'
  '@id': string
  name: string
  description?: string
}


/**
 * readme.md.org.ai - Type Definitions
 *
 * Standard specification for README.md files, describing projects and domains.
 *
 * @see https://readme.md.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Markdown } from 'markdown.org.ai'

/**
 * Readme - https://readme.md.org.ai/Readme
 */
export interface Readme extends Markdown {
  '@context': 'https://readme.md.org.ai'
  '@type': 'https://readme.md.org.ai/Readme'
  '@id': string
  name: string
  description?: string
}


/**
 * md.org.ai - Type Definitions
 *
 * Standard Markdown file format conventions and specifications.
 *
 * @see https://md.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Markdown } from 'markdown.org.ai'

/**
 * MarkdownFile - https://md.org.ai/MarkdownFile
 */
export interface MarkdownFile extends Markdown {
  '@context': 'https://md.org.ai'
  '@type': 'https://md.org.ai/MarkdownFile'
  '@id': string
  name: string
  description?: string
}


/**
 * mdx.org.ai - Type Definitions
 *
 * MDXLD standard: YAML-LD embedded in MDX for structured data + content + code + UI.
 *
 * @see https://mdx.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Markdown } from 'markdown.org.ai'

/**
 * MDXLD - https://mdx.org.ai/MDXLD
 */
export interface MDXLD extends Markdown {
  '@context': 'https://mdx.org.ai'
  '@type': 'https://mdx.org.ai/MDXLD'
  '@id': string
  name: string
  description?: string
}


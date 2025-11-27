/**
 * functions.org.ai - Type Definitions
 *
 * Functional units of execution or logic.
 *
 * @see https://functions.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Nouns } from 'nouns.org.ai'

/**
 * CodeFunction - https://functions.org.ai/CodeFunction
 */
export interface CodeFunction extends Nouns {
  '@context': 'https://functions.org.ai'
  '@type': 'https://functions.org.ai/CodeFunction'
  '@id': string
  name: string
  description?: string
}

/**
 * GenerativeFunction - https://functions.org.ai/GenerativeFunction
 */
export interface GenerativeFunction extends Nouns {
  '@context': 'https://functions.org.ai'
  '@type': 'https://functions.org.ai/GenerativeFunction'
  '@id': string
  name: string
  description?: string
}

/**
 * AgenticFunction - https://functions.org.ai/AgenticFunction
 */
export interface AgenticFunction extends Nouns {
  '@context': 'https://functions.org.ai'
  '@type': 'https://functions.org.ai/AgenticFunction'
  '@id': string
  name: string
  description?: string
}

/**
 * HumanFunction - https://functions.org.ai/HumanFunction
 */
export interface HumanFunction extends Nouns {
  '@context': 'https://functions.org.ai'
  '@type': 'https://functions.org.ai/HumanFunction'
  '@id': string
  name: string
  description?: string
}


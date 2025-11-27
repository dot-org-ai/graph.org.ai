/**
 * vc.org.ai - Type Definitions
 *
 * Venture Capital.
 *
 * @see https://vc.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Finance } from 'finance.org.ai'

/**
 * Investment - https://vc.org.ai/Investment
 */
export interface Investment extends Finance {
  '@context': 'https://vc.org.ai'
  '@type': 'https://vc.org.ai/Investment'
  '@id': string
  name: string
  description?: string
}


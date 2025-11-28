/**
 * agriculture.org.ai - Type Definitions
 *
 * Ontology types for agriculture
 *
 * @see https://agriculture.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

/**
 * Agriculture - https://agriculture.org.ai/Agriculture
 */
export interface Agriculture extends Thing {
  '@context': 'https://agriculture.org.ai'
  '@type': 'https://agriculture.org.ai/Agriculture'
  '@id': string
  name: string
  description?: string
  naicsCode?: string
}

/**
 * vehicles.org.ai - Type Definitions
 *
 * Ontology types for vehicles
 *
 * @see https://vehicles.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Tools } from 'tools.org.ai'

/**
 * Vehicles - https://vehicles.org.ai/Vehicles
 */
export interface Vehicles extends Tools {
  '@context': 'https://vehicles.org.ai'
  '@type': 'https://vehicles.org.ai/Vehicles'
  '@id': string
  name: string
  description?: string
}


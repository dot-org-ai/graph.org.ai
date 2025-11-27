/**
 * gs1.org.ai - Type Definitions
 *
 * Standardized types for commercial products, places, and supply chain events.
 *
 * @see https://gs1.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Standards } from 'standards.org.ai'

/**
 * Product - https://gs1.org.ai/Product
 */
export interface Product extends Standards {
  '@context': 'https://gs1.org.ai'
  '@type': 'https://gs1.org.ai/Product'
  '@id': string
  name: string
  description?: string
}

/**
 * Place - https://gs1.org.ai/Place
 */
export interface Place extends Standards {
  '@context': 'https://gs1.org.ai'
  '@type': 'https://gs1.org.ai/Place'
  '@id': string
  name: string
  description?: string
}

/**
 * Location - https://gs1.org.ai/Location
 */
export interface Location extends Standards {
  '@context': 'https://gs1.org.ai'
  '@type': 'https://gs1.org.ai/Location'
  '@id': string
  name: string
  description?: string
}

/**
 * Event - https://gs1.org.ai/Event
 */
export interface Event extends Standards {
  '@context': 'https://gs1.org.ai'
  '@type': 'https://gs1.org.ai/Event'
  '@id': string
  name: string
  description?: string
}

/**
 * Organization - https://gs1.org.ai/Organization
 */
export interface Organization extends Standards {
  '@context': 'https://gs1.org.ai'
  '@type': 'https://gs1.org.ai/Organization'
  '@id': string
  name: string
  description?: string
}


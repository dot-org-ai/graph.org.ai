/**
 * textiles.org.ai - Type Definitions
 *
 * Ontology types for textiles industry
 *
 * @see https://textiles.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'
import type { Industries } from 'industries.org.ai'

/**
 * Textiles - https://textiles.org.ai/Textiles
 */
export interface Textiles extends Industries {
  '@context': 'https://textiles.org.ai'
  '@type': 'https://textiles.org.ai/Textiles'
  '@id': string
  name: string
  naicsCode?: string
  description?: string
  parent?: string
}

/**
 * TextileMills - https://textiles.org.ai/TextileMills
 * NAICS 313
 */
export interface TextileMills extends Textiles {
  '@type': 'https://textiles.org.ai/TextileMills'
}

/**
 * TextileProducts - https://textiles.org.ai/TextileProducts
 * NAICS 314
 */
export interface TextileProducts extends Textiles {
  '@type': 'https://textiles.org.ai/TextileProducts'
}

/**
 * Apparel - https://textiles.org.ai/Apparel
 * NAICS 315
 */
export interface Apparel extends Textiles {
  '@type': 'https://textiles.org.ai/Apparel'
}

/**
 * TechnicalTextiles - https://textiles.org.ai/TechnicalTextiles
 */
export interface TechnicalTextiles extends Textiles {
  '@type': 'https://textiles.org.ai/TechnicalTextiles'
}

/**
 * SustainableTextiles - https://textiles.org.ai/SustainableTextiles
 */
export interface SustainableTextiles extends Textiles {
  '@type': 'https://textiles.org.ai/SustainableTextiles'
}

/**
 * TextileTech - https://textiles.org.ai/TextileTech
 */
export interface TextileTech extends Textiles {
  '@type': 'https://textiles.org.ai/TextileTech'
}

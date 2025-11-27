/**
 * consulting.org.ai - Type Definitions
 *
 * Ontology types for consulting services aligned with NAICS 5416
 * (Management, Scientific, and Technical Consulting Services)
 *
 * @see https://consulting.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Business } from 'business.org.ai'

/**
 * Base Consulting interface
 * https://consulting.org.ai/Consulting
 */
export interface Consulting extends Business {
  '@context': 'https://consulting.org.ai'
  '@type': 'https://consulting.org.ai/Consulting'
  '@id': string
  name: string
  description?: string
  naicsCode?: string
  naicsTitle?: string
  parent?: string
}

/**
 * Management Consulting - NAICS 541611
 * Strategic advisory and operational transformation services
 * https://consulting.org.ai/ManagementConsulting
 */
export interface ManagementConsulting extends Consulting {
  '@type': 'https://consulting.org.ai/ManagementConsulting'
  naicsCode: '541611'
  naicsTitle: 'Administrative Management and General Management Consulting Services'
}

/**
 * IT Consulting - NAICS 541618
 * Technology advisory, systems integration, and digital transformation
 * https://consulting.org.ai/ITConsulting
 */
export interface ITConsulting extends Consulting {
  '@type': 'https://consulting.org.ai/ITConsulting'
  naicsCode: '541618'
  naicsTitle: 'Other Management Consulting Services (IT and Digital Transformation)'
}

/**
 * HR Consulting - NAICS 541612
 * Human resources advisory including talent, compensation, and organizational design
 * https://consulting.org.ai/HRConsulting
 */
export interface HRConsulting extends Consulting {
  '@type': 'https://consulting.org.ai/HRConsulting'
  naicsCode: '541612'
  naicsTitle: 'Human Resources Consulting Services'
}

/**
 * Financial Advisory - NAICS 541618
 * M&A advisory, restructuring, valuation, and corporate finance
 * https://consulting.org.ai/FinancialAdvisory
 */
export interface FinancialAdvisory extends Consulting {
  '@type': 'https://consulting.org.ai/FinancialAdvisory'
  naicsCode: '541618'
  naicsTitle: 'Other Management Consulting Services (Financial Advisory)'
}

/**
 * Risk Consulting - NAICS 541618
 * Enterprise risk management, compliance, internal audit, and cybersecurity
 * https://consulting.org.ai/RiskConsulting
 */
export interface RiskConsulting extends Consulting {
  '@type': 'https://consulting.org.ai/RiskConsulting'
  naicsCode: '541618'
  naicsTitle: 'Other Management Consulting Services (Risk and Compliance)'
}

/**
 * Marketing Consulting - NAICS 541613
 * Brand strategy, digital marketing, customer experience, and marketing transformation
 * https://consulting.org.ai/MarketingConsulting
 */
export interface MarketingConsulting extends Consulting {
  '@type': 'https://consulting.org.ai/MarketingConsulting'
  naicsCode: '541613'
  naicsTitle: 'Marketing Consulting Services'
}


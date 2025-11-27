/**
 * insurance.org.ai - Type Definitions
 *
 * Ontology types for insurance
 *
 * @see https://insurance.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Business } from 'business.org.ai'

/**
 * Insurance - https://insurance.org.ai/Insurance
 * Base insurance type for all insurance products and services
 */
export interface Insurance extends Business {
  '@context': 'https://insurance.org.ai'
  '@type': 'https://insurance.org.ai/Insurance'
  '@id': string
  name: string
  description?: string
  naicsCode?: string
}

/**
 * LifeInsurance - https://insurance.org.ai/LifeInsurance
 * Life insurance products including term, whole, universal life, and annuities
 */
export interface LifeInsurance extends Insurance {
  '@type': 'https://insurance.org.ai/LifeInsurance'
  productType?: 'term' | 'whole' | 'universal' | 'variable' | 'annuity'
  coverageAmount?: number
  premiumAmount?: number
  cashValue?: number
}

/**
 * PropertyCasualty - https://insurance.org.ai/PropertyCasualty
 * Property and casualty insurance including auto, home, commercial, and liability
 */
export interface PropertyCasualty extends Insurance {
  '@type': 'https://insurance.org.ai/PropertyCasualty'
  lineOfBusiness?: 'auto' | 'homeowners' | 'commercial' | 'liability' | 'workers-comp' | 'umbrella'
  coverageType?: 'property' | 'liability' | 'combined'
  deductible?: number
  policyLimit?: number
}

/**
 * HealthInsurance - https://insurance.org.ai/HealthInsurance
 * Health insurance including group, individual, Medicare, and Medicaid
 */
export interface HealthInsurance extends Insurance {
  '@type': 'https://insurance.org.ai/HealthInsurance'
  planType?: 'HMO' | 'PPO' | 'EPO' | 'POS' | 'HDHP'
  marketSegment?: 'employer' | 'individual' | 'medicare' | 'medicaid'
  deductible?: number
  outOfPocketMax?: number
  premiumAmount?: number
}

/**
 * Reinsurance - https://insurance.org.ai/Reinsurance
 * Reinsurance for insurance companies including treaty and facultative
 */
export interface Reinsurance extends Insurance {
  '@type': 'https://insurance.org.ai/Reinsurance'
  reinsuranceType?: 'treaty' | 'facultative'
  structure?: 'proportional' | 'non-proportional' | 'quota-share' | 'excess-of-loss'
  attachment?: number
  limit?: number
}

/**
 * InsurTech - https://insurance.org.ai/InsurTech
 * Insurance technology companies and digital insurance innovations
 */
export interface InsurTech extends Insurance {
  '@type': 'https://insurance.org.ai/InsurTech'
  businessModel?: 'digital-carrier' | 'embedded' | 'MGA' | 'IaaS' | 'technology-vendor'
  technology?: string[]
  fundingRound?: string
  valuation?: number
}

/**
 * ClaimsManagement - https://insurance.org.ai/ClaimsManagement
 * Claims processing, adjustment, and fraud detection services
 */
export interface ClaimsManagement extends Insurance {
  '@type': 'https://insurance.org.ai/ClaimsManagement'
  claimType?: 'property' | 'casualty' | 'health' | 'life' | 'workers-comp'
  claimStatus?: 'reported' | 'investigating' | 'evaluating' | 'negotiating' | 'settled' | 'closed' | 'denied'
  claimAmount?: number
  reserveAmount?: number
}


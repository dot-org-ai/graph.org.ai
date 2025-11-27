/**
 * finance.org.ai - Type Definitions
 *
 * Financial systems, money, and instruments.
 *
 * @see https://finance.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Business } from 'business.org.ai'

/**
 * FinancialProduct - https://finance.org.ai/FinancialProduct
 */
export interface FinancialProduct extends Business {
  '@context': 'https://finance.org.ai'
  '@type': 'https://finance.org.ai/FinancialProduct'
  '@id': string
  name: string
  description?: string
}

/**
 * MonetaryAmount - https://finance.org.ai/MonetaryAmount
 */
export interface MonetaryAmount extends Business {
  '@context': 'https://finance.org.ai'
  '@type': 'https://finance.org.ai/MonetaryAmount'
  '@id': string
  name: string
  description?: string
}


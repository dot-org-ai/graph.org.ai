/**
 * retail.org.ai - Type Definitions
 *
 * Ontology types for retail (NAICS 44-45)
 *
 * @see https://retail.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'
import type { Industries } from 'industries.org.ai'

/**
 * Retail - Base interface for all retail trade establishments
 * https://retail.org.ai/Retail
 *
 * NAICS Sectors 44-45: Retail Trade
 */
export interface Retail extends Industries {
  '@context': 'https://retail.org.ai'
  '@type': 'https://retail.org.ai/Retail' | RetailSubsectorType
  '@id': string
  name: string
  description?: string
  naicsCode?: string
  subsector?: RetailSubsector
  storeCount?: number
  salesChannel?: SalesChannel[]
  merchandiseCategory?: string[]
  targetMarket?: string
  physicalLocation?: boolean
  onlinePresence?: boolean
}

/**
 * Retail Subsectors (NAICS 441-454)
 */
export type RetailSubsector =
  | 'MotorVehicleDealers'          // 441
  | 'FurnitureStores'              // 442
  | 'ElectronicsAppliances'        // 443
  | 'BuildingMaterials'            // 444
  | 'FoodBeverageStores'           // 445
  | 'HealthPersonalCare'           // 446
  | 'GasolineStations'             // 447
  | 'ClothingStores'               // 448
  | 'SportingGoodsHobby'           // 451
  | 'GeneralMerchandise'           // 452
  | 'MiscellaneousRetailers'       // 453
  | 'NonstoreRetailers'            // 454

export type RetailSubsectorType = `https://retail.org.ai/${RetailSubsector}`

/**
 * Sales channels used by retailers
 */
export type SalesChannel =
  | 'Physical'      // Traditional storefront
  | 'Online'        // E-commerce website
  | 'Mobile'        // Mobile app
  | 'Catalog'       // Mail order catalog
  | 'DirectSales'   // In-home or party sales
  | 'Vending'       // Vending machines
  | 'Marketplace'   // Third-party platform
  | 'Television'    // TV shopping networks
  | 'Social'        // Social media commerce

/**
 * Motor Vehicle and Parts Dealers (NAICS 441)
 */
export interface MotorVehicleDealers extends Retail {
  '@type': 'https://retail.org.ai/MotorVehicleDealers'
  naicsCode: '441'
  subsector: 'MotorVehicleDealers'
  vehicleType?: 'Automobile' | 'Motorcycle' | 'RV' | 'Boat' | 'Parts'
  franchiseBrands?: string[]
  servicesDepartment?: boolean
}

/**
 * Food and Beverage Stores (NAICS 445)
 */
export interface FoodBeverageStores extends Retail {
  '@type': 'https://retail.org.ai/FoodBeverageStores'
  naicsCode: '445'
  subsector: 'FoodBeverageStores'
  storeFormat?: 'Supermarket' | 'Supercenter' | 'Convenience' | 'Specialty' | 'WarehouseClub'
  organicOffering?: boolean
  preparedFoods?: boolean
}

/**
 * Clothing and Clothing Accessories Stores (NAICS 448)
 */
export interface ClothingStores extends Retail {
  '@type': 'https://retail.org.ai/ClothingStores'
  naicsCode: '448'
  subsector: 'ClothingStores'
  apparelCategory?: 'Mens' | 'Womens' | 'Childrens' | 'Family' | 'Footwear' | 'Accessories'
  pricePoint?: 'Budget' | 'Mid' | 'Premium' | 'Luxury'
  fashionType?: 'FastFashion' | 'Contemporary' | 'Athletic' | 'Formal'
}

/**
 * General Merchandise Stores (NAICS 452)
 */
export interface GeneralMerchandise extends Retail {
  '@type': 'https://retail.org.ai/GeneralMerchandise'
  naicsCode: '452'
  subsector: 'GeneralMerchandise'
  storeType?: 'DepartmentStore' | 'Supercenter' | 'WarehouseClub' | 'DiscountStore' | 'VarietyStore'
  membershipRequired?: boolean
  groceryIncluded?: boolean
}

/**
 * Electronics and Appliance Stores (NAICS 443)
 */
export interface ElectronicsAppliances extends Retail {
  '@type': 'https://retail.org.ai/ElectronicsAppliances'
  naicsCode: '443'
  subsector: 'ElectronicsAppliances'
  productFocus?: 'ConsumerElectronics' | 'Computers' | 'Appliances' | 'Mobile' | 'AudioVideo'
  techSupport?: boolean
  installationServices?: boolean
}

/**
 * Nonstore Retailers (NAICS 454)
 */
export interface NonstoreRetailers extends Retail {
  '@type': 'https://retail.org.ai/NonstoreRetailers'
  naicsCode: '454'
  subsector: 'NonstoreRetailers'
  channelType?: 'Ecommerce' | 'Catalog' | 'DirectSelling' | 'Vending' | 'TelevisionShopping'
  marketplaceModel?: boolean
  subscriptionOffering?: boolean
}

/**
 * Union type of all retail subsector interfaces
 */
export type AnyRetail =
  | Retail
  | MotorVehicleDealers
  | FoodBeverageStores
  | ClothingStores
  | GeneralMerchandise
  | ElectronicsAppliances
  | NonstoreRetailers


---
$id: https://retail.org.ai
$context: https://retail.org.ai
name: retail.org.ai
parent: industries.org.ai
license: CC-BY-SA-4.0
---

# retail.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for retail.

## Overview

The retail trade sector encompasses establishments engaged in retailing merchandise, generally without transformation, and rendering services incidental to the sale of merchandise. The retail trade sector is a critical component of the U.S. economy, serving as the primary channel for distributing goods to final consumers.

This domain covers **NAICS Sectors 44-45: Retail Trade**, which includes all establishments primarily engaged in selling merchandise for personal or household consumption and providing services related to the sale of merchandise.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [business.org.ai](https://business.org.ai) > [industries.org.ai](https://industries.org.ai)

## NAICS 44-45: Retail Trade Hierarchy

The retail trade sector consists of two complementary sub-sectors that together form the complete retail ecosystem:

### Sector 44: Retail Trade (Store-Based)
Establishments operating from fixed point-of-sale locations for direct selling to consumers.

### Sector 45: Retail Trade (Other)
Includes additional retail channels including online, catalog, vending, and direct selling.

## Retail Trade Subsectors

| Code | Subsector | Description |
|------|-----------|-------------|
| **441** | [Motor Vehicle and Parts Dealers](#motor-vehicle-dealers) | Retailing new and used motor vehicles, automotive parts, accessories, and tires |
| **442** | [Furniture and Home Furnishings Stores](#furniture-stores) | Retailing household furniture, home furnishings, and housewares |
| **443** | [Electronics and Appliance Stores](#electronics-appliances) | Retailing new electronics, household appliances, and related products |
| **444** | [Building Material and Garden Equipment Stores](#building-materials) | Retailing building materials, hardware, lawn and garden equipment |
| **445** | [Food and Beverage Stores](#food-beverage-stores) | Retailing food and beverages for consumption off premises |
| **446** | [Health and Personal Care Stores](#health-personal-care) | Retailing health and personal care products |
| **447** | [Gasoline Stations](#gasoline-stations) | Retailing automotive fuels and lubricants |
| **448** | [Clothing and Clothing Accessories Stores](#clothing-stores) | Retailing new clothing and clothing accessories |
| **451** | [Sporting Goods, Hobby, Musical Instrument, and Book Stores](#sporting-goods-hobby) | Retailing sporting goods, games, toys, hobby supplies, musical instruments, and books |
| **452** | [General Merchandise Stores](#general-merchandise) | Retailing a variety of general merchandise in department stores and warehouse clubs |
| **453** | [Miscellaneous Store Retailers](#miscellaneous-retailers) | Retailing specialized merchandise not covered in other subsectors |
| **454** | [Nonstore Retailers](#nonstore-retailers) | Retailing via Internet, catalogs, direct sales, and vending machines |

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [business.org.ai](https://business.org.ai)
                └── [industries.org.ai](https://industries.org.ai)
                    └── **retail.org.ai**

## Key Characteristics of Retail Trade

Retail establishments are distinguished by:

1. **Direct Consumer Sales**: Primary focus on selling to final consumers for personal or household use
2. **Fixed or Mobile Locations**: Traditional storefronts, online platforms, or mobile selling
3. **Merchandise Display**: Products available for immediate inspection and purchase
4. **Inventory Management**: Maintaining stock of goods for immediate sale
5. **Customer Service**: Personal assistance, product information, and after-sales support
6. **Small Quantities**: Typically selling individual items or small quantities

## Retail Business Models

### Store-Based Retail
- **Department Stores**: Wide variety of merchandise organized into departments
- **Specialty Stores**: Focused product lines (clothing, electronics, sporting goods)
- **Supermarkets & Grocery**: Food and beverage retail
- **Convenience Stores**: Small format, extended hours, limited selection
- **Warehouse Clubs**: Membership-based, bulk quantities, wholesale prices

### Non-Store Retail
- **E-Commerce**: Online marketplaces and direct-to-consumer websites
- **Catalog/Mail Order**: Traditional catalog and phone ordering
- **Direct Selling**: In-home demonstrations and party-plan selling
- **Vending Machines**: Automated merchandise dispensing
- **Mobile Retail**: Trucks, carts, and pop-up locations

## Types

```typescript
interface Retail extends Industries {
  '@context': 'https://retail.org.ai'
  '@type': 'https://retail.org.ai/Retail'
  naicsCode?: string              // NAICS classification code
  subsector?: RetailSubsector     // 441-454 subsector
  storeCount?: number            // Number of retail locations
  salesChannel?: SalesChannel[]  // Physical, online, catalog, etc.
  merchandiseCategory?: string[] // Product categories carried
  targetMarket?: string          // Consumer segment served
}

type RetailSubsector =
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

type SalesChannel =
  | 'Physical'      // Traditional storefront
  | 'Online'        // E-commerce website
  | 'Mobile'        // Mobile app
  | 'Catalog'       // Mail order catalog
  | 'DirectSales'   // In-home or party sales
  | 'Vending'       // Vending machines
  | 'Marketplace'   // Third-party platform (Amazon, eBay, etc.)
```

## Cross-References

### Related Domains
- [naics.org.ai](https://naics.org.ai) - NAICS 44-45 official classifications
- [industries.org.ai](https://industries.org.ai) - Parent industry taxonomy
- [business.org.ai](https://business.org.ai) - Business entity information
- [products.org.ai](https://products.org.ai) - Product catalogs and merchandise
- [brands.org.ai](https://brands.org.ai) - Retail brands and private labels
- [ecommerce.org.ai](https://ecommerce.org.ai) - Online retail operations
- [logistics.org.ai](https://logistics.org.ai) - Supply chain and distribution
- [marketing.org.ai](https://marketing.org.ai) - Retail marketing strategies

### Complementary Sectors
- [wholesale.org.ai](https://wholesale.org.ai) - NAICS 42: Wholesale Trade
- [manufacturing.org.ai](https://manufacturing.org.ai) - NAICS 31-33: Manufacturing
- [transportation.org.ai](https://transportation.org.ai) - NAICS 48-49: Transportation
- [warehousing.org.ai](https://warehousing.org.ai) - Distribution centers

## Structure

```
retail.org.ai/
├── README.md                        # This file
├── package.json                     # NPM package config
├── index.ts                         # Type & const exports
├── types.ts                         # TypeScript definitions
├── [Retail].mdx                     # Type template
│
├── MotorVehicleDealers.mdx         # NAICS 441
├── FurnitureStores.mdx             # NAICS 442
├── ElectronicsAppliances.mdx       # NAICS 443
├── BuildingMaterials.mdx           # NAICS 444
├── FoodBeverageStores.mdx          # NAICS 445
├── HealthPersonalCare.mdx          # NAICS 446
├── GasolineStations.mdx            # NAICS 447
├── ClothingStores.mdx              # NAICS 448
├── SportingGoodsHobby.mdx          # NAICS 451
├── GeneralMerchandise.mdx          # NAICS 452
├── MiscellaneousRetailers.mdx      # NAICS 453
└── NonstoreRetailers.mdx           # NAICS 454
```

## Usage

### Import as NPM Package

```typescript
import { Retail, things } from 'retail.org.ai'
```

### Use in MDX

```mdx
---
$type: https://retail.org.ai/Retail
name: Example
---

# Example Retail
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---
$id: https://gs1.org.ai
$context: https://gs1.org.ai
name: gs1.org.ai
parent: standards.org.ai
source: GS1
license: CC-BY-SA-4.0
---

# gs1.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
[![GS1](https://img.shields.io/badge/Source-GS1-orange)](https://www.gs1.org/)

Global standards for product identification, location identification, and supply chain visibility.

## Overview

GS1 is the global organization that develops and maintains standards for business communication. Key standards include:

- **Identification** - Unique identifiers for products, locations, assets, shipments
- **Data Capture** - Barcodes, QR codes, RFID, Digital Link
- **Data Sharing** - EPCIS, GDSN, EDI
- **Classification** - GPC product taxonomy

**Parents**: [graph.org.ai](https://graph.org.ai) > [standards.org.ai](https://standards.org.ai)

## Structure

```
gs1.org.ai/
├── README.md
├── package.json
├── index.ts
├── types.ts
│
├── Identifiers/           # GS1 identification keys
│   ├── GTIN/             # Global Trade Item Number (products)
│   │   └── [GTIN].mdx
│   ├── GLN/              # Global Location Number (locations)
│   │   └── [GLN].mdx
│   ├── SSCC/             # Serial Shipping Container Code
│   │   └── [SSCC].mdx
│   ├── GIAI/             # Global Individual Asset Identifier
│   │   └── [GIAI].mdx
│   ├── GRAI/             # Global Returnable Asset Identifier
│   │   └── [GRAI].mdx
│   ├── GSRN/             # Global Service Relation Number
│   │   └── [GSRN].mdx
│   ├── GDTI/             # Global Document Type Identifier
│   │   └── [GDTI].mdx
│   └── README.md
│
├── DigitalLink/           # GS1 Digital Link (web URIs)
│   ├── [DigitalLink].mdx
│   └── README.md
│
├── EPCIS/                 # Electronic Product Code Information Services
│   ├── Events/           # Supply chain events
│   │   ├── [ObjectEvent].mdx
│   │   ├── [AggregationEvent].mdx
│   │   ├── [TransactionEvent].mdx
│   │   └── [TransformationEvent].mdx
│   ├── BusinessSteps/    # What business step occurred
│   │   └── [BusinessStep].mdx
│   ├── Dispositions/     # State of objects after event
│   │   └── [Disposition].mdx
│   └── README.md
│
├── GPC/                   # Global Product Classification
│   ├── Segments/         # Top level (99 segments)
│   │   └── [Segment].mdx
│   ├── Families/         # 2nd level
│   │   └── [Family].mdx
│   ├── Classes/          # 3rd level
│   │   └── [Class].mdx
│   ├── Bricks/           # Most granular (44,000+ bricks)
│   │   └── [Brick].mdx
│   └── README.md
│
├── DataCarriers/          # Barcodes, QR codes, RFID
│   ├── EAN13/
│   ├── UPC/
│   ├── QRCode/
│   ├── DataMatrix/
│   └── README.md
│
└── GDSN/                  # Global Data Synchronization Network
    ├── [TradeItem].mdx
    └── README.md
```

## GS1 Identification Keys

| Key | Name | Use Case | Example |
|-----|------|----------|---------|
| GTIN | Global Trade Item Number | Products | 00614141007349 |
| GLN | Global Location Number | Locations | 0614141000005 |
| SSCC | Serial Shipping Container Code | Shipments | 106141410000001239 |
| GIAI | Global Individual Asset Identifier | Assets | 0614141000001 |
| GRAI | Global Returnable Asset Identifier | Returnable assets | 00614141000015 |
| GSRN | Global Service Relation Number | Services | 0614141000022 |
| GDTI | Global Document Type Identifier | Documents | 0614141000039 |
| GCN | Global Coupon Number | Coupons | 0614141000046 |
| GMN | Global Model Number | Product models | 0614141ABC123 |

## GS1 Digital Link

URI syntax for linking physical products to digital information:

```
https://id.gs1.org/01/00614141007349
                  │  └── GTIN
                  └── Application Identifier (01 = GTIN)
```

### Application Identifiers

| AI | Name | Description |
|----|------|-------------|
| 01 | GTIN | Global Trade Item Number |
| 10 | Batch/Lot | Batch or lot number |
| 11 | Production Date | Date of production |
| 13 | Packaging Date | Date of packaging |
| 15 | Best Before | Best before date |
| 17 | Expiration Date | Use by date |
| 21 | Serial Number | Serial number |
| 414 | GLN | Location identifier |
| 8008 | Date/Time | Production date and time |

## EPCIS Event Model

### Event Types

| Type | Description |
|------|-------------|
| ObjectEvent | Physical or digital objects observed |
| AggregationEvent | Objects added/removed from containers |
| TransactionEvent | Objects associated with business transactions |
| TransformationEvent | Objects transformed (ingredients → product) |

### The "5W+H" of EPCIS

| Dimension | Question | EPCIS Element |
|-----------|----------|---------------|
| What | What objects? | `epcList`, `quantityList` |
| When | When did it happen? | `eventTime`, `recordTime` |
| Where | Where did it happen? | `readPoint`, `bizLocation` |
| Why | What business process? | `bizStep`, `disposition` |
| Who | Who was involved? | `sourceList`, `destinationList` |
| How | How was it captured? | `sensorElementList` |

## Global Product Classification (GPC)

Hierarchical product taxonomy:

```
Segment (99)
└── Family (~600)
    └── Class (~4,200)
        └── Brick (~44,000)
            └── Attribute Values
```

Example hierarchy:
```
10000000 - Food/Beverage/Tobacco
└── 10000100 - Milk/Butter/Cream/Yogurt
    └── 10000101 - Butter
        └── 10000201 - Butter (Salted)
```

## Usage

```typescript
import {
  identifiers,
  digitalLink,
  epcis,
  gpc
} from 'gs1.org.ai'

// Parse a GTIN
const product = await identifiers.gtin.get('00614141007349')

// Generate Digital Link
const link = digitalLink.create({
  gtin: '00614141007349',
  lot: 'ABC123',
  serial: '12345'
})
// => https://id.gs1.org/01/00614141007349/10/ABC123/21/12345

// Create EPCIS event
const event = epcis.createObjectEvent({
  eventTime: new Date(),
  bizStep: 'shipping',
  epcList: ['urn:epc:id:sgtin:0614141.007349.1234']
})

// Look up GPC classification
const brick = await gpc.bricks.get('10000201')
```

## Cross-References

| System | Mapping |
|--------|---------|
| [products.org.ai](https://products.org.ai) | Simplified product access |
| [places.org.ai](https://places.org.ai) | Simplified location access |
| [events.org.ai](https://events.org.ai) | Event model based on EPCIS |
| [naics.org.ai](https://naics.org.ai) | Industry classification crosswalk |

## Sources

- [GS1 Standards](https://www.gs1.org/standards)
- [GS1 Digital Link](https://www.gs1.org/standards/gs1-digital-link)
- [EPCIS Standard](https://www.gs1.org/standards/epcis)
- [GPC Browser](https://gpc-browser.gs1.org/)

## License

This ontology is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

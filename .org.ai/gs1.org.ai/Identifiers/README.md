---
$id: https://gs1.org.ai/Identifiers
$context: https://gs1.org.ai
name: GS1 Identification Keys
---

# GS1 Identification Keys

Globally unique identifiers for products, locations, assets, and more.

## Overview

GS1 provides identification keys that uniquely identify physical and digital objects across the supply chain. Each key type serves a specific purpose.

## Identification Keys

| Key | Name | Use Case | Digits | Example |
|-----|------|----------|--------|---------|
| [GTIN](./GTIN/) | Global Trade Item Number | Products | 8/12/13/14 | 00614141007349 |
| [GLN](./GLN/) | Global Location Number | Locations | 13 | 0614141000005 |
| [SSCC](./SSCC/) | Serial Shipping Container Code | Shipments | 18 | 106141410000001239 |
| [GIAI](./GIAI/) | Global Individual Asset Identifier | Assets | Variable | 0614141000001 |
| [GRAI](./GRAI/) | Global Returnable Asset Identifier | Returnable assets | Variable | 00614141000015 |
| [GSRN](./GSRN/) | Global Service Relation Number | Services | 18 | 0614141000000000022 |
| [GDTI](./GDTI/) | Global Document Type Identifier | Documents | Variable | 0614141000000000039 |
| [GCN](./GCN/) | Global Coupon Number | Coupons | 13+ | 06141410000461 |
| [GMN](./GMN/) | Global Model Number | Product models | Variable | 0614141ABC123 |

## Key Structure

### Company Prefix

All GS1 keys begin with a GS1 Company Prefix:
- Assigned by GS1 Member Organization
- Identifies the company
- Variable length (6-12 digits)

### Check Digit

Most keys include a check digit (last digit):
- Calculated using Modulo 10 algorithm
- Validates the key is correct

## Example: GTIN Structure

```
GTIN-14: 1 0614141 00734 9
         │ │       │     │
         │ │       │     └── Check digit
         │ │       └── Item reference
         │ └── GS1 Company Prefix
         └── Indicator digit (packaging level)
```

## Usage

```typescript
import { identifiers } from 'gs1.org.ai'

// Validate a GTIN
const isValid = identifiers.gtin.validate('00614141007349')

// Get company prefix
const prefix = identifiers.gtin.getCompanyPrefix('00614141007349')
// => '0614141'

// Generate check digit
const checkDigit = identifiers.gtin.calculateCheckDigit('0061414100734')
// => 9
```

## Cross-References

| System | Mapping |
|--------|---------|
| [products.org.ai](https://products.org.ai) | Simplified product access |
| [places.org.ai](https://places.org.ai) | Simplified location access |
| [barcodes.org.ai](https://barcodes.org.ai) | Barcode encoding |

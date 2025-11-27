---
$id: https://gs1.org.ai/Identifiers/GTIN
$context: https://gs1.org.ai
name: Global Trade Item Number (GTIN)
---

# GTIN - Global Trade Item Number

The GS1 identification key for products and services.

## Overview

GTINs identify trade items including products, services, and anything that can be priced, ordered, or invoiced.

## GTIN Formats

| Format | Digits | Use Case | Example |
|--------|--------|----------|---------|
| GTIN-8 | 8 | Small items | 01234565 |
| GTIN-12 (UPC-A) | 12 | North America | 012345678905 |
| GTIN-13 (EAN-13) | 13 | Global | 0012345678905 |
| GTIN-14 | 14 | Cases, pallets | 10012345678902 |

## Structure

### GTIN-13 Structure

```
6 14141 00001 2
│ │     │     │
│ │     │     └── Check digit (calculated)
│ │     └── Item reference (assigned by brand owner)
│ └── GS1 Company Prefix (assigned by GS1)
└── GS1 Prefix (country/region indicator)
```

### GTIN-14 Structure

```
1 06141410000 1 2
│ │           │ │
│ │           │ └── Check digit
│ │           └── Item reference
│ └── GS1 Company Prefix
└── Indicator digit (packaging level)
```

**Indicator Digits:**
- 0: Not specified
- 1-8: Packaging level (1=base, 2=inner pack, etc.)
- 9: Variable measure item

## Application Identifiers

| AI | Name | Description |
|----|------|-------------|
| 01 | GTIN | The GTIN itself |
| 10 | Batch/Lot | Batch or lot number |
| 21 | Serial | Serial number |
| 17 | Expiration | Use by date (YYMMDD) |
| 11 | Production Date | Production date (YYMMDD) |

## Examples

### Consumer Product
```
GTIN: 00614141007349
Company Prefix: 0614141
Item Reference: 00734
Check Digit: 9
```

### Case Pack (GTIN-14)
```
GTIN-14: 10614141007346
Indicator: 1 (first packaging level)
Base GTIN-13: 0614141007349
```

## Digital Link URI

```
https://id.gs1.org/01/00614141007349
https://id.gs1.org/01/00614141007349/10/ABC123/21/12345
                  │   │              │  │      │  │
                  │   └── GTIN       │  └─Lot  │  └─Serial
                  └── AI 01                    └── AI 21
```

## Usage

```typescript
import { gtin } from 'gs1.org.ai'

// Parse a GTIN
const product = gtin.parse('00614141007349')
// => { companyPrefix: '0614141', itemReference: '00734', checkDigit: '9' }

// Validate
const isValid = gtin.validate('00614141007349')
// => true

// Convert formats
const gtin14 = gtin.toGTIN14('0614141007349', 1)
// => '10614141007346'

// Generate Digital Link
const uri = gtin.toDigitalLink('00614141007349', {
  lot: 'ABC123',
  serial: '12345'
})
// => 'https://id.gs1.org/01/00614141007349/10/ABC123/21/12345'
```

## Cross-References

| System | Mapping |
|--------|---------|
| [products.org.ai](https://products.org.ai) | Simplified product access |
| [barcodes.org.ai](https://barcodes.org.ai) | UPC/EAN encoding |
| [gs1.org.ai/DigitalLink](../DigitalLink/) | Web URIs |

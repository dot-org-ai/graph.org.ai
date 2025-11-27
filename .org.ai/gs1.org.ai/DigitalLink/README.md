---
$id: https://gs1.org.ai/DigitalLink
$context: https://gs1.org.ai
name: GS1 Digital Link
version: "1.2"
---

# GS1 Digital Link

Web URIs that connect physical products to digital information.

## Overview

GS1 Digital Link transforms GS1 identifiers into web addresses, enabling:
- QR codes that link products to websites
- Product information lookups
- Track and trace via URLs
- Consumer engagement

## URI Structure

```
https://id.gs1.org/01/00614141007349/10/ABC123/21/12345
        └─ Resolver ─┘│  └─── GTIN ──┘│  └─Lot─┘│  └Serial─┘
                      └─ AI 01        └─ AI 10  └─ AI 21
```

## Application Identifiers in URLs

| AI | Path Segment | Description |
|----|--------------|-------------|
| 01 | /01/ | GTIN |
| 10 | /10/ | Batch/Lot |
| 21 | /21/ | Serial number |
| 17 | /17/ | Expiration date |
| 414 | /414/ | GLN |
| 00 | /00/ | SSCC |
| 8200 | /8200/ | Extended URL (product info) |

## Examples

### Basic Product Link
```
https://id.gs1.org/01/00614141007349
```
Links to product information page.

### Product with Lot and Serial
```
https://id.gs1.org/01/00614141007349/10/LOT123/21/SER456
```
Links to specific serialized item.

### Location
```
https://id.gs1.org/414/0614141000012
```
Links to location information.

### With Custom Domain
```
https://acme.com/01/00614141007349
```
Brand's resolver redirects to appropriate content.

## Link Types

### Primary Links
Resolve to the "canonical" resource for an identifier.

### Secondary Links
Additional information via link headers:
- Product information
- Instructions
- Certifications
- Recall information
- Sustainability data

### Qualifiers
Refine the identifier:

| Qualifier | Example | Purpose |
|-----------|---------|---------|
| Lot | /10/ABC123 | Batch-specific info |
| Serial | /21/12345 | Item-specific info |
| CPV | /22/VALUE | Consumer product variant |
| TPX | /235/EXT | Third party extensions |

## Resolver Behavior

```
Request: GET https://id.gs1.org/01/00614141007349
Accept: application/json

Response:
{
  "linkset": [
    {
      "anchor": "https://id.gs1.org/01/00614141007349",
      "itemOffered": "https://example.com/product/12345",
      "pip": "https://example.com/product/12345/info"
    }
  ]
}
```

## QR Code Generation

```typescript
import { digitalLink } from 'gs1.org.ai'

// Create Digital Link
const uri = digitalLink.create({
  gtin: '00614141007349',
  lot: 'ABC123',
  serial: '12345'
})

// Generate QR code
const qrCode = await digitalLink.toQR(uri)

// Verify conformance
const isValid = digitalLink.validate(uri)
```

## Conformance Levels

| Level | Description |
|-------|-------------|
| 0 | Syntactically valid URI |
| 1 | Valid identifier structure |
| 2 | Valid check digits |
| 3 | Registered resolver |
| 4 | Full semantics |

## Usage

```typescript
import { digitalLink } from 'gs1.org.ai'

// Parse a Digital Link
const parsed = digitalLink.parse('https://id.gs1.org/01/00614141007349/10/ABC')
// => { gtin: '00614141007349', lot: 'ABC' }

// Resolve link
const product = await digitalLink.resolve('https://id.gs1.org/01/00614141007349')

// Create from GS1 element string
const uri = digitalLink.fromElementString('(01)00614141007349(10)ABC')
// => 'https://id.gs1.org/01/00614141007349/10/ABC'

// Convert to element string
const elementString = digitalLink.toElementString('https://id.gs1.org/01/00614141007349/10/ABC')
// => '(01)00614141007349(10)ABC'
```

## Cross-References

| System | Mapping |
|--------|---------|
| [gs1.org.ai/Identifiers](../Identifiers/) | GS1 identification keys |
| [qr.org.ai](https://qr.org.ai) | QR code generation |
| [urls.org.ai](https://urls.org.ai) | URL management |

## Sources

- [GS1 Digital Link Standard](https://www.gs1.org/standards/gs1-digital-link)
- [Digital Link URI Syntax](https://www.gs1.org/standards/Digital-Link/1.2)

---
$id: https://gs1.org.ai/Identifiers/SSCC
$context: https://gs1.org.ai
name: Serial Shipping Container Code (SSCC)
---

# SSCC - Serial Shipping Container Code

The GS1 identification key for logistics units (shipments).

## Overview

The SSCC uniquely identifies individual logistics units (pallets, cases, containers) throughout the supply chain.

## Structure

```
SSCC: 1 0614141 000000001 2
      │ │       │         │
      │ │       │         └── Check digit
      │ │       └── Serial reference (9 digits)
      │ └── GS1 Company Prefix
      └── Extension digit (0-9)
```

18 digits total:
- Extension Digit (1 digit) - Increases capacity
- GS1 Company Prefix (6-12 digits)
- Serial Reference (5-11 digits)
- Check Digit (1 digit)

## Purpose

SSCCs enable:
- Tracking individual shipments
- Linking to ASN (Advance Ship Notice)
- Receiving and putaway
- Inventory management
- Chain of custody

## Application Identifiers

| AI | Name | Description |
|----|------|-------------|
| 00 | SSCC | The SSCC itself |

## EPCIS Integration

SSCCs are commonly used in EPCIS events:

```json
{
  "type": "ObjectEvent",
  "action": "OBSERVE",
  "epcList": ["urn:epc:id:sscc:0614141.1000000012"],
  "bizStep": "shipping",
  "disposition": "in_transit"
}
```

## Examples

### Pallet Shipment
```
SSCC: 106141410000000123
Extension: 1
Company Prefix: 0614141
Serial: 000000012
Check: 3
```

### Barcode (GS1-128)
```
(00)106141410000000123
```

### EPC URN
```
urn:epc:id:sscc:0614141.1000000012
```

## Digital Link URI

```
https://id.gs1.org/00/106141410000000123
                  │   │
                  │   └── SSCC
                  └── AI 00
```

## Usage

```typescript
import { sscc } from 'gs1.org.ai'

// Generate new SSCC
const newSSCC = sscc.generate('0614141', '000000012', 1)
// => '106141410000000123'

// Parse SSCC
const parsed = sscc.parse('106141410000000123')
// => { extension: '1', companyPrefix: '0614141', serial: '000000012' }

// Validate
const isValid = sscc.validate('106141410000000123')
// => true

// Create EPC URN
const urn = sscc.toEPC('106141410000000123')
// => 'urn:epc:id:sscc:0614141.1000000012'

// Track shipment
const events = await epcis.query({
  epcList: ['urn:epc:id:sscc:0614141.1000000012']
})
```

## Best Practices

1. **Serial Number Management**: Use sequential or random assignment
2. **Never Reuse**: SSCCs should never be reused
3. **Label Placement**: Apply GS1-128 barcode to two adjacent sides
4. **EDI Integration**: Include SSCC in ASN (856) transactions

## Cross-References

| System | Mapping |
|--------|---------|
| [shipments.org.ai](https://shipments.org.ai) | Simplified shipment access |
| [gs1.org.ai/EPCIS](../EPCIS/) | Supply chain events |
| [logistics.org.ai](https://logistics.org.ai) | Logistics operations |

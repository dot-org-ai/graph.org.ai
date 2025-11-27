---
$id: https://gs1.org.ai/Identifiers/GLN
$context: https://gs1.org.ai
name: Global Location Number (GLN)
---

# GLN - Global Location Number

The GS1 identification key for locations.

## Overview

GLNs uniquely identify any type of location or party:
- Physical locations (warehouses, stores, offices)
- Legal entities (companies, organizations)
- Functional entities (departments, roles)
- Digital locations (websites, apps)

## Structure

```
GLN: 0614141000005
     │       │   │
     │       │   └── Check digit
     │       └── Location reference
     └── GS1 Company Prefix
```

13 digits total:
- GS1 Company Prefix (6-12 digits)
- Location Reference (1-7 digits)
- Check Digit (1 digit)

## GLN Types

| Type | Description | Example |
|------|-------------|---------|
| Physical | Building, warehouse, dock door | Distribution center |
| Legal Entity | Registered company | Acme Corporation |
| Functional | Department or role | Accounts Payable dept |
| Digital | Website or application | E-commerce platform |

## GLN Extension Component

For more granular identification:

```
GLN: 0614141000005
Extension: 1234

Combined URI: urn:epc:id:sgln:0614141.00000.1234
```

Used for:
- Specific dock doors
- Individual shelf locations
- Room numbers

## Application Identifiers

| AI | Name | Description |
|----|------|-------------|
| 410 | Ship To GLN | Deliver to location |
| 411 | Bill To GLN | Invoice to party |
| 412 | Purchase From GLN | Order from party |
| 413 | Ship For GLN | Ship for (ultimate consignee) |
| 414 | Physical Location GLN | Where item is physically located |
| 415 | Pay To GLN | Payment to party |
| 417 | Party GLN | Involved party |
| 254 | GLN Extension | Sub-location identifier |

## Examples

### Physical Location
```
GLN: 0614141000012
Type: Distribution Center
Address: 123 Warehouse Blvd
Extension: 5 (Dock Door 5)
```

### Legal Entity
```
GLN: 0614141000005
Type: Headquarters
Name: Acme Corporation
DUNS: 123456789
```

## Digital Link URI

```
https://id.gs1.org/414/0614141000012
https://id.gs1.org/414/0614141000012/254/5
                   │   │              │   │
                   │   └── GLN        │   └── Extension
                   └── AI 414         └── AI 254
```

## Usage

```typescript
import { gln } from 'gs1.org.ai'

// Parse a GLN
const location = gln.parse('0614141000005')
// => { companyPrefix: '0614141', locationRef: '00000', checkDigit: '5' }

// Validate
const isValid = gln.validate('0614141000005')
// => true

// Create SGLN URN
const urn = gln.toSGLN('0614141000005', '1234')
// => 'urn:epc:id:sgln:0614141.00000.1234'
```

## Cross-References

| System | Mapping |
|--------|---------|
| [places.org.ai](https://places.org.ai) | Simplified location access |
| [addresses.org.ai](https://addresses.org.ai) | Physical addresses |
| [organizations.org.ai](https://organizations.org.ai) | Legal entities |

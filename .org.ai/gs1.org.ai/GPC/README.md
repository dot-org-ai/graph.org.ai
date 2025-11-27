---
$id: https://gs1.org.ai/GPC
$context: https://gs1.org.ai
name: Global Product Classification (GPC)
version: "May 2024"
---

# GPC - Global Product Classification

The GS1 standard for classifying products.

## Overview

GPC provides a standard way to classify products across the supply chain. It enables trading partners to group products in the same way, facilitating:
- Product data synchronization (GDSN)
- Analytics and reporting
- Category management
- E-commerce taxonomies

## Hierarchy

```
Segment (XX0000XX)           # 39 segments
└── Family (XX00XXXX)        # ~600 families
    └── Class (XXXXXXXX)     # ~4,200 classes
        └── Brick (XXXXXXXX) # ~44,000 bricks
            └── Attribute Values
```

## Segments

| Code | Segment |
|------|---------|
| 10000000 | Food/Beverage/Tobacco |
| 14000000 | Healthcare |
| 20000000 | Safety/Protection - DIY |
| 21000000 | Computing |
| 22000000 | Electrical Supplies |
| 24000000 | Stationery/Office Machinery/Occasions |
| 25000000 | Toys/Games |
| 40000000 | Cross-Segment |
| 41000000 | Footwear |
| 42000000 | Tools/Equipment - Hand |
| 44000000 | Cross-Segment - Mapping Bricks |
| 46000000 | Building Products |
| 47000000 | Pet Care/Food |
| 48000000 | Lawn/Garden Supplies |
| 50000000 | Home Appliances |
| 51000000 | Music |
| 52000000 | Automotive |
| 53000000 | Textiles |
| 54000000 | Live Animals |
| 55000000 | Arts/Crafts/Needlework |
| 56000000 | Baby Care |
| 57000000 | Beauty/Personal Care/Hygiene |
| 58000000 | Kitchen Merchandise |
| 59000000 | Live Plants/Flowers/Fertilizers |
| 60000000 | Sports Equipment/Supplies |
| 61000000 | Household/Office Furniture/Furnishings |
| 62000000 | Personal Accessories |
| 63000000 | Tools/Equipment - Power |
| 64000000 | Camping |
| 65000000 | Luggage |
| 66000000 | Publications |
| 67000000 | Audio Visual/Photography |
| 68000000 | Communications |
| 69000000 | Cleaning/Hygiene Products |
| 70000000 | Veterinary Healthcare |
| 71000000 | Clothing |
| 72000000 | Household Cleaning Products |
| 73000000 | Musical Instruments |
| 94000000 | Services |

## Example: Food Classification

```
10000000 - Food/Beverage/Tobacco (Segment)
└── 10000100 - Milk/Butter/Cream/Yogurt (Family)
    └── 10000101 - Butter (Class)
        └── 10000201 - Butter (Salted) (Brick)
            ├── If Organic: Yes/No
            ├── If From Concentrate: Yes/No
            └── Fat Content: <X%, X-Y%, >Y%
```

## Brick Attributes

Bricks have associated attributes with value lists:

```typescript
{
  brick: '10000201',
  name: 'Butter (Salted)',
  attributes: [
    {
      code: '20000001',
      name: 'If Organic',
      values: ['Yes', 'No', 'Unclassified']
    },
    {
      code: '20000002',
      name: 'Fat Content',
      values: ['Less than 40%', '40-80%', 'Greater than 80%']
    }
  ]
}
```

## Usage

```typescript
import { gpc } from 'gs1.org.ai'

// Get segment
const food = await gpc.segments.get('10000000')

// Get families in segment
const families = await gpc.families.filter(f =>
  f.segment === '10000000'
)

// Get brick with attributes
const butter = await gpc.bricks.get('10000201')
console.log(butter.attributes)

// Search by name
const results = await gpc.bricks.search('butter')

// Get hierarchy path
const path = await gpc.getPath('10000201')
// => ['Food/Beverage/Tobacco', 'Milk/Butter/Cream/Yogurt', 'Butter', 'Butter (Salted)']
```

## Cross-References

| System | Mapping |
|--------|---------|
| [categories.org.ai](https://categories.org.ai) | Simplified categories |
| [products.org.ai](https://products.org.ai) | Product ontology |
| [unspsc.org.ai](https://unspsc.org.ai) | UNSPSC crosswalk |

## Sources

- [GPC Browser](https://gpc-browser.gs1.org/)
- [GS1 GPC Standard](https://www.gs1.org/standards/gpc)

---
$id: https://naics.org.ai/Sectors
$context: https://naics.org.ai
name: NAICS Sectors
count: 20
---

# NAICS Sectors

20 top-level sectors in the North American Industry Classification System.

## All Sectors

| Code | Sector | Subsectors |
|------|--------|------------|
| [11](./11/) | Agriculture, Forestry, Fishing and Hunting | 5 |
| [21](./21/) | Mining, Quarrying, and Oil and Gas Extraction | 3 |
| [22](./22/) | Utilities | 1 |
| [23](./23/) | Construction | 3 |
| [31-33](./31-33/) | Manufacturing | 21 |
| [42](./42/) | Wholesale Trade | 2 |
| [44-45](./44-45/) | Retail Trade | 12 |
| [48-49](./48-49/) | Transportation and Warehousing | 11 |
| [51](./51/) | Information | 6 |
| [52](./52/) | Finance and Insurance | 5 |
| [53](./53/) | Real Estate and Rental and Leasing | 2 |
| [54](./54/) | Professional, Scientific, and Technical Services | 1 |
| [55](./55/) | Management of Companies and Enterprises | 1 |
| [56](./56/) | Administrative and Support and Waste Management | 2 |
| [61](./61/) | Educational Services | 1 |
| [62](./62/) | Health Care and Social Assistance | 4 |
| [71](./71/) | Arts, Entertainment, and Recreation | 3 |
| [72](./72/) | Accommodation and Food Services | 2 |
| [81](./81/) | Other Services (except Public Administration) | 4 |
| [92](./92/) | Public Administration | 8 |

## Sector Groups

### Goods-Producing (11-33)
- 11: Agriculture, Forestry, Fishing and Hunting
- 21: Mining, Quarrying, and Oil and Gas Extraction
- 22: Utilities
- 23: Construction
- 31-33: Manufacturing

### Trade, Transportation, and Utilities (42-49)
- 42: Wholesale Trade
- 44-45: Retail Trade
- 48-49: Transportation and Warehousing

### Information (51)
- 51: Information

### Financial Activities (52-53)
- 52: Finance and Insurance
- 53: Real Estate and Rental and Leasing

### Professional and Business Services (54-56)
- 54: Professional, Scientific, and Technical Services
- 55: Management of Companies and Enterprises
- 56: Administrative and Support Services

### Education and Health Services (61-62)
- 61: Educational Services
- 62: Health Care and Social Assistance

### Leisure and Hospitality (71-72)
- 71: Arts, Entertainment, and Recreation
- 72: Accommodation and Food Services

### Other Services (81)
- 81: Other Services (except Public Administration)

### Government (92)
- 92: Public Administration

## Usage

```typescript
import { sectors } from 'naics.org.ai'

// Get all sectors
const all = await sectors

// Get goods-producing sectors
const goodsProducing = await sectors.filter(s =>
  ['11', '21', '22', '23', '31', '32', '33'].some(code =>
    s.code.startsWith(code)
  )
)
```

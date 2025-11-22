# Hierarchical Sidebar Implementation

## Overview

Implemented hierarchical navigation in the sidebar that reflects the natural structure of each data domain.

## Domain-Specific Hierarchies

### UNSPSC (Product/Service Codes)
**4-level hierarchy based on code structure:**

```
Segment (XX000000)
└── Family (XXXX0000)
    └── Class (XXXXXX00)
        └── Commodity (XXXXXXXX)
```

**Example:**
```
10000000 - Live Plant and Animal Material
└── 10100000 - Live animals
    └── 10101500 - Livestock
        ├── 10101501 - Cats
        └── 10101502 - Dogs
```

### O*NET (Occupational Data)
**Type-based grouping:**

```
Occupation (1,016 items)
├── Chief Executives
├── General Managers
└── ...

Task (17,951 items)
├── Task 1
├── Task 2
└── ... and more

Skill (35 items)
└── Active Listening
```

- Groups by type (Occupation, Task, Skill, etc.)
- Sorts alphabetically within each group
- Limits to 100 items per type with "...more" link
- Links to `/types/{type}` for full listings

### APQC (Business Processes)
**Flat list with alphabetical sorting:**

- All processes listed alphabetically
- Limited to 100 items with "...more" link
- Can be enhanced with numeric hierarchy (1.0 → 1.1 → 1.1.1) in future

### Other Domains
**Generic flat hierarchy:**
- schema.org: Properties and Types
- model: LLMs
- Falls back to alphabetical listing

## Implementation

### Files Created

1. **`lib/hierarchy.ts`** - Hierarchy builder functions
   - `buildUNSPSCHierarchy()` - 4-level code-based hierarchy
   - `buildONETHierarchy()` - Type-based grouping
   - `buildAPQCHierarchy()` - Flat alphabetical
   - `buildFlatHierarchy()` - Generic fallback

2. **`tests/unit/hierarchy.test.ts`** - Unit tests
   - Tests UNSPSC 4-level nesting
   - Tests O*NET type grouping
   - Tests item limiting and "more" links
   - All 5 tests passing ✓

### Files Modified

1. **`app/docs/layout.tsx`**
   - Re-enabled domain tabs (were temporarily disabled)
   - Switched from flat type folders to hierarchical structure
   - Uses `getPageMetadata()` for efficient loading
   - Calls appropriate hierarchy builder per domain

## Technical Details

### Performance Optimizations

1. **Lightweight Queries**
   - Uses `getPageMetadata()` instead of full page loads
   - Only fetches `url`, `title`, `type` fields
   - Significantly faster for large datasets

2. **Item Limiting**
   - Max 100 items per folder
   - Adds "... and X more" link to full type page
   - Prevents sidebar from becoming unwieldy

3. **Lazy Loading**
   - Hierarchy built on-demand per domain
   - Fumadocs handles folder expand/collapse
   - No need to load all data upfront

### Data Structure

**Input (PageMetadata):**
```typescript
{
  url: string,      // e.g., "/docs/unspsc.org.ai/10101501"
  title: string,    // e.g., "10101501" (the code/ID)
  type: string      // e.g., "Commodity"
}
```

**Output (PageTree.Node):**
```typescript
{
  type: 'folder',
  name: '10000000',
  index: { type: 'page', name: '10000000', url: '...' },
  children: [ /* nested folders/pages */ ]
}
```

## Usage

The sidebar now automatically shows:

1. **Documentation** tab - MDX docs
2. **apqc** tab - APQC processes (flat)
3. **model** tab - LLMs (flat)
4. **onet** tab - O*NET data (grouped by type)
5. **schema.org** tab - Schema.org types (flat)
6. **unspsc** tab - UNSPSC codes (4-level hierarchy)

## Testing

```bash
# Run hierarchy tests
pnpm test:unit tests/unit/hierarchy.test.ts

# All tests
pnpm test:unit
```

## Future Enhancements

1. **APQC Hierarchy** - Parse process codes (1.0, 1.1.1) into hierarchy
2. **Search within hierarchy** - Fuzzy search to find items
3. **Breadcrumbs** - Show current position in hierarchy
4. **Expand/Collapse All** - Control all folders at once
5. **Recently Viewed** - Quick access to recent items

## Example URLs

- Segment: `/docs/unspsc.org.ai/Segment/10000000`
- Family: `/docs/unspsc.org.ai/Family/10100000`
- Class: `/docs/unspsc.org.ai/Class/10101500`
- Commodity: `/docs/unspsc.org.ai/Commodity/10101501`
- Type listing: `/types/Occupation`

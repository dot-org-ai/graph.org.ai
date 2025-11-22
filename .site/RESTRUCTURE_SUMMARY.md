# Site Restructure Summary

## Overview

Restructured the entire site to use DocsLayout at the root level with domain-based hierarchical navigation in the sidebar.

## Changes Made

### 1. Removed `/docs` Route Group
- **Deleted**: `app/docs/` directory (layout and pages)
- **Reason**: The entire site should be within DocsLayout, not just a `/docs` section

### 2. Moved DocsLayout to Root
- **File**: `app/layout.tsx`
- **Changes**:
  - Added DocsLayout wrapper at root level
  - Loads all domains from ClickHouse
  - Creates hierarchical sidebar for each domain
  - Builds domain-specific page trees

### 3. Created Catch-All Route
- **File**: `app/[[...slug]]/page.tsx`
- **Handles**:
  - Homepage (slug is empty): Shows type cards
  - Domain pages: `/onet/Occupation/11-1011.00`
  - Type pages already exist at `/types/{type}`

### 4. Updated URL Structure

**Before:**
```
/ (homepage)
/docs (docs root)
/docs/{domain}.org.ai/{type}/{id}
/types/{type}
```

**After:**
```
/ (homepage with DocsLayout)
/{domain}/{type}/{id}
/types/{type}
```

### 5. Sidebar Configuration

**Tabs:**
1. **`.org.ai`** (first tab) - Links to `/` homepage
2. **`apqc`** - APQC processes (flat list)
3. **`model`** - LLMs (flat list)
4. **`onet`** - O*NET data (grouped by type)
5. **`schema.org`** - Schema.org types (flat list)
6. **`unspsc`** - UNSPSC codes (4-level hierarchy)

**Hierarchy Structures:**
- **UNSPSC**: Segment → Family → Class → Commodity
- **O*NET**: Grouped by type (Occupation, Task, Skill, etc.)
- **Others**: Flat alphabetical lists

### 6. Navigation Updates

**`lib/layout.shared.tsx`:**
- Changed nav title from "My App" to ".org.ai"
- Links to `/` (homepage)
- Removed separate "Documentation" link (all in DocsLayout now)

**`lib/source.ts`:**
- Updated `getPage()` to handle domain routing without `/docs` prefix
- Updated `getPageMetadata()` to fix URLs (remove `/docs/` prefix)

**`next.config.mjs`:**
- Removed URL rewrites (no longer needed)

## File Structure

```
app/
├── layout.tsx (DocsLayout at root)
├── [[...slug]]/
│   └── page.tsx (handles homepage + domain pages)
├── types/
│   └── [type]/
│       └── page.tsx (type listing pages)
└── api/
    └── search/
        └── route.ts
```

## URLs & Routing

| URL | Description |
|-----|-------------|
| `/` | Homepage with type cards |
| `/{domain}` | Domain root (e.g., `/onet`) |
| `/{domain}/{type}/{id}` | Thing page (e.g., `/onet/Occupation/11-1011.00`) |
| `/types/{type}` | Type listing (e.g., `/types/Occupation`) |

## Page Titles

- **Homepage** (at `/`): Shows "graph.org.ai" with type cards
- **Nav bar**: Always shows ".org.ai" linking to `/`
- **Sidebar tabs**:
  - `.org.ai` (first tab, links to `/`)
  - Domain names: `apqc`, `onet`, `unspsc`, etc.

## Benefits

1. **Unified Navigation**: Entire site uses consistent DocsLayout with sidebar
2. **Clean URLs**: No `/docs` prefix cluttering URLs
3. **Hierarchical Sidebar**: Each domain shows proper data hierarchy
4. **Better UX**: Users can easily navigate between domains via sidebar tabs
5. **Consistent Experience**: Same layout/navigation throughout the site

## Testing

Server running at: http://localhost:3000

**Test URLs:**
- `/` - Homepage
- `/onet` - O*NET domain root
- `/unspsc` - UNSPSC domain with hierarchy
- `/types/Occupation` - Type listing

**Sidebar:**
- Click `.org.ai` tab → Returns to homepage
- Click domain tabs → Shows domain hierarchy
- Expand folders → See nested items

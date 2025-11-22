# Sidebar Hierarchy Implementation

## Summary

Implemented dynamic hierarchical sidebar navigation that shows domain-specific content organization based on the current route.

## Changes Made

### 1. Fixed Domain-Only Routes (e.g., `/onet`)

**Problem**: Visiting `/onet` resulted in a 404 error.

**Solution**: Updated `app/[[...slug]]/page.tsx` to handle domain-only routes (slug length === 1):
- Validates the domain against available domains
- Displays a domain overview page showing all types in that domain
- Shows type cards with counts and sample items
- Provides navigation to type listing pages

**Files Modified**:
- `app/[[...slug]]/page.tsx`: Added domain-only route handler with metadata support

### 2. Sidebar Hierarchy Configuration

**How It Works**:

The sidebar uses Fumadocs' tabs feature. Each tab represents a domain and has its own `rootFolder` (page tree). Fumadocs automatically shows the appropriate tree based on the current URL by matching against each tab's `url` property.

**Tab Structure**:
```typescript
const allTabs = [
  {
    title: '.org.ai',      // First tab
    url: '/',              // Matches homepage
    rootFolder: rootTree,  // Simple tree with Home link
  },
  {
    title: 'apqc',
    url: '/apqc',
    rootFolder: apqcTree,  // Flat list of APQC processes
  },
  {
    title: 'onet',
    url: '/onet',
    rootFolder: onetTree,  // Hierarchical tree grouped by type
  },
  // ... more domains
];
```

**Tree Structures by Domain**:

1. **O*NET** (`buildONETHierarchy`):
   - Groups items by type (Occupation, Task, Ability, etc.)
   - Each type is a folder containing up to 100 items
   - Folder name shows count: "Ability (52)"
   - Includes link to full type listing page

2. **UNSPSC** (`buildUNSPSCHierarchy`):
   - 4-level hierarchy based on code structure
   - Segment (XX000000) → Family (XXXX0000) → Class (XXXXXX00) → Commodity (XXXXXXXX)
   - Each level is a folder containing child items

3. **APQC** (`buildAPQCHierarchy`):
   - Flat alphabetical list
   - Capped at 100 items with "more" link

4. **Others** (model, schema.org) (`buildFlatHierarchy`):
   - Simple flat alphabetical lists
   - Capped at 100 items

### 3. Automatic Tab Switching

Fumadocs handles tab activation automatically:
- When visiting `/` → `.org.ai` tab is active, shows root tree
- When visiting `/onet/...` → `onet` tab is active, shows O*NET hierarchy
- When visiting `/apqc/...` → `apqc` tab is active, shows APQC hierarchy
- etc.

No custom route detection logic needed - Fumadocs matches URLs to tab `url` properties.

## File Changes

### New Files
- `lib/hierarchy.ts`: Domain-specific tree builders

### Modified Files
- `app/layout.tsx`: Creates domain tabs with hierarchical trees
- `app/[[...slug]]/page.tsx`: Added domain-only route handler
- `lib/source.ts`: Already had necessary query functions

## Hierarchy Examples

### O*NET Sidebar (when viewing `/onet/...`)
```
📁 Ability (52)
  - All Abilitys → /types/Ability
  - 1.A.1.a.1 - Oral Comprehension
  - 1.A.1.a.2 - Written Comprehension
  - ... (up to 100 items)
📁 Occupation (1,016)
  - All Occupations → /types/Occupation
  - 11-1011.00 - Chief Executives
  - 11-1021.00 - General and Operations Managers
  - ... (up to 100 items)
📁 Task (19,484)
  - All Tasks → /types/Task
  - ...
... (12 type folders total)
```

### UNSPSC Sidebar (when viewing `/unspsc/...`)
```
📁 10000000 - Live Plant and Animal Material
  📁 10100000 - Live animals
    📁 10101500 - Livestock
      - 10101501 - Cattle
      - 10101502 - Goats
      - ...
    📁 10101600 - Pets
      - ...
  📁 10110000 - Live plants
    - ...
```

## Benefits

1. **Intuitive Navigation**: Users can explore hierarchical data structures naturally
2. **Performance**: Trees are built once during layout render, cached by React
3. **Scalability**: Large datasets limited to 100 items per folder with links to full listings
4. **Flexibility**: Different domains can have different tree structures
5. **User Experience**: Sidebar automatically shows relevant hierarchy for current context

## Testing

Server running at: http://localhost:3000

**Test URLs**:
- `/` - Homepage with type cards, `.org.ai` tab active
- `/onet` - O*NET domain page with type cards
- `/onet/Occupation/11-1011.00` - Specific occupation, sidebar shows O*NET hierarchy
- `/apqc` - APQC domain page
- `/apqc/Process/10002` - Specific process, sidebar shows APQC flat list
- `/types/Occupation` - Type listing page

**Expected Behavior**:
- Sidebar tabs switch automatically based on URL
- Clicking on a tab navigates to that domain's homepage
- Folders in sidebar can be expanded/collapsed
- Items in sidebar link to their detail pages

# Comprehensive Test Plan

## Test Categories

### 1. Unit Tests - Data Layer
**File: `tests/unit/clickhouse-queries.test.ts`**

- [ ] `getAllTypes()` - returns array, handles errors
- [ ] `getTypeCount(type)` - returns correct count, handles invalid type
- [ ] `getSampleThingsByType(type, limit)` - returns data, respects limit, filters correctly
- [ ] `getDomains()` - returns array, handles errors
- [ ] `getDomainTypes(domain)` - returns types for domain
- [ ] `getPage(domain, slug)` - returns thing, handles not found
- [ ] `getPages(domain)` - returns all pages for domain
- [ ] `getPageMetadata(domain, type)` - returns metadata only
- [ ] `getPageCount(domain, type)` - returns count

**File: `tests/unit/source.test.ts`**

- [ ] Combined source `getPage()` - tries MDX first, then DB
- [ ] Combined source `getPages()` - combines both sources
- [ ] Combined source URL handling - domain.org.ai format
- [ ] Helper functions - extractDescription, formatContent, generateTOC

### 2. Integration Tests - Page Rendering
**File: `tests/integration/pages.test.ts`**

- [ ] Homepage renders with data
- [ ] Homepage renders empty state
- [ ] Homepage card structure is correct
- [ ] Type page renders for valid type
- [ ] Type page shows correct count
- [ ] Type page shows items grouped by domain
- [ ] Type page 404s for invalid type
- [ ] Type page handles empty results
- [ ] Docs page renders for valid thing
- [ ] Docs page 404s for invalid thing

### 3. E2E Tests - User Flows
**File: `tests/e2e/homepage.e2e.spec.ts`**

- [ ] Homepage loads and displays
- [ ] Type cards display
- [ ] Click card heading navigates to type page
- [ ] Click example link navigates to thing page
- [ ] Click "View all" navigates to type page
- [ ] Back button works from type page

**File: `tests/e2e/type-page.e2e.spec.ts`**

- [ ] Type page loads for valid type
- [ ] Type page shows correct heading
- [ ] Type page shows count
- [ ] Type page groups items by domain
- [ ] Click item navigates to thing page
- [ ] Click domain heading navigates to domain page
- [ ] Type page 404s for invalid type
- [ ] Back to home link works

**File: `tests/e2e/navigation.e2e.spec.ts`**

- [ ] Full flow: Home → Type → Thing
- [ ] Full flow: Home → Type → Domain
- [ ] URL rewriting works correctly
- [ ] Browser back/forward works

### 4. Component Tests
**File: `tests/components/type-card.test.tsx`**

- [ ] Type card renders correctly
- [ ] Type card shows count
- [ ] Type card shows examples
- [ ] Type card is linkable
- [ ] Hover states work

### 5. API Tests
**File: `tests/api/search.test.ts`**

- [ ] Search endpoint returns results
- [ ] Search handles empty query
- [ ] Search filters by domain
- [ ] Search pagination works

## Critical Bugs to Catch

1. **Empty results when data exists** ✗
   - Type page shows count but no items
   - Likely: `getSampleThingsByType()` filtering too aggressively

2. **URL rewriting conflicts**
   - /types route being caught by domain rewrites

3. **Data fetching errors**
   - ClickHouse connection failures
   - Timeout handling

4. **Type mismatches**
   - Case sensitivity (Occupation vs occupation)
   - URL encoding issues

5. **Empty states**
   - No data in database
   - Invalid type/domain

6. **Pagination issues**
   - Showing wrong counts
   - Not respecting limits

## Test Execution Order

1. Unit tests (fast, no dependencies)
2. Integration tests (with test data)
3. E2E tests (full stack)
4. Performance tests (large datasets)

## Coverage Goals

- Unit tests: 90%+ code coverage
- Integration: All pages and routes
- E2E: All critical user flows
- Edge cases: Empty states, errors, invalid input

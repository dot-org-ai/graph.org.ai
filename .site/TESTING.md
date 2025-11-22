# Testing & Card Linking Fix Summary

## Overview

This document summarizes the work done to:
1. Review the data hierarchy
2. Fix the card linking issue on the homepage
3. Set up a comprehensive test suite

## Data Hierarchy

The application uses a three-level hierarchy:

```
Namespace (domain) → Type → Thing
```

- **Namespace/Domain**: e.g., `onet`, `apqc`, `bls`
- **Type**: e.g., `Occupation`, `Industry`, `Task`, `Verb`
- **Thing**: Individual items with `id`, `url`, `data`, `content`, etc.

### URL Structure

- Homepage: `/`
- Type listing: `/types/{type}` (e.g., `/types/Occupation`)
- Domain listing: `/docs/{domain}.org.ai` (e.g., `/docs/onet.org.ai`)
- Individual thing: `/{domain}/{path}` → rewrites to `/docs/{domain}.org.ai/{path}`

## Issues Fixed

### 1. Homepage Card Linking (page.tsx:78-106)

**Problem**: Type cards on the homepage were not clickable. Only the individual example links and "View all" link at the bottom were interactive.

**Solution**:
- Made the card heading (`<h3>`) clickable by wrapping it in a `<Link>` to `/types/{type}`
- Added hover effects to the card for better UX
- Kept example links functional as nested links
- Created new `/types/[type]/page.tsx` route to display all items of a type

### 2. URL Routing Configuration

**Problem**: The `/types` route was being caught by the domain rewrite rules in `next.config.mjs`.

**Solution**: Updated the rewrite exclusion pattern to include `types`:
```javascript
source: '/:domain((?!_next|api|docs|og|types)[a-z0-9-]+)/:path*'
```

## Test Suite Setup

### Configuration Files Created

1. **vitest.config.ts** - Unit test configuration
   - Uses jsdom environment for React testing
   - Resolves `@/` alias to site root
   - Excludes e2e tests

2. **vitest.setup.ts** - Test environment setup
   - Mocks Next.js modules (`next/headers`, `next/link`)
   - Auto-cleanup after each test
   - Global test utilities

3. **playwright.config.ts** - E2E test configuration
   - Tests across Chrome, Firefox, Safari
   - Auto-starts dev server
   - HTML reporter for CI/CD

### Test Files

#### Unit Tests (`tests/unit/source.test.ts`)

Tests for ClickHouse query functions:
- Data type validation (strings, arrays, objects)
- Count queries return numbers
- Sample queries respect limits
- TitleCase filtering works correctly
- Unique constraint validation
- Error handling for non-existent data

**12 tests** covering all major query functions.

#### E2E Tests (`tests/e2e/homepage.e2e.spec.ts`)

Tests for homepage user experience:
- ✅ Main heading displays
- ✅ Description displays
- ✅ Type cards render with correct structure
- ✅ Cards show item counts
- ✅ Example links work
- ✅ "View all" links work
- ✅ **CRITICAL: Card headings are clickable** (main fix)
- ✅ Documentation link works
- ✅ Empty state handled gracefully
- ✅ Priority types ordered correctly

**10 tests** covering the entire homepage flow.

### Package Updates

Added to `.site/package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "pnpm test:unit && pnpm test:e2e"
  },
  "devDependencies": {
    "@playwright/test": "^1.56.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@vitejs/plugin-react": "^5.1.1",
    "jsdom": "^27.2.0",
    "vitest": "^4.0.13"
  }
}
```

Updated `.mdxdb/package.json` to export `clickhouse-client`:
```json
{
  "exports": {
    "./schema": "./schema.ts",
    "./db": "./db.ts",
    "./clickhouse-queries": "./clickhouse-queries.ts",
    "./clickhouse-client": "./clickhouse-client.ts"
  }
}
```

## New Features

### Type Listing Page (`/types/[type]/page.tsx`)

A new dynamic route that displays all items of a specific type:
- Shows total count
- Groups by domain/namespace
- Displays up to 100 sample items
- Each item is clickable to its detail page
- Responsive grid layout

## Running Tests

```bash
# Unit tests (watch mode)
pnpm test

# Unit tests (single run)
pnpm test:unit

# E2E tests
pnpm test:e2e

# E2E tests (interactive UI)
pnpm test:e2e:ui

# All tests
pnpm test:all
```

## Benefits

1. **Better UX**: Cards are now fully clickable, making navigation more intuitive
2. **Test Coverage**: Both unit and e2e tests ensure functionality works correctly
3. **CI/CD Ready**: Tests can run in automated pipelines
4. **Regression Prevention**: Future changes won't break card linking
5. **Documentation**: Clear test examples for new contributors

## Architecture Diagram

```
Homepage (/)
  ├─ Type Cards (clickable)
  │   ├─ Card Heading → /types/{type}
  │   ├─ Examples → /{domain}/{path}
  │   └─ "View all" → /types/{type}
  │
Type Page (/types/{type})
  ├─ Shows all items of type
  ├─ Grouped by domain
  └─ Each item → /{domain}/{path}
    │
    ├─ Rewrites to → /docs/{domain}.org.ai/{path}
    └─ Individual Thing Page
```

## Next Steps

Consider adding:
- Integration tests for the type listing page
- Tests for search functionality
- Performance tests for large datasets
- Visual regression tests with Playwright
- API endpoint tests for `/api/search`

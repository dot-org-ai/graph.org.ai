# Test Suite

This directory contains the test suite for the graph.org.ai website.

## Structure

```
tests/
├── unit/          # Unit tests for individual functions and components
│   └── source.test.ts   # Tests for ClickHouse query functions
└── e2e/           # End-to-end tests with Playwright
    └── homepage.e2e.spec.ts  # Homepage functionality tests
```

## Running Tests

### Unit Tests (Vitest)

Unit tests validate individual functions and data queries:

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:unit
```

### End-to-End Tests (Playwright)

E2E tests validate user interactions and full page flows:

```bash
# Run e2e tests
pnpm test:e2e

# Run e2e tests in UI mode (interactive)
pnpm test:e2e:ui
```

### All Tests

```bash
pnpm test:all
```

## Test Coverage

### Unit Tests (`source.test.ts`)

Tests for ClickHouse query functions:
- `getAllTypes()` - Returns unique type names
- `getTypeCount(type)` - Returns count of items by type
- `getSampleThingsByType(type, limit)` - Returns sample items with TitleCase filtering
- `getDomains()` - Returns unique domain names
- `getPage(domain, slug)` - Retrieves a specific page/thing

### E2E Tests (`homepage.e2e.spec.ts`)

Tests for homepage functionality:
- Page structure (heading, description)
- Type cards display correctly
- Card linking works (clicking card heading navigates to type page)
- Example links within cards work
- "View all" links work
- Empty state handling
- Priority type ordering

## Key Fixes Applied

1. **Card Linking Issue**: Homepage cards now have clickable headings that navigate to `/types/{type}` pages
2. **Type Pages**: Created new dynamic route `/types/[type]/page.tsx` to display all items of a specific type
3. **URL Rewrite Configuration**: Updated `next.config.mjs` to exclude `/types` from domain rewrites

## Configuration Files

- `vitest.config.ts` - Vitest configuration for unit tests
- `vitest.setup.ts` - Test environment setup (mocks, globals)
- `playwright.config.ts` - Playwright configuration for e2e tests

## Writing New Tests

### Unit Tests

Create `.test.ts` files in `tests/unit/`:

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

### E2E Tests

Create `.e2e.spec.ts` files in `tests/e2e/`:

```typescript
import { test, expect } from '@playwright/test';

test('should display page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading')).toBeVisible();
});
```

## Notes

- Unit tests run against the actual ClickHouse database (if available)
- Tests gracefully handle database connection errors
- E2E tests start their own dev server automatically
- All tests validate the data hierarchy: namespace → type → thing

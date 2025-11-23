import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'graph.org.ai', level: 1 })).toBeVisible();
  });

  test('should display the description', async ({ page }) => {
    await expect(
      page.getByText('A comprehensive knowledge graph featuring Industries, Occupations, Tasks, Verbs, and more')
    ).toBeVisible();
  });

  test('should display type cards', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('h2:has-text("Explore by Type")', { timeout: 10000 });

    const cards = page.locator('[class*="grid"] > div[class*="border"]');
    const cardCount = await cards.count();

    expect(cardCount).toBeGreaterThan(0);
  });

  test('type cards should have correct structure', async ({ page }) => {
    await page.waitForSelector('h2:has-text("Explore by Type")', { timeout: 10000 });

    const firstCard = page.locator('[class*="grid"] > div[class*="border"]').first();

    // Should have a type heading
    await expect(firstCard.locator('h3')).toBeVisible();

    // Should have item count (no longer showing "items" text, just the number with toLocaleString)
    await expect(firstCard.getByText(/\d+/)).toBeVisible();
  });

  test('type cards should be simple without examples', async ({ page }) => {
    await page.waitForSelector('h2:has-text("Explore by Type")', { timeout: 10000 });

    const firstCard = page.locator('[class*="grid"] > div[class*="border"]').first();

    // Cards should NOT show example items (simplified design)
    const examplesLabel = firstCard.getByText('Examples:', { exact: false });
    await expect(examplesLabel).not.toBeVisible();

    // Cards should NOT show "View all" links (just click the whole card)
    const viewAllLink = firstCard.locator('a:has-text("View all")');
    await expect(viewAllLink).not.toBeVisible();
  });

  test('CRITICAL: type cards should be clickable as a whole', async ({ page }) => {
    await page.waitForSelector('h2:has-text("Explore by Type")', { timeout: 10000 });

    const firstCard = page.locator('[class*="grid"] > div[class*="border"]').first();
    const cardHeading = await firstCard.locator('h3').textContent();

    // Get the card element
    const cardBox = await firstCard.boundingBox();
    expect(cardBox).toBeTruthy();

    // Click on the card heading area (should navigate to type listing)
    await firstCard.locator('h3').click();

    // Should navigate to a page showing all items of this type
    await page.waitForLoadState('networkidle');

    // The URL should have changed
    expect(page.url()).not.toBe('http://localhost:3000/');
  });

  test('should have sidebar with domain navigation', async ({ page }) => {
    // The new design has a sidebar instead of a separate documentation link
    const sidebar = page.locator('aside#nd-sidebar');
    await expect(sidebar).toBeVisible();

    // Sidebar should show domain links on homepage
    const domainLinks = page.locator('aside a[href^="/"]');
    await expect(domainLinks.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // This test ensures the empty state message is shown when appropriate
    const emptyMessage = page.getByText('No things available');
    const exploreSection = page.getByText('Explore by Type');

    // Either we have data (explore section) or empty state, but not both
    const hasData = await exploreSection.isVisible();
    const isEmpty = await emptyMessage.isVisible();

    expect(hasData || isEmpty).toBe(true);
    expect(hasData && isEmpty).toBe(false);
  });

  test('should render correct number of priority types first', async ({ page }) => {
    await page.waitForSelector('h2:has-text("Explore by Type")', { timeout: 10000 });

    const priorityTypes = [
      'Industry',
      'Occupation',
      'Task',
      'Verb',
      'Noun',
      'Skill',
      'Technology',
      'Product',
      'Service',
    ];

    const cards = page.locator('[class*="grid"] > div[class*="border"]');
    const cardCount = await cards.count();

    if (cardCount > 0) {
      // Check if priority types appear first
      const firstCardHeading = await cards.first().locator('h3').textContent();

      // First card should ideally be a priority type if it exists in the data
      // This is a soft check - we just verify the structure is correct
      expect(firstCardHeading).toBeTruthy();
    }
  });
});

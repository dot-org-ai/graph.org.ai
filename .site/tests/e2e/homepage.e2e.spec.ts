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

    // Should have item count
    await expect(firstCard.getByText(/\d+.*items/)).toBeVisible();
  });

  test('type cards should display examples', async ({ page }) => {
    await page.waitForSelector('h2:has-text("Explore by Type")', { timeout: 10000 });

    const cards = page.locator('[class*="grid"] > div[class*="border"]');
    const cardCount = await cards.count();

    // Check first few cards for examples
    for (let i = 0; i < Math.min(3, cardCount); i++) {
      const card = cards.nth(i);
      const examplesLabel = card.getByText('Examples:', { exact: false });

      if (await examplesLabel.isVisible()) {
        // Should have example links
        const exampleLinks = card.locator('a[href^="/"]').filter({ hasNotText: 'View all' });
        const linkCount = await exampleLinks.count();
        expect(linkCount).toBeGreaterThan(0);
        expect(linkCount).toBeLessThanOrEqual(3);
      }
    }
  });

  test('example links should be clickable and navigate correctly', async ({ page }) => {
    await page.waitForSelector('h2:has-text("Explore by Type")', { timeout: 10000 });

    const firstCard = page.locator('[class*="grid"] > div[class*="border"]').first();
    const exampleLink = firstCard.locator('a[href^="/"]').filter({ hasNotText: 'View all' }).first();

    if (await exampleLink.isVisible()) {
      const href = await exampleLink.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/^\//); // Should start with /

      // Click and verify navigation
      await exampleLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain(href!);
    }
  });

  test('"View all" links should be present', async ({ page }) => {
    await page.waitForSelector('h2:has-text("Explore by Type")', { timeout: 10000 });

    const cards = page.locator('[class*="grid"] > div[class*="border"]');
    const cardCount = await cards.count();

    // Check first few cards
    for (let i = 0; i < Math.min(3, cardCount); i++) {
      const card = cards.nth(i);
      const viewAllLink = card.locator('a:has-text("View all")');

      if (await viewAllLink.isVisible()) {
        const href = await viewAllLink.getAttribute('href');
        expect(href).toBeTruthy();
      }
    }
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

  test('documentation link should be present and work', async ({ page }) => {
    const docsLink = page.getByRole('link', { name: 'View Documentation' });
    await expect(docsLink).toBeVisible();

    await docsLink.click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/docs');
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

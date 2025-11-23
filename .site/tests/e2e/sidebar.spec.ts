/**
 * E2E tests for dynamic sidebar with root folders and tabs
 */

import { test, expect } from '@playwright/test'

test.describe('Sidebar Visibility', () => {
  test('should show sidebar on homepage with domain links', async ({ page }) => {
    await page.goto('/')

    // Wait for page to load
    await page.waitForSelector('h1')

    // Check for sidebar
    const sidebar = page.locator('aside#nd-sidebar')
    await expect(sidebar).toBeVisible()

    // Should show .org.ai root link in header
    await expect(page.locator('aside a[href="/"]').first()).toBeVisible()

    // Should show domain links (flat list on homepage)
    await expect(page.locator('aside a[href*="language"]').or(page.locator('aside:has-text("Language")'))).toBeVisible({ timeout: 5000 })
  })

  test('should show sidebar on language type page with root tab', async ({ page }) => {
    await page.goto('/Conjunction')

    // Wait for page to load
    await page.waitForSelector('h1')

    // Sidebar should be visible
    const sidebar = page.locator('aside#nd-sidebar')
    await expect(sidebar).toBeVisible()

    // Should show Language.org.ai root tab/dropdown
    await expect(page.locator('button:has-text("Language.org.ai")')).toBeVisible({ timeout: 5000 })

    // Should show language types in sidebar
    await expect(page.locator('aside a[href="/Adverb"]')).toBeVisible()
    await expect(page.locator('aside a[href="/Verb"]')).toBeVisible()
  })

  test('CRITICAL: sidebar should dynamically reposition based on route', async ({ page }) => {
    // Start on homepage
    await page.goto('/')
    await page.waitForSelector('h1')

    // Homepage should show domain links
    const domainLinks = page.locator('aside a[href="/language"]')
    await expect(domainLinks.first()).toBeVisible({ timeout: 5000 })

    // Navigate to a language type
    await page.goto('/Conjunction')
    await page.waitForSelector('h1')

    // Now sidebar should show Language.org.ai tab and language types
    await expect(page.locator('button:has-text("Language.org.ai")')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('aside a[href="/Conjunction"]')).toBeVisible()
  })

  test('should show sidebar on detail pages', async ({ page }) => {
    await page.goto('/language/conjunction/after', { waitUntil: 'networkidle' })

    // Sidebar should be visible
    const sidebar = page.locator('aside#nd-sidebar')
    await expect(sidebar).toBeVisible()

    // Should show Language.org.ai context
    await expect(page.locator('button:has-text("Language.org.ai")')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Sidebar Hierarchy', () => {
  test('should show O*NET types in sidebar when on /onet with root folder', async ({ page }) => {
    await page.goto('/onet')

    // Wait for page to load
    await page.waitForSelector('h1')

    // Sidebar should be visible
    const sidebar = page.locator('aside#nd-sidebar')
    await expect(sidebar).toBeVisible()

    // Should show O*NET.org.ai root tab/dropdown
    await expect(page.locator('button:has-text("O*NET.org.ai")')).toBeVisible({ timeout: 5000 })

    // Should show type links like "Occupations (1016)"
    // Look for links with counts in parentheses
    const occupationLink = page.locator('aside a:has-text("Occupation")')
    await expect(occupationLink.first()).toBeVisible({ timeout: 5000 })
  })

  test('should show UNSPSC types in sidebar with root folder', async ({ page }) => {
    await page.goto('/unspsc')

    // Wait for page to load
    await page.waitForSelector('h1')

    // Sidebar should be visible
    const sidebar = page.locator('aside#nd-sidebar')
    await expect(sidebar).toBeVisible()

    // Should show UNSPSC.org.ai root tab/dropdown
    await expect(page.locator('button:has-text("UNSPSC.org.ai")')).toBeVisible({ timeout: 5000 })

    // Should show type links in sidebar
    const typeLinks = page.locator('aside a[href^="/"]')
    await expect(typeLinks.first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Sidebar Tab Switching', () => {
  test('should show correct root tab based on current URL', async ({ page }) => {
    await page.goto('/onet')

    // Wait for page
    await page.waitForSelector('h1')

    // O*NET.org.ai root tab should be visible
    await expect(page.locator('button:has-text("O*NET.org.ai")')).toBeVisible({ timeout: 5000 })
  })

  test('should switch sidebar content when navigating to different domains', async ({ page }) => {
    // Start on homepage with global view
    await page.goto('/')
    await page.waitForSelector('h1')

    // Click on language domain link
    const languageLink = page.locator('a[href="/language"]').first()
    if (await languageLink.isVisible()) {
      await languageLink.click()
      await page.waitForSelector('h1')

      // Sidebar should now show Language.org.ai root tab
      await expect(page.locator('button:has-text("Language.org.ai")')).toBeVisible({ timeout: 5000 })

      // Should show language types in sidebar
      await expect(page.locator('aside a[href="/Verb"]').or(page.locator('aside:has-text("Verb")'))).toBeVisible({ timeout: 5000 })
    }

    // Navigate to onet domain
    await page.goto('/onet')
    await page.waitForSelector('h1')

    // Sidebar should now show O*NET.org.ai root tab
    await expect(page.locator('button:has-text("O*NET.org.ai")')).toBeVisible({ timeout: 5000 })

    // Should show O*NET types in sidebar
    await expect(page.locator('aside a:has-text("Occupation")').first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Sidebar Navigation', () => {
  test('should navigate to type when clicking type link in sidebar', async ({ page }) => {
    await page.goto('/language')

    // Wait for page to load
    await page.waitForSelector('h1')

    // Click on Verb type link in sidebar
    const verbLink = page.locator('aside a[href="/Verb"]').first()
    if (await verbLink.isVisible()) {
      await verbLink.click()

      // Should navigate to /Verb
      await expect(page).toHaveURL('/Verb')

      // Sidebar should still show Language.org.ai context
      await expect(page.locator('button:has-text("Language.org.ai")')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should show shallow type links (no deep nesting)', async ({ page }) => {
    await page.goto('/onet')

    // Wait for page to load
    await page.waitForSelector('h1')

    // Sidebar should show type links, not deeply nested item folders
    const sidebar = page.locator('aside#nd-sidebar')
    await expect(sidebar).toBeVisible()

    // Should show type links like "Occupations (count)"
    const occupationLink = page.locator('aside a:has-text("Occupation")').first()
    await expect(occupationLink).toBeVisible({ timeout: 5000 })

    // Clicking a type link should reposition the sidebar to that type's context
    if (await occupationLink.isVisible()) {
      await occupationLink.click()

      // Should navigate to /Occupation
      await expect(page).toHaveURL('/Occupation')

      // Page should show occupation items
      await page.waitForSelector('h1')
    }
  })
})

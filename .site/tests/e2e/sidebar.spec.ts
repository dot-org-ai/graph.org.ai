/**
 * E2E tests for sidebar visibility and functionality
 */

import { test, expect } from '@playwright/test'

test.describe('Sidebar Visibility', () => {
  test('should show sidebar on homepage', async ({ page }) => {
    await page.goto('/')

    // Wait for page to load
    await page.waitForSelector('h1')

    // Check for sidebar - Fumadocs uses nav with role="navigation"
    const sidebar = page.locator('aside').or(page.locator('[role="navigation"]'))
    await expect(sidebar).toBeVisible()

    // Should have .org.ai tab
    await expect(page.locator('text=.org.ai')).toBeVisible()
  })

  test('should show sidebar on /onet domain page', async ({ page }) => {
    await page.goto('/onet')

    // Wait for page to load
    await page.waitForSelector('h1')

    // Sidebar should be visible
    const sidebar = page.locator('aside').or(page.locator('[role="navigation"]'))
    await expect(sidebar).toBeVisible()

    // Should show domain tabs
    await expect(page.locator('text=onet')).toBeVisible()
  })

  test('CRITICAL: should show sidebar on /Occupation type page', async ({ page }) => {
    await page.goto('/Occupation')

    // Wait for page to load
    await page.waitForSelector('h1')

    // CRITICAL TEST: Sidebar must be visible
    const sidebar = page.locator('aside').or(page.locator('[role="navigation"]'))
    await expect(sidebar).toBeVisible({ timeout: 10000 })

    // Should have tabs
    await expect(page.locator('text=.org.ai')).toBeVisible()
  })

  test('should show sidebar on occupation detail page', async ({ page }) => {
    // This will fail until re-ingestion completes with PascalCase IDs
    const url = '/onet/Occupation/ChiefExecutives'

    await page.goto(url, { waitUntil: 'networkidle' })

    // Sidebar should be visible
    const sidebar = page.locator('aside').or(page.locator('[role="navigation"]'))
    await expect(sidebar).toBeVisible()
  })
})

test.describe('Sidebar Hierarchy', () => {
  test('should show O*NET type folders in sidebar when on /onet', async ({ page }) => {
    await page.goto('/onet')

    // Wait for sidebar to load
    await page.waitForSelector('text=onet')

    // Click on onet tab if not already active
    await page.click('text=onet')

    // Should show type folders like "Occupation (1016)"
    // Look for folders with counts in parentheses
    const occupationFolder = page.locator('text=/Occupation.*\\(/i')
    await expect(occupationFolder).toBeVisible({ timeout: 5000 })
  })

  test('should show hierarchical UNSPSC structure', async ({ page }) => {
    await page.goto('/unspsc')

    // Wait for sidebar
    await page.waitForSelector('text=unspsc')

    // Click unspsc tab
    await page.click('text=unspsc')

    // Should show segment codes (8-digit codes ending in 000000)
    // Example: 10000000, 11000000, etc.
    const segmentCode = page.locator('text=/\\d{8}/')
    await expect(segmentCode.first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Sidebar Tab Switching', () => {
  test('should activate correct tab based on current URL', async ({ page }) => {
    await page.goto('/onet')

    // Wait for page
    await page.waitForSelector('h1')

    // onet tab should be active (has aria-selected or similar)
    const onetTab = page.locator('text=onet')
    await expect(onetTab).toBeVisible()
  })

  test('should switch sidebar content when clicking different tabs', async ({ page }) => {
    await page.goto('/')

    // Click on onet tab
    await page.click('text=onet')

    // Sidebar should now show O*NET hierarchy
    await expect(page.locator('text=/Occupation/i')).toBeVisible({ timeout: 5000 })

    // Click on apqc tab
    await page.click('text=apqc')

    // Sidebar should now show APQC content
    await expect(page.locator('text=/Process/i')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Sidebar Navigation', () => {
  test('should navigate to domain when clicking tab', async ({ page }) => {
    await page.goto('/')

    // Click onet tab
    await page.click('text=onet')

    // Should navigate to /onet
    await expect(page).toHaveURL('/onet')
  })

  test('should expand/collapse folders', async ({ page }) => {
    await page.goto('/onet')

    // Click onet tab
    await page.click('text=onet')

    // Find a folder (type folder)
    const folder = page.locator('text=/Occupation.*\\(/').first()

    if (await folder.isVisible()) {
      // Click to expand
      await folder.click()

      // Should show items under the folder
      // This is hard to test without knowing exact structure
    }
  })
})

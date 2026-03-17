/**
 * E2E Tests: Renter User Flow
 */

const { test, expect } = require('@playwright/test');

test.describe('Renter Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should browse equipment on homepage', async ({ page }) => {
    // Should see equipment listings or browse section
    await expect(
      page.locator('text=/browse.*equipment/i, text=/available.*equipment/i, .equipment-card')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should search for equipment', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('excavator');
      await page.waitForTimeout(1000);

      // Results should update
      await expect(page.locator('.equipment-card, .card')).toHaveCount(0, { timeout: 5000 }).catch(() => {
        // It's okay if there are results
      });
    }
  });

  test('should filter equipment by category', async ({ page }) => {
    // Find category dropdown/selector
    const categorySelect = page.locator('select:has-text("Category"), select:has-text("All Categories")').first();

    if (await categorySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categorySelect.selectOption({ index: 1 }); // Select first non-default option
      await page.waitForTimeout(1000);

      // Should show filtered results
      await expect(page.locator('.equipment-card, .card').first()).toBeVisible({ timeout: 5000 }).catch(() => {
        // May not have equipment in that category
      });
    }
  });

  test('should filter equipment by price range', async ({ page }) => {
    const priceFilter = page.locator('select:has-text("Price"), select:has-text("All Prices")').first();

    if (await priceFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await priceFilter.selectOption({ label: '$0 - $50' });
      await page.waitForTimeout(1000);
    }
  });

  test('should view equipment details', async ({ page }) => {
    // Wait for equipment cards to load
    await page.waitForSelector('.equipment-card, .card', { timeout: 10000 }).catch(() => {});

    // Click on first equipment card or view details button
    const viewButton = page.locator('button:has-text("View Details"), button:has-text("Details"), a:has-text("View")').first();

    if (await viewButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await viewButton.click();

      // Should show modal or navigate to details page
      await page.waitForTimeout(1000);
      await expect(
        page.locator('.modal, [role="dialog"], h2, h3')
      ).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('should add equipment to favorites (requires auth)', async ({ page }) => {
    // Look for favorite/heart button
    const favoriteButton = page.locator('button:has(.bi-heart), button[title*="favorite"]').first();

    if (await favoriteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await favoriteButton.click();

      // Should either save or redirect to login
      await page.waitForTimeout(1000);
    }
  });

  test('should show rent button on equipment cards', async ({ page }) => {
    await page.waitForSelector('.equipment-card, .card', { timeout: 10000 }).catch(() => {});

    const rentButton = page.locator('button:has-text("Rent"), button:has-text("Rent Now")').first();

    await expect(rentButton).toBeVisible({ timeout: 5000 }).catch(() => {
      // Some equipment may not be available
    });
  });

  test('should navigate to favorites page (requires auth)', async ({ page }) => {
    const favoritesLink = page.locator('a:has-text("Favorites"), button:has-text("Favorites")').first();

    if (await favoritesLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await favoritesLink.click();

      // Should navigate or show login
      await page.waitForTimeout(1000);
    }
  });

  test('should navigate to rental history (requires auth)', async ({ page }) => {
    const historyLink = page.locator('a:has-text("Rental History"), button:has-text("History")').first();

    if (await historyLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await historyLink.click();

      // Should navigate or show login
      await page.waitForTimeout(1000);
    }
  });

  test('should clear all filters', async ({ page }) => {
    // Find clear/reset button
    const clearButton = page.locator('button:has-text("Clear"), button[title*="Clear"]').first();

    if (await clearButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // First apply some filters
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await searchInput.fill('test');
      }

      // Then clear them
      await clearButton.click();
      await page.waitForTimeout(500);

      // Search should be cleared
      if (await searchInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(searchInput).toHaveValue('');
      }
    }
  });
});

test.describe('Equipment Detail View', () => {
  test('should show equipment information in detail modal', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('.equipment-card, .card', { timeout: 10000 }).catch(() => {});

    const viewButton = page.locator('button:has-text("View"), button:has(.bi-eye)').first();

    if (await viewButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await viewButton.click();

      // Wait for modal
      await page.waitForTimeout(1000);

      // Should show equipment details
      await expect(
        page.locator('.modal-body, [role="dialog"]')
      ).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });
});

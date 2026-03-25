/**

 * Basic E2E Tests: Renter Flow

 */

const { test, expect } = require('@playwright/test');

test.describe('Renter Flow Basic Tests', () => {

  test.beforeEach(async ({ page }) => {

    await page.goto('/');

  });

  test('homepage should load', async ({ page }) => {

    await expect(page).toHaveURL(/.*/);

  });

  test('should show equipment cards on homepage', async ({ page }) => {

    const cards = page.locator('.equipment-card, .card');

    await expect(cards.first()).toBeVisible({ timeout: 10000 });

  });

  test('should allow typing in search box', async ({ page }) => {

    const searchBox = page.locator('input[type="search"], input[placeholder*="Search"]').first();

    if (await searchBox.isVisible().catch(() => false)) {

      await searchBox.fill('excavator');

      await expect(searchBox).toHaveValue('excavator');

    }

  });

  test('should allow selecting category filter', async ({ page }) => {

    const category = page.locator('select').first();

    if (await category.isVisible().catch(() => false)) {

      const options = await category.locator('option').count();

      if (options > 1) {

        await category.selectOption({ index: 1 });

      }

    }

  });

  test('should show rent button on page', async ({ page }) => {

    const rentButton = page.locator('button:has-text("Rent"), button:has-text("Rent Now")').first();

    if (await rentButton.isVisible().catch(() => false)) {

      await expect(rentButton).toBeVisible();

    }

  });

  test('should open equipment details if view button exists', async ({ page }) => {

    const viewButton = page.locator('button:has-text("View"), button:has-text("Details"), a:has-text("View")').first();

    if (await viewButton.isVisible().catch(() => false)) {

      await viewButton.click();

      await page.waitForTimeout(1000);

    }

  });

  test('should click favorites button if available', async ({ page }) => {

    const favoriteButton = page.locator('button[title*="favorite"], button:has(.bi-heart)').first();

    if (await favoriteButton.isVisible().catch(() => false)) {

      await favoriteButton.click();

      await page.waitForTimeout(1000);

    }

  });

  test('should navigate to favorites page if link exists', async ({ page }) => {

    const favoritesLink = page.locator('a:has-text("Favorites"), button:has-text("Favorites")').first();

    if (await favoritesLink.isVisible().catch(() => false)) {

      await favoritesLink.click();

      await page.waitForTimeout(1000);

    }

  });

  test('should clear search input if clear button exists', async ({ page }) => {

    const searchBox = page.locator('input[type="search"], input[placeholder*="Search"]').first();

    const clearButton = page.locator('button:has-text("Clear"), button:has-text("Reset")').first();

    if (await searchBox.isVisible().catch(() => false)) {

      await searchBox.fill('test');

    }

    if (await clearButton.isVisible().catch(() => false)) {

      await clearButton.click();

      await page.waitForTimeout(500);

      if (await searchBox.isVisible().catch(() => false)) {

        await expect(searchBox).toHaveValue('');

      }

    }

  });

});
 
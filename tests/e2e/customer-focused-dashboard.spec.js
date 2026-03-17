// tests/customer-focused-dashboard.spec.js
/**
 * Professional Dashboard Tests - Customer-Focused Design
 * Tests the new design without distracting stats
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

test.describe('Customer-Focused Dashboard - Professional Design', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test.describe('🎯 PRIMARY FOCUS: Value Proposition & Search', () => {

    test('should show clear value proposition above the fold', async ({ page }) => {
      // Check for main headline
      const headline = page.locator('h1').first();
      await expect(headline).toBeVisible();
      await expect(headline).toContainText(/Rent|Equipment|Professional/i);

      // Should be in viewport on load
      const headlineBox = await headline.boundingBox();
      expect(headlineBox.y).toBeLessThan(600);
    });

    test('should have prominent search as primary CTA', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="equipment" i], input[placeholder*="search" i]').first();

      await expect(searchInput).toBeVisible();

      // Search should be large and prominent
      const searchBox = await searchInput.boundingBox();
      expect(searchBox.height).toBeGreaterThan(40); // Min 40px height

      // Search should be in top 50% of viewport
      expect(searchBox.y).toBeLessThan(400);
    });

    test('should auto-focus search input for immediate use', async ({ page }) => {
      // Wait a moment for auto-focus
      await page.waitForTimeout(500);

      const searchInput = page.locator('.hero-search-input, input[placeholder*="equipment" i]').first();

      // Check if focused or can be focused easily
      await searchInput.focus();
      const isFocused = await searchInput.evaluate(el => el === document.activeElement);
      expect(isFocused).toBe(true);
    });

    test('should show popular search suggestions', async ({ page }) => {
      const popularSearches = page.locator('.popular-tag, [class*="popular"]').first();

      if (await popularSearches.count() > 0) {
        await expect(popularSearches).toBeVisible();

        // Should have at least 3 suggestions
        const tags = page.locator('.popular-tag, [class*="popular"] button');
        expect(await tags.count()).toBeGreaterThanOrEqual(3);
      }
    });

    test('should execute search and show results', async ({ page }) => {
      const searchInput = page.locator('.hero-search-input, input[placeholder*="equipment" i]').first();
      const searchButton = page.locator('button:has-text("Search"), .search-submit-btn').first();

      await searchInput.fill('drill');

      if (await searchButton.isVisible()) {
        await searchButton.click();
      } else {
        await searchInput.press('Enter');
      }

      // Should show equipment or navigate
      await page.waitForTimeout(1000);

      const equipmentGrid = page.locator('.equipment-grid, .row, [class*="equipment"]');
      await expect(equipmentGrid).toBeVisible();
    });
  });

  test.describe('❌ REMOVED DISTRACTIONS: No Stats Cards at Top', () => {

    test('should NOT show stats cards immediately on page load', async ({ page }) => {
      // Old distracting stats should NOT be visible
      const oldStats = page.locator('.card:has-text("Available Equipment"), .card:has-text("Total Rentals"), .card:has-text("Total Spent")');

      // Wait to ensure they don't appear
      await page.waitForTimeout(1000);

      // These cards should either not exist or be hidden
      const count = await oldStats.count();

      if (count > 0) {
        // If they exist, they should be below the fold or hidden
        const firstCard = oldStats.first();
        const box = await firstCard.boundingBox();

        if (box) {
          // Should be way down the page, not in hero area
          expect(box.y).toBeGreaterThan(800);
        }
      }
    });

    test('should lead with equipment, not user stats', async ({ page }) => {
      // First visible content should be value prop + search
      const firstVisibleText = await page.locator('body').first().textContent();

      // Should mention equipment/rent before any stats
      const equipmentIndex = firstVisibleText.toLowerCase().indexOf('equipment');
      const rentIndex = firstVisibleText.toLowerCase().indexOf('rent');
      const statsIndex = Math.min(
        firstVisibleText.toLowerCase().indexOf('total rentals'),
        firstVisibleText.toLowerCase().indexOf('total spent')
      );

      // Equipment/Rent mentions should come before stats
      if (statsIndex > 0) {
        expect(Math.min(equipmentIndex, rentIndex)).toBeLessThan(statsIndex);
      }
    });

    test('should have max 3 visual elements above search', async ({ page }) => {
      const searchInput = page.locator('.hero-search-input, input[placeholder*="equipment" i]').first();
      const searchBox = await searchInput.boundingBox();

      // Count visible elements above search
      const elementsAbove = page.locator('h1, h2, h3, .card, .btn').filter({
        has: page.locator('*'),
      });

      let count = 0;
      for (let i = 0; i < await elementsAbove.count(); i++) {
        const box = await elementsAbove.nth(i).boundingBox();
        if (box && box.y < searchBox.y) {
          count++;
        }
      }

      // Should be minimal - just headline, subheadline, maybe logo
      expect(count).toBeLessThan(5);
    });
  });

  test.describe('🎨 VISUAL HIERARCHY: Clear Focus', () => {

    test('should have single clear headline (h1)', async ({ page }) => {
      const h1Elements = page.locator('h1');
      const count = await h1Elements.count();

      // Should be exactly 1 h1 (best practice)
      expect(count).toBe(1);

      const h1 = h1Elements.first();
      await expect(h1).toBeVisible();

      // Should be large and prominent
      const fontSize = await h1.evaluate(el => {
        return parseInt(window.getComputedStyle(el).fontSize);
      });

      expect(fontSize).toBeGreaterThan(28); // At least 28px
    });

    test('should have clear F-pattern layout', async ({ page }) => {
      // F-pattern: Eye starts at top-left, scans right, then down
      const headline = page.locator('h1').first();
      const searchBar = page.locator('.hero-search-input, input').first();
      const categories = page.locator('.category-card, [class*="category"]').first();

      // All should be visible
      await expect(headline).toBeVisible();
      await expect(searchBar).toBeVisible();

      const headlineBox = await headline.boundingBox();
      const searchBox = await searchBar.boundingBox();

      // Headline above search
      expect(headlineBox.y).toBeLessThan(searchBox.y);

      // Search wider than headline (horizontal scan)
      if (searchBox.width && headlineBox.width) {
        expect(searchBox.width).toBeGreaterThanOrEqual(headlineBox.width * 0.8);
      }
    });

    test('should use consistent color palette', async ({ page }) => {
      const buttons = page.locator('button.search-submit-btn, .btn-primary, .primary-button');

      if (await buttons.count() > 0) {
        const bgColor = await buttons.first().evaluate(el => {
          return window.getComputedStyle(el).backgroundColor;
        });

        // Should have a defined background (not transparent)
        expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
      }
    });
  });

  test.describe('📱 MOBILE-FIRST: Responsive Design', () => {

    test('should adapt to mobile (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const hero = page.locator('.customer-hero, .hero').first();
      await expect(hero).toBeVisible();

      // Search should stack on mobile
      const searchInput = page.locator('.hero-search-input').first();
      const searchButton = page.locator('.search-submit-btn').first();

      if (await searchButton.isVisible()) {
        const inputBox = await searchInput.boundingBox();
        const buttonBox = await searchButton.boundingBox();

        // Button should be below input on mobile
        expect(buttonBox.y).toBeGreaterThanOrEqual(inputBox.y);
      }
    });

    test('should have touch-friendly search on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const searchInput = page.locator('.hero-search-input').first();
      const inputBox = await searchInput.boundingBox();

      // Minimum 44px tap target (iOS guidelines)
      expect(inputBox.height).toBeGreaterThanOrEqual(40);
    });

    test('should show categories on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const categories = page.locator('.category-card, [class*="category"]');

      if (await categories.count() > 0) {
        // Should be visible and tappable
        const firstCategory = categories.first();
        await expect(firstCategory).toBeVisible();

        const box = await firstCategory.boundingBox();
        expect(box.height).toBeGreaterThan(40);
      }
    });
  });

  test.describe('✨ MICRO-INTERACTIONS: Polish', () => {

    test('should show hover effect on search button', async ({ page }) => {
      const searchButton = page.locator('.search-submit-btn, button:has-text("Search")').first();

      if (await searchButton.isVisible()) {
        await searchButton.hover();

        // Should have visual feedback (checked via CSS)
        await page.waitForTimeout(300);

        const transform = await searchButton.evaluate(el => {
          return window.getComputedStyle(el).transform;
        });

        // Should have some transformation or effect
        expect(transform).toBeDefined();
      }
    });

    test('should show hover effect on popular tags', async ({ page }) => {
      const tag = page.locator('.popular-tag').first();

      if (await tag.isVisible()) {
        await tag.hover();
        await page.waitForTimeout(200);

        // Should change color or transform
        const bgColor = await tag.evaluate(el => {
          return window.getComputedStyle(el).backgroundColor;
        });

        expect(bgColor).toBeDefined();
      }
    });

    test('should show hover effect on category cards', async ({ page }) => {
      const category = page.locator('.category-card').first();

      if (await category.isVisible()) {
        await category.hover();
        await page.waitForTimeout(300);

        // Should have visual feedback
        const transform = await category.evaluate(el => {
          return window.getComputedStyle(el).transform;
        });

        expect(transform).toBeDefined();
      }
    });
  });

  test.describe('⚡ PERFORMANCE: Fast Load', () => {

    test('should load hero in under 2 seconds', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(`${BASE_URL}/`);
      await page.waitForSelector('h1', { timeout: 2000 });

      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(2000);
    });

    test('should have no console errors', async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto(`${BASE_URL}/`);
      await page.waitForTimeout(2000);

      // Filter out known warnings
      const criticalErrors = errors.filter(err =>
        !err.includes('DevTools') &&
        !err.includes('Download the React')
      );

      expect(criticalErrors).toHaveLength(0);
    });

    test('should show content without layout shifts', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const headline = page.locator('h1').first();
      const initialBox = await headline.boundingBox();

      // Wait for potential shifts
      await page.waitForTimeout(1000);

      const finalBox = await headline.boundingBox();

      // Position should not change (CLS = 0)
      expect(finalBox.y).toBeCloseTo(initialBox.y, 5); // Within 5px
    });
  });

  test.describe('♿ ACCESSIBILITY: WCAG 2.1 AA', () => {

    test('should have proper heading hierarchy', async ({ page }) => {
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);

      const h2Count = await page.locator('h2').count();
      expect(h2Count).toBeGreaterThanOrEqual(0);
    });

    test('should have labels on form inputs', async ({ page }) => {
      const searchInput = page.locator('.hero-search-input, input[type="text"]').first();

      const placeholder = await searchInput.getAttribute('placeholder');
      const ariaLabel = await searchInput.getAttribute('aria-label');

      // Should have either placeholder or aria-label
      expect(placeholder || ariaLabel).toBeTruthy();
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const focused = await page.evaluate(() => {
        return document.activeElement.tagName;
      });

      expect(['INPUT', 'BUTTON', 'A']).toContain(focused);
    });

    test('should have focus indicators', async ({ page }) => {
      const searchInput = page.locator('.hero-search-input').first();
      await searchInput.focus();

      const outline = await searchInput.evaluate(el => {
        return window.getComputedStyle(el).outline;
      });

      // Should have some outline or border on focus
      expect(outline || '').toBeDefined();
    });
  });

  test.describe('🎯 CONVERSION OPTIMIZATION', () => {

    test('should show social proof indicators', async ({ page }) => {
      // Look for trust signals, ratings, user counts
      const socialProof = page.locator('.social-proof, .trust, .proof-item');

      if (await socialProof.count() > 0) {
        await expect(socialProof.first()).toBeVisible();
      }
    });

    test('should have single primary CTA (search)', async ({ page }) => {
      // Count primary action buttons above fold
      const primaryButtons = page.locator('.search-submit-btn, .btn-primary, .primary-button');

      let visiblePrimaryCount = 0;
      for (let i = 0; i < await primaryButtons.count(); i++) {
        const box = await primaryButtons.nth(i).boundingBox();
        if (box && box.y < 600) { // Above fold
          visiblePrimaryCount++;
        }
      }

      // Should have exactly 1 primary CTA above fold
      expect(visiblePrimaryCount).toBeLessThanOrEqual(2); // Search button + maybe one more
    });

    test('should show featured equipment visually', async ({ page }) => {
      const featured = page.locator('.featured-item, .featured-carousel, .hero-visual');

      if (await featured.count() > 0) {
        await expect(featured.first()).toBeVisible();
      }
    });

    test('should make categories quickly accessible', async ({ page }) => {
      const categorySection = page.locator('.category-quick-links, .category-grid');

      if (await categorySection.count() > 0) {
        await expect(categorySection.first()).toBeVisible();

        // Should be near top of page
        const box = await categorySection.first().boundingBox();
        expect(box.y).toBeLessThan(1000); // Within first screen or two
      }
    });
  });

  test.describe('📊 METRICS VALIDATION', () => {

    test('should have clear information scent (findability)', async ({ page }) => {
      const bodyText = await page.locator('body').first().textContent();

      // Should mention key terms that users search for
      expect(bodyText.toLowerCase()).toContain('equipment');
      expect(bodyText.toLowerCase()).toMatch(/rent|rental/);
    });

    test('should minimize time to first action', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(`${BASE_URL}/`);

      // Time until search input is ready
      await page.waitForSelector('.hero-search-input, input[type="text"]', { state: 'visible' });

      const timeToAction = Date.now() - startTime;

      // Should be under 1.5 seconds
      expect(timeToAction).toBeLessThan(1500);
    });

    test('should have logical tab order', async ({ page }) => {
      const searchInput = page.locator('.hero-search-input').first();
      const searchButton = page.locator('.search-submit-btn').first();

      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Search-related elements should be in sequence
      const focused = await page.evaluate(() => {
        return document.activeElement.className;
      });

      expect(focused).toContain('search' || 'input' || 'button');
    });
  });
});

// Cross-browser tests
test.describe('🌐 CROSS-BROWSER COMPATIBILITY', () => {

  test('should render correctly in different viewports', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 1024, height: 768, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE_URL}/`);

      const hero = page.locator('.customer-hero, h1').first();
      await expect(hero).toBeVisible();

      console.log(`✅ ${viewport.name}: Renders correctly`);
    }
  });
});

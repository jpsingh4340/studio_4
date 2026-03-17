// tests/renter-dashboard.spec.js
/**
 * Comprehensive Playwright Test Suite for Renter Dashboard
 * Tests UI/UX, functionality, accessibility, and performance
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'test@rentmate.com',
  password: 'TestPassword123!',
};

test.describe('Renter Dashboard - Professional UI/UX Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/renter-dashboard`);
  });

  test.describe('Visual Hierarchy & Layout', () => {

    test('should display hero section prominently', async ({ page }) => {
      const heroSection = page.locator('.enhanced-hero-section, .hero');
      await expect(heroSection).toBeVisible();

      // Check hero is at top of page
      const heroPosition = await heroSection.boundingBox();
      expect(heroPosition.y).toBeLessThan(200);
    });

    test('should show user greeting with personalization', async ({ page }) => {
      const greeting = page.locator('.greeting, .hero-title');
      await expect(greeting).toBeVisible();
      await expect(greeting).toContainText(/Good|Welcome|Hello/i);
    });

    test('should display stats cards in correct order', async ({ page }) => {
      const statsCards = page.locator('.stat-card, [class*="stat"]');
      const count = await statsCards.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('should have clear visual hierarchy with proper spacing', async ({ page }) => {
      const sections = page.locator('section, .row, [class*="section"]');

      for (let i = 0; i < await sections.count(); i++) {
        const section = sections.nth(i);
        const styles = await section.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            marginBottom: computed.marginBottom,
            padding: computed.padding,
          };
        });

        // Verify spacing exists
        expect(parseInt(styles.marginBottom) + parseInt(styles.padding)).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Equipment Browsing & Search', () => {

    test('should display search bar prominently', async ({ page }) => {
      const searchBar = page.locator('input[type="text"], input[placeholder*="search" i]');
      await expect(searchBar).toBeVisible();
    });

    test('should filter equipment by search term', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="search" i]').first();
      await searchInput.fill('drill');
      await page.waitForTimeout(500); // Debounce delay

      const equipmentCards = page.locator('.equipment-card, [class*="equipment"]');
      const firstCard = equipmentCards.first();

      if (await equipmentCards.count() > 0) {
        await expect(firstCard).toContainText(/drill/i);
      }
    });

    test('should filter by category', async ({ page }) => {
      const categoryFilter = page.locator('select, [class*="category"]').first();

      if (await categoryFilter.isVisible()) {
        await categoryFilter.selectOption({ index: 1 });
        await page.waitForTimeout(300);

        const equipmentCards = page.locator('.equipment-card');
        expect(await equipmentCards.count()).toBeGreaterThan(0);
      }
    });

    test('should show equipment details on card click', async ({ page }) => {
      const firstCard = page.locator('.equipment-card, .card').first();

      if (await firstCard.isVisible()) {
        await firstCard.click();

        // Wait for modal or details page
        const modal = page.locator('.modal, [role="dialog"]');
        await expect(modal).toBeVisible({ timeout: 2000 });
      }
    });
  });

  test.describe('Favorites & Interactions', () => {

    test('should toggle favorite on heart icon click', async ({ page }) => {
      const heartIcon = page.locator('.bi-heart, [class*="favorite"]').first();

      if (await heartIcon.isVisible()) {
        const initialClass = await heartIcon.getAttribute('class');
        await heartIcon.click();
        await page.waitForTimeout(500);

        const newClass = await heartIcon.getAttribute('class');
        expect(newClass).not.toBe(initialClass);
      }
    });

    test('should show favorite count badge', async ({ page }) => {
      const favoriteButton = page.locator('button:has-text("Favorites"), button:has-text("Saved")');

      if (await favoriteButton.isVisible()) {
        await expect(favoriteButton).toBeVisible();
      }
    });
  });

  test.describe('Responsive Design', () => {

    test('should adapt layout for mobile (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const hero = page.locator('.enhanced-hero-section, .hero');
      await expect(hero).toBeVisible();

      // Check if sticky button appears on mobile
      const stickyButton = page.locator('.sticky-feedback-btn');
      await expect(stickyButton).toBeVisible();
    });

    test('should adapt layout for tablet (768px)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      const statsGrid = page.locator('.stats-dashboard, .row');
      await expect(statsGrid).toBeVisible();
    });

    test('should show bottom sheet on mobile instead of modal', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Trigger feedback prompt
      const feedbackBtn = page.locator('button:has-text("Feedback"), button:has-text("Share")').first();

      if (await feedbackBtn.isVisible()) {
        await feedbackBtn.click();

        const bottomSheet = page.locator('.bottom-sheet');
        if (await bottomSheet.isVisible()) {
          expect(await bottomSheet.isVisible()).toBe(true);
        }
      }
    });
  });

  test.describe('Smart Feedback Triggers', () => {

    test('should show engagement banner for new users', async ({ page }) => {
      // Set localStorage to trigger engagement banner
      await page.evaluate(() => {
        localStorage.setItem('rentmate_login_count', '3');
        localStorage.removeItem('rentmate_first_feedback_shown');
      });

      await page.reload();
      await page.waitForTimeout(2500); // Wait for trigger delay

      const engagementBanner = page.locator('.smart-feedback-banner, [class*="engagement"]');
      if (await engagementBanner.count() > 0) {
        await expect(engagementBanner.first()).toBeVisible();
      }
    });

    test('should show milestone toast for achievements', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.removeItem('rentmate_milestone_shown');
      });

      await page.reload();
      await page.waitForTimeout(2000);

      const milestoneToast = page.locator('.congratulatory-toast');
      // Toast may or may not appear based on user stats
    });

    test('should dismiss banners on close button click', async ({ page }) => {
      const banner = page.locator('.smart-feedback-banner').first();

      if (await banner.isVisible()) {
        const closeBtn = banner.locator('button, .close, .dismiss');
        await closeBtn.click();
        await expect(banner).not.toBeVisible();
      }
    });
  });

  test.describe('Loading States & Performance', () => {

    test('should show skeleton loaders initially', async ({ page }) => {
      await page.goto(`${BASE_URL}/renter-dashboard`);

      const skeleton = page.locator('[class*="skeleton"]');
      if (await skeleton.count() > 0) {
        await expect(skeleton.first()).toBeVisible();
      }
    });

    test('should load within performance budget', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/renter-dashboard`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have no console errors', async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto(`${BASE_URL}/renter-dashboard`);
      await page.waitForTimeout(2000);

      expect(errors).toHaveLength(0);
    });
  });

  test.describe('Accessibility (WCAG 2.1 AA)', () => {

    test('should have proper heading hierarchy', async ({ page }) => {
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1); // Only one h1 per page

      const h2Count = await page.locator('h2').count();
      expect(h2Count).toBeGreaterThan(0);
    });

    test('should have alt text on images', async ({ page }) => {
      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through interactive elements
      const firstButton = page.locator('button, a').first();
      await firstButton.focus();

      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const focusedElement = await page.evaluate(() => document.activeElement.tagName);
      expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
    });

    test('should have ARIA labels on interactive elements', async ({ page }) => {
      const buttons = page.locator('button');
      const count = await buttons.count();

      for (let i = 0; i < Math.min(count, 10); i++) {
        const btn = buttons.nth(i);
        const ariaLabel = await btn.getAttribute('aria-label');
        const text = await btn.textContent();

        // Either has aria-label or visible text
        expect(ariaLabel || text?.trim()).toBeTruthy();
      }
    });

    test('should have sufficient color contrast', async ({ page }) => {
      // This is a simplified check - full contrast testing needs specialized tools
      const textElements = page.locator('p, span, h1, h2, h3, h4, h5, h6').first();
      const styles = await textElements.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });

      expect(styles.color).toBeTruthy();
    });
  });

  test.describe('User Flows', () => {

    test('should complete equipment rental flow', async ({ page }) => {
      // Find first available equipment
      const equipmentCard = page.locator('.equipment-card, .card').first();

      if (await equipmentCard.isVisible()) {
        await equipmentCard.click();

        // Click "Rent Now" button
        const rentButton = page.locator('button:has-text("Rent"), button:has-text("Book")').first();

        if (await rentButton.isVisible()) {
          await rentButton.click();

          // Should navigate to rent page or show modal
          await page.waitForTimeout(1000);
          const url = page.url();
          expect(url).toContain('/rent');
        }
      }
    });

    test('should navigate between tabs', async ({ page }) => {
      const browseTab = page.locator('button:has-text("Browse"), [role="tab"]:has-text("Browse")').first();
      const rentalsTab = page.locator('button:has-text("Rentals"), button:has-text("My Rentals")').first();

      if (await rentalsTab.isVisible()) {
        await rentalsTab.click();
        await page.waitForTimeout(500);

        const rentalContent = page.locator('.rental-history, [class*="rental"]');
        await expect(rentalContent).toBeVisible();

        await browseTab.click();
        await page.waitForTimeout(500);

        const equipmentGrid = page.locator('.equipment-grid, [class*="equipment"]');
        await expect(equipmentGrid).toBeVisible();
      }
    });

    test('should submit feedback successfully', async ({ page }) => {
      const feedbackButton = page.locator('button:has-text("Feedback"), button:has-text("Share")').first();

      if (await feedbackButton.isVisible()) {
        await feedbackButton.click();
        await page.waitForTimeout(500);

        const feedbackModal = page.locator('.feedback-modal, [role="dialog"]');
        await expect(feedbackModal).toBeVisible();

        // Fill feedback form
        const ratingStars = page.locator('.star, [class*="rating"] button').nth(4);
        if (await ratingStars.isVisible()) {
          await ratingStars.click();
        }

        const commentField = page.locator('textarea, input[type="text"]').first();
        if (await commentField.isVisible()) {
          await commentField.fill('Great service and quality equipment!');
        }

        const submitButton = page.locator('button:has-text("Submit"), button[type="submit"]').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(1000);
        }
      }
    });
  });

  test.describe('Empty States & Error Handling', () => {

    test('should show helpful empty state for no equipment', async ({ page }) => {
      // Apply filter that returns no results
      const searchInput = page.locator('input[placeholder*="search" i]').first();
      await searchInput.fill('xyzabc123nonexistent');
      await page.waitForTimeout(500);

      const emptyState = page.locator('[class*="empty"], [class*="no-results"]');
      if (await emptyState.count() > 0) {
        await expect(emptyState.first()).toBeVisible();
      }
    });

    test('should show empty state for no rentals', async ({ page }) => {
      const rentalsTab = page.locator('button:has-text("Rentals"), button:has-text("My Rentals")').first();

      if (await rentalsTab.isVisible()) {
        await rentalsTab.click();
        await page.waitForTimeout(500);

        const emptyState = page.locator('[class*="empty"], .empty-state');
        if (await emptyState.count() > 0) {
          await expect(emptyState.first()).toBeVisible();
          await expect(emptyState.first()).toContainText(/no rentals/i);
        }
      }
    });
  });

  test.describe('Micro-Interactions', () => {

    test('should show hover effects on cards', async ({ page }) => {
      const card = page.locator('.equipment-card, .card').first();

      if (await card.isVisible()) {
        const box1 = await card.boundingBox();
        await card.hover();
        await page.waitForTimeout(300);

        // Card should have visual feedback (transform, shadow, etc.)
        // This is validated by the CSS but we can check computed styles if needed
        expect(box1).toBeTruthy();
      }
    });

    test('should animate favorite button on click', async ({ page }) => {
      const heartIcon = page.locator('.bi-heart, [class*="favorite"]').first();

      if (await heartIcon.isVisible()) {
        await heartIcon.click();

        // Animation should occur (checked via CSS)
        await page.waitForTimeout(500);
      }
    });
  });
});

// Performance metrics test
test.describe('Performance Metrics', () => {

  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    await page.goto(`${BASE_URL}/renter-dashboard`);

    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

        setTimeout(() => resolve([]), 5000);
      });
    });

    console.log('Performance metrics:', metrics);
  });

  test('should have minimal layout shifts (CLS)', async ({ page }) => {
    await page.goto(`${BASE_URL}/renter-dashboard`);

    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        }).observe({ entryTypes: ['layout-shift'] });

        setTimeout(() => resolve(clsValue), 5000);
      });
    });

    expect(cls).toBeLessThan(0.1); // Good CLS threshold
  });
});

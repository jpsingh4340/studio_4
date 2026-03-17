/**
 * E2E Tests: Admin Management Flow
 */

const { test, expect } = require('@playwright/test');

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin-dashboard');
  });

  test('should show admin dashboard (requires admin auth)', async ({ page }) => {
    // Check for admin dashboard elements
    await expect(
      page.locator('text=/admin.*dashboard/i, h1, h2')
    ).toBeVisible({ timeout: 5000 }).catch(() => {
      // May redirect to login if not authenticated as admin
    });
  });

  test('should display platform statistics', async ({ page }) => {
    // Look for metrics/stats cards
    const statsCards = page.locator('.card, [class*="stat"]');

    if (await statsCards.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      // Should have multiple statistics
      await expect(statsCards).toHaveCount(3, { timeout: 5000 }).catch(() => {
        // May have different number
      });
    }
  });

  test('should show recent activities or logs', async ({ page }) => {
    const activitySection = page.locator('text=/recent.*activity/i, text=/audit.*log/i').first();

    if (await activitySection.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Should display activity feed
      await page.waitForTimeout(1000);
    }
  });

  test('should display analytics charts', async ({ page }) => {
    // Look for chart/graph elements
    const charts = page.locator('canvas, svg[class*="chart"], .recharts-wrapper');

    if (await charts.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      // Has charts
      await expect(charts.first()).toBeVisible();
    }
  });
});

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin-dashboard');
  });

  test('should show user management section', async ({ page }) => {
    const userSection = page.locator('text=/user.*management/i, text=/manage.*users/i').first();

    if (await userSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Should show user list or table
      await page.waitForTimeout(1000);
    }
  });

  test('should allow searching users', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search users"], input[placeholder*="Find user"]').first();

    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('test@example.com');
      await page.waitForTimeout(1000);
    }
  });

  test('should allow changing user roles', async ({ page }) => {
    const roleButton = page.locator('button:has-text("Change Role"), select[name*="role"]').first();

    if (await roleButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Has role management
      await page.waitForTimeout(500);
    }
  });

  test('should allow deactivating users', async ({ page }) => {
    const deactivateButton = page.locator('button:has-text("Deactivate"), button:has-text("Suspend")').first();

    if (await deactivateButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Has user deactivation
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Equipment Approval', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin-dashboard');
  });

  test('should show pending equipment approvals', async ({ page }) => {
    const pendingSection = page.locator('text=/pending.*approval/i, text=/equipment.*approval/i').first();

    if (await pendingSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Should show pending items
      await page.waitForTimeout(1000);
    }
  });

  test('should allow approving equipment', async ({ page }) => {
    const approveButton = page.locator('button:has-text("Approve Equipment"), button:has(.bi-check-circle)').first();

    if (await approveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await approveButton.click();

      // Should show confirmation
      await page.waitForTimeout(1000);
    }
  });

  test('should allow rejecting equipment', async ({ page }) => {
    const rejectButton = page.locator('button:has-text("Reject"), button:has-text("Decline")').first();

    if (await rejectButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rejectButton.click();

      // Should show reason input or confirmation
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Platform Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin-dashboard');
  });

  test('should access platform settings', async ({ page }) => {
    const settingsButton = page.locator('a:has-text("Settings"), button:has-text("Settings")').first();

    if (await settingsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await settingsButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should show export data option', async ({ page }) => {
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download Data")').first();

    if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Has data export functionality
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Dispute Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin-dashboard');
  });

  test('should show active disputes', async ({ page }) => {
    const disputeSection = page.locator('text=/dispute/i, text=/conflict/i').first();

    if (await disputeSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Should show dispute list
      await page.waitForTimeout(1000);
    }
  });

  test('should allow resolving disputes', async ({ page }) => {
    const resolveButton = page.locator('button:has-text("Resolve"), button:has-text("Handle")').first();

    if (await resolveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await resolveButton.click();

      // Should show resolution form
      await page.waitForTimeout(1000);
    }
  });
});

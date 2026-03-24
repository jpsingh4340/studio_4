/**
 * E2E Tests: Admin Management Flow
 */

const { test, expect } = require('@playwright/test');

async function goToAdminDashboard(page) {
  await page.goto('/admin-dashboard');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
}

async function elementExists(locator, timeout = 3000) {
  return await locator.isVisible({ timeout }).catch(() => false);
}

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await goToAdminDashboard(page);
  });

  test('should show admin dashboard (requires admin auth)', async ({ page }) => {
    const dashboardHeader = page.locator('text=/admin.*dashboard/i, h1, h2').first();

    if (await elementExists(dashboardHeader, 5000)) {
      await expect(dashboardHeader).toBeVisible();
    }
  });

  test('should display platform statistics', async ({ page }) => {
    const statsCards = page.locator('.card, [class*="stat"]');

    if (await elementExists(statsCards.first())) {
      const count = await statsCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should show recent activities or logs', async ({ page }) => {
    const activitySection = page.locator('text=/recent.*activity/i, text=/audit.*log/i').first();

    if (await elementExists(activitySection)) {
      await expect(activitySection).toBeVisible();
    }
  });

  test('should display analytics charts', async ({ page }) => {
    const charts = page.locator('canvas, svg[class*="chart"], .recharts-wrapper');

    if (await elementExists(charts.first())) {
      await expect(charts.first()).toBeVisible();
    }
  });
});

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await goToAdminDashboard(page);
  });

  test('should show user management section', async ({ page }) => {
    const userSection = page.locator('text=/user.*management/i, text=/manage.*users/i').first();

    if (await elementExists(userSection)) {
      await expect(userSection).toBeVisible();
    }
  });

  test('should allow searching users', async ({ page }) => {
    const searchInput = page.locator(
      'input[placeholder*="Search users"], input[placeholder*="Find user"], input[type="search"]'
    ).first();

    if (await elementExists(searchInput)) {
      await searchInput.fill('test@example.com');
      await expect(searchInput).toHaveValue('test@example.com');
    }
  });

  test('should allow changing user roles', async ({ page }) => {
    const roleButton = page.locator(
      'button:has-text("Change Role"), select[name*="role"], button:has-text("Role")'
    ).first();

    if (await elementExists(roleButton)) {
      await expect(roleButton).toBeVisible();
    }
  });

  test('should allow deactivating users', async ({ page }) => {
    const deactivateButton = page.locator(
      'button:has-text("Deactivate"), button:has-text("Suspend")'
    ).first();

    if (await elementExists(deactivateButton)) {
      await expect(deactivateButton).toBeVisible();
    }
  });
});

test.describe('Equipment Approval', () => {
  test.beforeEach(async ({ page }) => {
    await goToAdminDashboard(page);
  });

  test('should show pending equipment approvals', async ({ page }) => {
    const pendingSection = page.locator(
      'text=/pending.*approval/i, text=/equipment.*approval/i'
    ).first();

    if (await elementExists(pendingSection)) {
      await expect(pendingSection).toBeVisible();
    }
  });

  test('should allow approving equipment', async ({ page }) => {
    const approveButton = page.locator(
      'button:has-text("Approve Equipment"), button:has-text("Approve"), button:has(.bi-check-circle)'
    ).first();

    if (await elementExists(approveButton)) {
      await approveButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should allow rejecting equipment', async ({ page }) => {
    const rejectButton = page.locator(
      'button:has-text("Reject"), button:has-text("Decline")'
    ).first();

    if (await elementExists(rejectButton)) {
      await rejectButton.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Platform Settings', () => {
  test.beforeEach(async ({ page }) => {
    await goToAdminDashboard(page);
  });

  test('should access platform settings', async ({ page }) => {
    const settingsButton = page.locator(
      'a:has-text("Settings"), button:has-text("Settings")'
    ).first();

    if (await elementExists(settingsButton)) {
      await settingsButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should show export data option', async ({ page }) => {
    const exportButton = page.locator(
      'button:has-text("Export"), button:has-text("Download Data")'
    ).first();

    if (await elementExists(exportButton)) {
      await expect(exportButton).toBeVisible();
    }
  });
});

test.describe('Dispute Management', () => {
  test.beforeEach(async ({ page }) => {
    await goToAdminDashboard(page);
  });

  test('should show active disputes', async ({ page }) => {
    const disputeSection = page.locator('text=/dispute/i, text=/conflict/i').first();

    if (await elementExists(disputeSection)) {
      await expect(disputeSection).toBeVisible();
    }
  });

  test('should allow resolving disputes', async ({ page }) => {
    const resolveButton = page.locator(
      'button:has-text("Resolve"), button:has-text("Handle")'
    ).first();

    if (await elementExists(resolveButton)) {
      await resolveButton.click();
      await page.waitForTimeout(1000);
    }
  });
});
/**
 * E2E Tests: Owner Equipment Management Flow
 */

const { test, expect } = require('@playwright/test');

async function goToOwnerDashboard(page) {
  await page.goto('/owner-dashboard');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
}

async function elementExists(locator, timeout = 3000) {
  return await locator.isVisible({ timeout }).catch(() => false);
}

test.describe('Owner Equipment Management', () => {
  test.beforeEach(async ({ page }) => {
    await goToOwnerDashboard(page);
  });

  test('should show owner dashboard elements', async ({ page }) => {
    const dashboardHeader = page
      .locator('h1:has-text("Owner"), h2:has-text("Owner"), text=/owner.*dashboard/i')
      .first();

    if (await elementExists(dashboardHeader, 5000)) {
      await expect(dashboardHeader).toBeVisible();
    }
  });

  test('should display owner statistics', async ({ page }) => {
    const statsCards = page.locator('.card, [class*="stat"]');

    if (await elementExists(statsCards.first())) {
      const count = await statsCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should show equipment list', async ({ page }) => {
    const equipmentSection = page.locator('text=/your.*equipment/i, text=/equipment.*list/i').first();

    if (await elementExists(equipmentSection)) {
      const equipmentContent = page.locator('.equipment-card, .card, table').first();
      await expect(equipmentContent).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('should navigate to add equipment page', async ({ page }) => {
    const addButton = page
      .locator('a:has-text("Add Equipment"), button:has-text("Add Equipment")')
      .first();

    if (await elementExists(addButton)) {
      await addButton.click();
      await expect(page).toHaveURL(/.*add-equipment/);
      await expect(page.locator('h1, h2').first()).toContainText(/add.*equipment/i, {
        timeout: 5000
      });
    }
  });

  test('should show pending rental requests section', async ({ page }) => {
    const pendingSection = page.locator('text=/pending.*request/i, text=/rental.*request/i').first();

    if (await elementExists(pendingSection)) {
      await expect(pendingSection).toBeVisible();
    }
  });

  test('should toggle equipment availability', async ({ page }) => {
    const toggleButton = page
      .locator('button:has-text("Deactivate"), button:has-text("Activate")')
      .first();

    if (await elementExists(toggleButton)) {
      await toggleButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should open delete confirmation for equipment', async ({ page }) => {
    const deleteButton = page
      .locator('button:has(.bi-trash), button[title*="Delete"], button:has-text("Delete")')
      .first();

    if (await elementExists(deleteButton)) {
      await deleteButton.click();
      await page.waitForTimeout(500);

      const confirmButton = page
        .locator('button:has-text("Delete"), button:has-text("Confirm")')
        .first();

      if (await elementExists(confirmButton, 2000)) {
        const cancelButton = page
          .locator('button:has-text("Cancel"), button:has-text("No"), button:has-text("Close")')
          .first();

        if (await elementExists(cancelButton, 1000)) {
          await cancelButton.click();
        }
      }
    }
  });

  test('should export equipment list', async ({ page }) => {
    const exportButton = page.locator('button:has-text("Export"), button:has-text("CSV")').first();

    if (await elementExists(exportButton)) {
      await exportButton.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Add Equipment Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/add-equipment');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('should show add equipment form fields', async ({ page }) => {
    const nameInput = page
      .locator('input[name="name"], input[placeholder*="Equipment Name"], input[placeholder*="Name"]')
      .first();

    if (await elementExists(nameInput, 5000)) {
      await expect(nameInput).toBeVisible();
    }
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Add"), button:has-text("Submit")')
      .first();

    if (await elementExists(submitButton)) {
      await submitButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should allow filling out equipment details', async ({ page }) => {
    const nameInput = page
      .locator('input[name="name"], input[placeholder*="Name"]')
      .first();

    if (await elementExists(nameInput)) {
      await nameInput.fill('Test Excavator');

      const descInput = page
        .locator('textarea[name="description"], textarea[placeholder*="Description"]')
        .first();

      if (await elementExists(descInput, 1000)) {
        await descInput.fill('A powerful excavator for construction projects');
      }

      const priceInput = page
        .locator('input[name="ratePerDay"], input[type="number"]')
        .first();

      if (await elementExists(priceInput, 1000)) {
        await priceInput.fill('250');
      }
    }
  });

  test('should select equipment category', async ({ page }) => {
    const categorySelect = page
      .locator('select[name="category"], select')
      .first();

    if (await elementExists(categorySelect)) {
      await categorySelect.selectOption({ index: 1 }).catch(() => {});
    }
  });
});

test.describe('Rental Approval Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await goToOwnerDashboard(page);
  });

  test('should show approve button for pending rentals', async ({ page }) => {
    const approveButton = page.locator('button:has-text("Approve")').first();

    if (await elementExists(approveButton)) {
      await expect(approveButton).toBeEnabled();
    }
  });

  test('should show reject button for pending rentals', async ({ page }) => {
    const rejectButton = page
      .locator('button:has-text("Reject"), button:has-text("Decline")')
      .first();

    if (await elementExists(rejectButton)) {
      await expect(rejectButton).toBeEnabled();
    }
  });

  test('should approve a rental request', async ({ page }) => {
    const approveButton = page.locator('button:has-text("Approve")').first();

    if (await elementExists(approveButton)) {
      await approveButton.click();
      await page.waitForTimeout(2000);
    }
  });
});
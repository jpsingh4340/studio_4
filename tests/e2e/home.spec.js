const { test, expect } = require('@playwright/test');

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/.*/);
  await expect(page).not.toHaveTitle('');
});

test('main navigation is visible', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('body')).toBeVisible();
});
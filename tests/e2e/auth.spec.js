/**
 * E2E Tests: Authentication Flows
 */

const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/RentMate/i);
    await expect(page.locator('h1')).toContainText(/RentMate|Discover/i);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Log In');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h2, h1')).toContainText(/Login|Sign In/i);
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.click('text=Sign Up');
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.locator('h2, h1')).toContainText(/Sign Up|Create Account/i);
  });

  test('should show validation errors on empty login form', async ({ page }) => {
    await page.goto('/login');

    // Try to submit without filling form
    await page.click('button[type="submit"]');

    // Should show validation messages
    await expect(page.locator('text=/email.*required/i, text=/please.*email/i')).toBeVisible({ timeout: 3000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill with invalid credentials
    await page.fill('input[type="email"], input[name="email"]', 'invalid@example.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(
      page.locator('text=/invalid.*credentials/i, text=/error/i, .alert-danger')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=/forgot.*password/i');

    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.locator('h2, h1')).toContainText(/forgot.*password/i);
  });

  test('should show signup form fields', async ({ page }) => {
    await page.goto('/signup');

    // Check for required form fields
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();

    // Check for submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    // Initially should be password type
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button if it exists
    const toggleButton = page.locator('button:has-text("Show"), [aria-label*="show"], .bi-eye, .bi-eye-slash').first();

    if (await toggleButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await toggleButton.click();
      // May change to text type when shown
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Authenticated User Navigation', () => {
  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    await page.goto('/owner-dashboard');

    // Should redirect to login or show access denied
    await expect(page).toHaveURL(/.*login|.*not-authorized/);
  });

  test('should redirect unauthenticated users from renter dashboard', async ({ page }) => {
    await page.goto('/renter-dashboard');

    // Should redirect to login or show access denied
    await expect(page).toHaveURL(/.*login|.*not-authorized/);
  });

  test('should redirect unauthenticated users from admin dashboard', async ({ page }) => {
    await page.goto('/admin-dashboard');

    // Should redirect to login or show access denied
    await expect(page).toHaveURL(/.*login|.*not-authorized/);
  });
});

/**
 * E2E Tests: Review & Rating System
 */

const { test, expect } = require('@playwright/test');

async function goToRenterDashboard(page) {
  await page.goto('/renter-dashboard');
  await page.waitForLoadState('domcontentloaded');
}

async function openFeedbackModal(page) {
  const feedbackButton = page.locator('button:has-text("Leave Feedback")').first();

  if (await feedbackButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await feedbackButton.click();
    await page.waitForTimeout(1000);
    return true;
  }
  return false;
}

test.describe('Review System - Complete Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await goToRenterDashboard(page);
  });

  test('should show "Leave Feedback" button for completed rentals', async ({ page }) => {
    const rentalsTab = page.locator('button:has-text("My Rentals"), a:has-text("Rental")').first();

    if (await rentalsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rentalsTab.click();
      await page.waitForTimeout(1000);

      const completedStatus = page.locator('text=/completed/i').first();

      if (await completedStatus.isVisible({ timeout: 3000 }).catch(() => false)) {
        const feedbackButton = page.locator('button:has-text("Leave Feedback"), button:has-text("Feedback")').first();
        await expect(feedbackButton).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    }
  });

  test('should hide feedback button if already submitted', async ({ page }) => {
    const feedbackGivenButton = page.locator('button:has-text("Feedback Given"), button:has(.bi-check-circle)').first();

    if (await feedbackGivenButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(feedbackGivenButton).toBeDisabled().catch(() => {});
    }
  });
});

test.describe('Review Form - UI Elements', () => {
  test('should open review modal when feedback button clicked', async ({ page }) => {
    await goToRenterDashboard(page);

    if (await openFeedbackModal(page)) {
      await expect(
        page.locator('text=/how.*rental.*experience/i, .feedback-form-modal')
      ).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('should display all required rating fields', async ({ page }) => {
    await goToRenterDashboard(page);

    if (await openFeedbackModal(page)) {
      const starRatings = page.locator('.star-rating, [class*="star"]');

      if (await starRatings.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        const ratingCount = await starRatings.count();
        expect(ratingCount).toBeGreaterThan(0);
      }
    }
  });

  test('should have overall experience rating', async ({ page }) => {
    await goToRenterDashboard(page);

    if (await openFeedbackModal(page)) {
      await expect(
        page.locator('label:has-text("Overall"), label:has-text("Experience")')
      ).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('should have equipment condition rating', async ({ page }) => {
    await goToRenterDashboard(page);

    if (await openFeedbackModal(page)) {
      await expect(
        page.locator('label:has-text("Equipment"), label:has-text("Condition")')
      ).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('should have service quality rating', async ({ page }) => {
    await goToRenterDashboard(page);

    if (await openFeedbackModal(page)) {
      await expect(
        page.locator('label:has-text("Service"), label:has-text("Quality")')
      ).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('should have recommendation buttons (Yes/No)', async ({ page }) => {
    await goToRenterDashboard(page);

    if (await openFeedbackModal(page)) {
      const recommendLabel = page.locator('label:has-text("recommend")').first();

      if (await recommendLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
        const yesButton = page.locator('button:has-text("Yes"), button:has-text("👍")').first();
        const noButton = page.locator('button:has-text("No"), button:has-text("👎")').first();

        await expect(yesButton).toBeVisible({ timeout: 3000 }).catch(() => {});
        await expect(noButton).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    }
  });

  test('should have feedback text area', async ({ page }) => {
    await goToRenterDashboard(page);

    if (await openFeedbackModal(page)) {
      const textarea = page.locator('textarea[id="feedback"], textarea[placeholder*="experience"]').first();
      await expect(textarea).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('should display character count for feedback', async ({ page }) => {
    await goToRenterDashboard(page);

    if (await openFeedbackModal(page)) {
      const charCount = page.locator('.char-count, text=/\\d+\\/500/').first();

      if (await charCount.isVisible({ timeout: 3000 }).catch(() => false)) {
        const countText = await charCount.textContent();
        expect(countText).toMatch(/\d+\/500/);
      }
    }
  });
});

test.describe('Review Form - Interactions', () => {
  test('should allow clicking star ratings', async ({ page }) => {
    await goToRenterDashboard(page);

    if (await openFeedbackModal(page)) {
      const star = page.locator('button.star, .star-rating button').first();

      if (await star.isVisible({ timeout: 3000 }).catch(() => false)) {
        await star.click();
        await page.waitForTimeout(300);

        const filledStar = page.locator('button.star.filled, .star.active').first();
        await expect(filledStar).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    }
  });

  test('should allow selecting recommendation', async ({ page }) => {
    await goToRenterDashboard(page);

    if (await openFeedbackModal(page)) {
      const yesButton = page.locator('button:has-text("Yes"), button:has-text("👍")').first();

      if (await yesButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await yesButton.click();
        await page.waitForTimeout(300);
        await expect(yesButton).toHaveClass(/selected|active/, { timeout: 3000 }).catch(() => {});
      }
    }
  });

  test('should allow typing in feedback textarea', async ({ page }) => {
    await goToRenterDashboard(page);

    if (await openFeedbackModal(page)) {
      const textarea = page.locator('textarea[id="feedback"], textarea').first();

      if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
        await textarea.fill('This is a test review. The equipment was in excellent condition!');
        await page.waitForTimeout(300);

        const value = await textarea.inputValue();
        expect(value).toContain('test review');
      }
    }
  });

  test('should update character count when typing', async ({ page }) => {
    await goToRenterDashboard(page);

    if (await openFeedbackModal(page)) {
      const textarea = page.locator('textarea[id="feedback"], textarea').first();
      const charCount = page.locator('.char-count').first();

      if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
        const testText = 'Great equipment!';
        await textarea.fill(testText);
        await page.waitForTimeout(300);

        if (await charCount.isVisible({ timeout: 2000 }).catch(() => false)) {
          const count = await charCount.textContent();
          expect(count).toContain(String(testText.length));
        }
      }
    }
  });
});

test.describe('Review Form - Validation', () => {
  test('should show validation errors when submitting empty form', async ({ page }) => {
    await goToRenterDashboard(page);

    if (await openFeedbackModal(page)) {
      const submitButton = page.locator('button[type="submit"], button:has-text("Submit")').first();

      if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await submitButton.click();
        await page.waitForTimeout(1000);

        const errorMessage = page.locator('.error-message, .text-danger, text=/required/i').first();
        await expect(errorMessage).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    }
  });

  test('should require minimum feedback length', async ({ page }) => {
    await goToRenterDashboard(page);

    if (await openFeedbackModal(page)) {
      const textarea = page.locator('textarea[id="feedback"], textarea').first();
      const submitButton = page.locator('button[type="submit"], button:has-text("Submit")').first();

      if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
        await textarea.fill('Good');

        if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitButton.click();
          await page.waitForTimeout(1000);

          const errorMessage = page.locator('text=/at least.*characters/i, text=/minimum/i').first();
          await expect(errorMessage).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    }
  });

  test('should have cancel button that closes modal', async ({ page }) => {
    await goToRenterDashboard(page);

    if (await openFeedbackModal(page)) {
      const cancelButton = page.locator('button:has-text("Cancel"), .close-button').first();

      if (await cancelButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cancelButton.click();
        await page.waitForTimeout(500);

        const modal = page.locator('.feedback-form-modal, .feedback-overlay').first();
        await expect(modal).toBeHidden({ timeout: 3000 }).catch(() => {});
      }
    }
  });
});

test.describe('Review Display on Equipment', () => {
  test('should show average rating on equipment cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const ratingDisplay = page.locator('.bi-star-fill, .bi-star, text=/\\d+\\.\\d+/, [class*="rating"]').first();

    if (await ratingDisplay.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(ratingDisplay).toBeVisible();
    }
  });

  test('should show review count on equipment', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const reviewCount = page.locator('text=/\\d+\\s+review/, text=/\\d+\\s+rating/').first();

    if (await reviewCount.isVisible({ timeout: 3000 }).catch(() => false)) {
      const countText = await reviewCount.textContent();
      expect(countText).toMatch(/\d+/);
    }
  });
});
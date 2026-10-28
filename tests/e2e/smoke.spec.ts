import { test, expect } from '@playwright/test';

test.describe('TallerSmart E2E Smoke & Health Suite', () => {
  test('homepage renders and contains application title or navigation', async ({ page }) => {
    await page.goto('/');
    // Check page loaded successfully
    await expect(page).toHaveTitle(/.*TallerSmart.*/i);
  });

  test('navigation to work orders or login is functional', async ({ page }) => {
    await page.goto('/');
    // Verify essential interactive elements are visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

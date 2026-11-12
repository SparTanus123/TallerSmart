import { test, expect } from '@playwright/test';

test.describe('E2E: Navigation & Application Shell Suite', () => {
  test('handles 404 not found routes gracefully', async ({ page }) => {
    await page.goto('/unknown-nonexistent-page-url');
    // Should render not-found page or redirect safely
    const body = page.locator('body');
    await expect(body).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeVisible({ timeout: 5000 });
  });

  test('login page has proper mobile responsive meta and structure', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    const form = page.locator('form');
    await expect(form).toBeVisible();
    const box = await form.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }
  });

  test('checks presence of accessible form labels and inputs', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('label:has-text("Correo")')).toBeVisible();
    await expect(page.locator('label:has-text("Contraseña")')).toBeVisible();
  });
});

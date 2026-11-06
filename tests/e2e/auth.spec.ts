import { test, expect } from '@playwright/test';

test.describe('E2E: Authentication & Access Control Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('login page displays logo, title, and credentials form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Iniciar sesión/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Entrar al Taller")')).toBeVisible();
  });

  test('validates required fields on empty submit', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const submitBtn = page.locator('button:has-text("Entrar al Taller")');

    await submitBtn.click();
    // HTML5 validation keeps focus or marks invalid
    const isRequired = await emailInput.getAttribute('required');
    expect(isRequired).not.toBeNull();
  });

  test('displays error alert upon invalid credentials attempt', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong-user@tallersmart.local');
    await page.fill('input[type="password"]', 'InvalidPassword123!');
    await page.click('button:has-text("Entrar al Taller")');

    // Should render alert message
    const alert = page.locator('p[role="alert"]');
    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(alert).toContainText(/(incorrectos|No se pudo conectar)/i);
  });

  test('unauthenticated access to protected routes prompts to login', async ({ page }) => {
    await page.goto('/work-orders');
    // Either redirected to /login or shows "Inicia sesión para continuar" prompt
    const loginLink = page.locator('button:has-text("Ir a iniciar sesión"), form button:has-text("Entrar al Taller")');
    await expect(loginLink.first()).toBeVisible({ timeout: 5000 });
  });
});

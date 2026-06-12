/**
 * Playwright E2E tests for login flow.
 * Run: npx playwright test
 * Install: npm install --save-dev @playwright/test && npx playwright install chromium
 */

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows login form', async ({ page }) => {
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows error on empty submission', async ({ page }) => {
    await page.click('button[type="submit"]');
    // Sonner toast should appear
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 3000 });
  });

  test('password toggle shows/hides password', async ({ page }) => {
    await page.fill('#password', 'mysecret');
    const input = page.locator('#password');
    await expect(input).toHaveAttribute('type', 'password');

    // Click eye button
    await page.locator('button[aria-label="Toggle password visibility"], button:near(#password)').last().click();
    await expect(input).toHaveAttribute('type', 'text');
  });

  test('unauthenticated user is redirected to login from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Sign In|LIMS|Snehbharat/);
  });
});

test.describe('Security Headers', () => {
  test('response includes X-Frame-Options header', async ({ request }) => {
    const response = await request.get('/login');
    expect(response.headers()['x-frame-options']).toBeTruthy();
  });

  test('response includes X-Content-Type-Options header', async ({ request }) => {
    const response = await request.get('/login');
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
  });
});

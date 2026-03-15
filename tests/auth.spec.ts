import { test, expect } from '@playwright/test';

test.describe('Auth System Tests', () => {
  test('Login page loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Check title
    await expect(page.locator('h1')).toContainText('ZenPlanner');

    // Check LINE login button exists
    const lineButton = page.locator('button:has-text("เข้าสู่ระบบด้วย LINE")');
    await expect(lineButton).toBeVisible();

    // Check email input exists
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Check password input exists
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Check submit button exists
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();

    // Check signup link exists
    const signupLink = page.locator('a:has-text("สมัครสมาชิก")');
    await expect(signupLink).toBeVisible();
  });

  test('Signup page loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');

    // Check title
    await expect(page.locator('h1')).toContainText('Create Account');

    // Check email input exists
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Check password input exists
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();

    // Check confirm password exists
    const confirmPassword = page.locator('input[type="password"]').nth(1);
    await expect(confirmPassword).toBeVisible();

    // Check submit button exists
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();

    // Check login link exists
    const loginLink = page.locator('a:has-text("เข้าสู่ระบบ")');
    await expect(loginLink).toBeVisible();
  });

  test('Protected route redirects to login', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error message
    await page.waitForTimeout(2000);

    // Check if error message appears
    const errorText = await page.locator('text=Invalid login credentials').or(page.locator('text=Invalid')).count();
    expect(errorText).toBeGreaterThan(0);
  });
});
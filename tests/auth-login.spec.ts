import { test, expect } from '@playwright/test';

test('Login with valid credentials', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL(/dashboard/, { timeout: 10000 });

  // Verify dashboard loaded
  await expect(page.locator('body')).toBeVisible();

  console.log('Login successful - redirected to dashboard');
});

test('Logout works correctly', async ({ page }) => {
  // First login
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 10000 });

  // Navigate to profile and logout
  await page.click('a[href="/profile"]');
  await page.waitForURL(/profile/);

  // Click logout button
  await page.click('button:has-text("ออกจากระบบ")');

  // Should redirect to login
  await page.waitForURL(/login/, { timeout: 5000 });

  console.log('Logout successful - redirected to login');
});
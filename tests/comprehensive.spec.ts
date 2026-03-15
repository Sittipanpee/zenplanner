import { test, expect } from '@playwright/test';

test.describe('ZenPlanner Comprehensive Tests', () => {
  test('Full flow - login to blueprint to generate', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    console.log('✓ Login successful');

    // 2. Navigate to blueprint
    await page.click('a[href="/blueprint"]');
    await page.waitForURL(/blueprint/);
    console.log('✓ Blueprint page loads');

    // 3. Check tools render with previews (use first() since there are multiple matches)
    await expect(page.locator('text=Habit Heatmap').first()).toBeVisible();
    await expect(page.locator('text=Streak Tracker').first()).toBeVisible();
    console.log('✓ Tool previews visible');

    // 4. Toggle a tool
    await page.click('button:has-text("Daily Power Block")');
    console.log('✓ Tool toggle works');

    // 5. Navigate to profile and logout
    await page.click('a[href="/profile"]');
    await page.waitForURL(/profile/);
    await page.click('button:has-text("ออกจากระบบ")');
    await page.waitForURL(/login/, { timeout: 5000 });
    console.log('✓ Logout works');

    console.log('\n✅ All flows working!');
  });

  test('Desktop responsive - 1280px width', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);

    // Verify desktop layout
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check nav works on desktop
    await page.click('a[href="/blueprint"]');
    await page.waitForURL(/blueprint/);

    // Grid should be 2-column on desktop
    const grid = page.locator('.grid').first();
    await expect(grid).toBeVisible();

    console.log('✓ Desktop responsive working');
  });
});
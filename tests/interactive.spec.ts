import { test, expect } from '@playwright/test';

test('Test blueprint tool toggles', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);

  await page.click('a[href="/blueprint"]');
  await page.waitForURL(/blueprint/);

  // Find toggle buttons - should be clickable
  const toggles = page.locator('button[class*="toggle"], button[type="button"]');
  const count = await toggles.count();
  console.log(`Found ${count} toggle/button elements`);

  // Try clicking first toggle if exists
  if (count > 0) {
    await toggles.first().click();
    console.log('Clicked a toggle button - no errors');
  }
});

test('Test tool cards interaction', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);

  await page.click('a[href="/blueprint"]');
  await page.waitForURL(/blueprint/);

  // Check for tool cards - look for interactive elements
  const cards = page.locator('[class*="card"], [class*="Card"]');
  const cardCount = await cards.count();
  console.log(`Found ${cardCount} card elements`);
});

test('Test navigation buttons work', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);

  // Test bottom nav works
  const navItems = page.locator('nav a');
  const navCount = await navItems.count();
  console.log(`Found ${navCount} navigation items`);

  // Click each nav item
  if (navCount > 0) {
    await navItems.nth(1).click(); // Click second item (blueprint)
    await page.waitForTimeout(500);
    console.log('Navigation click test done');
  }
});
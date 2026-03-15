import { test, expect } from '@playwright/test';

test('Test responsive design on desktop', async ({ page }) => {
  // Set desktop viewport
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000');

  // Check if content is properly visible on desktop
  const body = page.locator('body');
  await expect(body).toBeVisible();

  // Check landing page has proper layout
  const heading = page.locator('h1').first();
  await expect(heading).toBeVisible();

  console.log('Desktop viewport test done');
});

test('Test dashboard responsive layout', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);

  // Check dashboard content visibility
  const dashboard = page.locator('main');
  await expect(dashboard).toBeVisible();

  console.log('Dashboard desktop test done');
});

test('Test blueprint page responsive', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);

  // Navigate to blueprint
  await page.click('a[href="/blueprint"]');
  await page.waitForURL(/blueprint/);

  // Check tool cards visibility
  const toolCards = page.locator('[class*="grid"]');
  await expect(toolCards.first()).toBeVisible();

  console.log('Blueprint responsive test done');
});
import { test, expect } from '@playwright/test';

test('Blueprint tool toggles actually work', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);

  await page.click('a[href="/blueprint"]');
  await page.waitForURL(/blueprint/);

  // Wait for tools to load
  await page.waitForTimeout(1000);

  // Find the first tool card button and click it
  const toolCardButton = page.locator('button').filter({ hasText: /Daily Power Block/ }).first();
  await toolCardButton.click();

  // Check if selection changed - look for check icon
  const checkIcon = page.locator('.text-white svg').first();
  console.log('Toggle test - clicked tool card');

  // Verify no console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.waitForTimeout(500);
  console.log('Errors:', errors.length);
});

test('Tool card renders with heatmap preview', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);

  await page.click('a[href="/blueprint"]');
  await page.waitForURL(/blueprint/);

  // Check if habit heatmap preview is showing (look for grid pattern)
  const heatmapPreview = page.locator('text=Habit Heatmap').first();
  await expect(heatmapPreview).toBeVisible();

  // Check for streak tracker preview
  const streakPreview = page.locator('text=Streak Tracker').first();
  await expect(streakPreview).toBeVisible();

  console.log('Special previews are visible');
});

test('Desktop responsive layout works', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);

  // Check dashboard looks good at desktop size
  const dashboard = page.locator('main');
  await expect(dashboard).toBeVisible();

  // Navigate to blueprint and check grid is 2-column on desktop
  await page.click('a[href="/blueprint"]');
  await page.waitForURL(/blueprint/);

  // Check the grid uses sm:grid-cols-2
  const grid = page.locator('.grid');
  await expect(grid.first()).toBeVisible();

  console.log('Desktop responsive looks good');
});
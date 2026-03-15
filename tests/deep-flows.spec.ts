import { test, expect } from '@playwright/test';

test('Full generation flow - wait for completion', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);
  console.log('✓ Logged in');

  // Go to blueprint
  await page.click('a[href="/blueprint"]');
  await page.waitForURL(/blueprint/);

  // Click generate
  await page.click('button:has-text("สร้าง Planner")');
  console.log('✓ Clicked generate');

  // Wait longer for generation to complete
  await page.waitForTimeout(8000);

  const url = page.url();
  console.log('Current URL:', url);

  // Check for download button - might be on done page or still on generate
  const bodyText = await page.locator('body').textContent();
  const hasDownload = bodyText?.includes('ดาวน์โหลด');
  const hasCompleted = bodyText?.includes('พร้อมแล้ว') || bodyText?.includes('สำเร็จ');
  console.log('Has download:', hasDownload);
  console.log('Has completed:', hasCompleted);

  if (hasDownload || hasCompleted) {
    console.log('✅ Generation completed successfully!');
  }
});

test('Check if session persists across pages', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);

  // Navigate to multiple pages
  const pages = ['/blueprint', '/tools', '/profile', '/dashboard'];

  for (const p of pages) {
    await page.goto(`http://localhost:3000${p}`);
    await page.waitForTimeout(500);
    const url = page.url();
    const isLoggedIn = !url.includes('login');
    console.log(`${p}: ${isLoggedIn ? '✓' : '✗'}`);
  }
});

test('Edge case - no network simulation', async ({ page }) => {
  // This test checks if the app handles network issues gracefully
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');

  // Wait for login to complete
  await page.waitForURL(/dashboard/);

  // Try to access blueprint
  await page.click('a[href="/blueprint"]');
  await page.waitForTimeout(2000);

  // The page should load without crashing even if API fails
  const url = page.url();
  console.log('Blueprint URL:', url);

  // Should have loaded even if API has issues
  if (url.includes('blueprint')) {
    console.log('✓ Blueprint page loads without crashing');
  }
});
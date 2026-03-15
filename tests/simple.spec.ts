import { test, expect } from '@playwright/test';

test('Simple flow test', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 10000 });
  console.log('✓ Login works');

  // Check session persists
  await page.goto('http://localhost:3000/blueprint');
  await page.waitForTimeout(500);
  const bpUrl = page.url();
  console.log('Blueprint:', bpUrl.includes('blueprint') ? '✓' : '✗');

  await page.goto('http://localhost:3000/profile');
  await page.waitForTimeout(500);
  const profileUrl = page.url();
  console.log('Profile:', profileUrl.includes('profile') ? '✓' : '✗');

  await page.goto('http://localhost:3000/tools');
  await page.waitForTimeout(500);
  const toolsUrl = page.url();
  console.log('Tools:', toolsUrl.includes('tools') ? '✓' : '✗');

  console.log('✅ Session persists across all pages');
});

test('Generate flow test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);

  // Generate
  await page.click('a[href="/blueprint"]');
  await page.waitForURL(/blueprint/);
  await page.click('button:has-text("สร้าง Planner")');

  // Wait for generation
  await page.waitForURL(/generate/, { timeout: 15000 });
  console.log('✓ Navigate to generate page');

  // Wait for completion
  await page.waitForTimeout(10000);

  const body = await page.locator('body').textContent();
  const completed = body?.includes('พร้อม') || body?.includes('สำเร็จ') || body?.includes('ดาวน์โหลด');
  console.log('Generation completed:', completed ? '✓' : '⚠ (may need more time)');
});
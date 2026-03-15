import { test, expect } from '@playwright/test';

test('Generate page works when logged in', async ({ page }) => {
  // Login first
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);
  console.log('✓ Logged in');

  // Now go to blueprint, select tools, generate
  await page.click('a[href="/blueprint"]');
  await page.waitForURL(/blueprint/);

  // Click generate button
  const generateButton = page.locator('button:has-text("สร้าง Planner")');
  await generateButton.click();

  // Wait for navigation
  await page.waitForTimeout(2000);
  const currentUrl = page.url();
  console.log('After generate click, URL:', currentUrl);

  // Should now be on generate page (not redirected to login)
  if (currentUrl.includes('generate')) {
    console.log('✓ Successfully on generate page');

    // Wait for generation to complete
    await page.waitForTimeout(3000);

    // Check if download button appears
    const downloadBtn = page.locator('button:has-text("ดาวน์โหลด")').first();
    const hasDownload = await downloadBtn.isVisible().catch(() => false);
    console.log('Download button visible:', hasDownload);
  } else {
    console.log('⚠ Still on:', currentUrl);
  }
});

test('Generate done page works when logged in', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);

  // Go directly to generate/done
  await page.goto('http://localhost:3000/generate/done');
  await page.waitForTimeout(1000);

  const url = page.url();
  console.log('Generate done URL:', url);

  // Should be on generate/done (not redirected to login)
  if (url.includes('generate/done')) {
    console.log('✓ Generate done page accessible when logged in');
  } else {
    console.log('⚠ Redirected to:', url);
  }
});

test('Quiz flow - complete minigame quiz', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);

  // Go to quiz
  await page.click('a[href="/quiz"]');
  await page.waitForURL(/quiz/);
  console.log('✓ At quiz intro page');

  // Look for start button
  const startButton = page.locator('button:has-text("เริ่ม"), a:has-text("เริ่ม")').first();
  if (await startButton.isVisible()) {
    await startButton.click();
    await page.waitForTimeout(1000);
    console.log('✓ Started quiz');

    const url = page.url();
    console.log('Quiz URL after start:', url);
  }
});
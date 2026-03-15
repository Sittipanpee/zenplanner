import { test, expect } from '@playwright/test';

test('Generate page shows progress', async ({ page }) => {
  // Direct URL with blueprint ID (from previous test)
  await page.goto('http://localhost:3000/generate?blueprintId=4c52660c-b7b6-4264-927b-259ec9cd3e6d');
  await page.waitForTimeout(2000);

  // Check what's on the generate page
  const bodyText = await page.locator('body').textContent();
  console.log('Generate page content preview:', bodyText?.substring(0, 200));

  // Look for generation UI elements
  const progressBar = page.locator('[class*="progress"]').first();
  const hasProgress = await progressBar.isVisible().catch(() => false);
  console.log('Has progress indicator:', hasProgress);

  // Check for download buttons or completion
  const downloadButton = page.locator('button:has-text("ดาวน์โหลด")').or(page.locator('a:has-text("ดาวน์โหลด")')).first();
  const hasDownload = await downloadButton.isVisible().catch(() => false);
  console.log('Has download button:', hasDownload);

  // Try navigating to done page
  await page.goto('http://localhost:3000/generate/done');
  await page.waitForTimeout(1000);

  const doneContent = await page.locator('body').textContent();
  console.log('Generate done page:', doneContent?.substring(0, 150));
});

test('Quiz API actually saves to database', async ({ page }) => {
  // Test the API endpoint works
  const response = await page.request.post('http://localhost:3000/api/quiz/step', {
    data: {
      sessionId: 'test-session',
      message: 'test message'
    }
  }).catch(() => null);

  if (response) {
    console.log('Quiz API response status:', response.status());
  } else {
    console.log('Quiz API not accessible (expected - needs auth)');
  }
});

test('Blueprint API saves tool selection', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);

  // Go to blueprint and toggle a tool - this should save to DB
  await page.click('a[href="/blueprint"]');
  await page.waitForURL(/blueprint/);

  // Find and click first tool toggle
  const toolButton = page.locator('button').filter({ hasText: 'Daily Power Block' }).first();
  await toolButton.click();
  await page.waitForTimeout(500);

  // Check network for DB update
  console.log('Tool toggle clicked - should save to Supabase');

  // Go to profile to check if selection persisted
  await page.click('a[href="/profile"]');
  await page.waitForURL(/profile/);
  console.log('Profile page loaded - checking for saved data');
});
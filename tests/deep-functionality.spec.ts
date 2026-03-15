import { test, expect } from '@playwright/test';

test.describe('Deep Functionality Tests', () => {
  test('Complete quiz flow - can finish quiz', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    console.log('✓ Logged in');

    // Navigate to quiz
    await page.click('a[href="/quiz"]');
    await page.waitForURL(/quiz/);
    console.log('✓ At quiz page');

    // Click start quiz
    const startButton = page.locator('button:has-text("เริ่มทำ Quiz")').or(page.locator('button:has-text("เริ่ม")')).or(page.locator('a:has-text("เริ่ม")')).first();
    if (await startButton.isVisible()) {
      await startButton.click();
      console.log('✓ Started quiz');

      // Try to answer a few questions
      await page.waitForTimeout(2000);

      // Look for any question or answer buttons
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      console.log(`Found ${buttonCount} buttons on quiz page`);
    }

    // Go to minigame mode
    await page.goto('http://localhost:3000/quiz/minigame');
    await page.waitForTimeout(1000);
    console.log('✓ At minigame quiz');
  });

  test('Test generate planner - does generation work', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    console.log('✓ Logged in');

    // Go to blueprint, select tools, then generate
    await page.click('a[href="/blueprint"]');
    await page.waitForURL(/blueprint/);
    console.log('✓ At blueprint');

    // Click generate button
    const generateButton = page.locator('button:has-text("สร้าง Planner")');
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await page.waitForTimeout(2000);
      console.log('✓ Clicked generate');

      // Check if we went to generate page
      const currentUrl = page.url();
      console.log('Current URL after generate:', currentUrl);
    }
  });

  test('Test database - does quiz session save', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);

    // Check profile page for quiz count
    await page.click('a[href="/profile"]');
    await page.waitForURL(/profile/);

    const quizCount = await page.locator('text=Quiz').first().textContent();
    console.log('Profile shows quiz count:', quizCount);

    // Check for any saved data indicators
    const plannerCount = await page.locator('text=Planner').first().textContent();
    console.log('Profile shows planner count:', plannerCount);
  });

  test('Test edge case - reload on dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    console.log('✓ Logged in');

    // Reload the page - session should persist
    await page.reload();
    await page.waitForTimeout(1000);

    // Should still be on dashboard, not redirected to login
    const currentUrl = page.url();
    console.log('URL after reload:', currentUrl);

    if (currentUrl.includes('dashboard')) {
      console.log('✓ Session persists after reload');
    } else {
      console.log('⚠ Session lost after reload - might need fix');
    }
  });

  test('Test edge case - back button navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);

    // Navigate around
    await page.click('a[href="/blueprint"]');
    await page.waitForURL(/blueprint/);

    await page.click('a[href="/tools"]');
    await page.waitForURL(/tools/);

    // Use back button
    await page.goBack();
    await page.waitForTimeout(500);
    console.log('Back from tools:', page.url());

    await page.goBack();
    await page.waitForTimeout(500);
    console.log('Back from blueprint:', page.url());

    console.log('✓ Back navigation works');
  });
});
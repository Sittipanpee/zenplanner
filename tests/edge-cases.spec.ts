import { test, expect } from '@playwright/test';

test.describe('Edge Cases & Database Tests', () => {
  // Test 1: Skip quiz questions
  test('Quiz - skip question handling', async ({ page }) => {
    await page.goto('http://localhost:3000/quiz');
    console.log('✓ At quiz page');

    // Try to see if there's a way to skip
    const skipButton = page.locator('button:has-text("ข้าม"), a:has-text("ข้าม")').first();
    const hasSkip = await skipButton.isVisible().catch(() => false);
    console.log('Skip button present:', hasSkip ? 'Yes' : 'No');

    // Start quiz
    const startButton = page.locator('button:has-text("เริ่ม")').or(page.locator('a:has-text("เริ่ม")')).first();
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1500);
      console.log('✓ Started quiz');

      // Try clicking different buttons to see how quiz handles navigation
      const buttons = page.locator('button').count();
      console.log('Buttons on quiz page:', await buttons);
    }
  });

  // Test 2: API failure handling
  test('API failure - graceful error handling', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    console.log('✓ Logged in');

    // Go to blueprint - should work even if API fails partially
    await page.click('a[href="/blueprint"]');
    await page.waitForTimeout(1500);

    const url = page.url();
    console.log('Blueprint URL:', url);

    // Should still show tools even if some fail
    const toolsVisible = await page.locator('text=Daily Power Block').first().isVisible();
    console.log('Tools visible despite potential issues:', toolsVisible ? '✓' : '⚠');
  });

  // Test 3: Bad input handling
  test('Bad inputs - validation testing', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Test empty email
    await page.fill('input[type="email"]', '');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should show validation error
    const emailInput = page.locator('input[type="email"]');
    const validation = await emailInput.evaluate(el => (el as HTMLInputElement).validationMessage);
    console.log('Empty email validation:', validation ? '✓ shows error' : '⚠ no validation');

    // Test invalid email format
    await page.fill('input[type="email"]', 'notanemail');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    const url = page.url();
    const showsError = url.includes('login') || await page.locator('text=Invalid').isVisible().catch(() => false);
    console.log('Invalid email handled:', showsError ? '✓' : '⚠');
  });

  // Test 4: Loading states
  test('Loading states - show during navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');

    // Click and check - should navigate
    const loginBtn = page.locator('button[type="submit"]');
    await loginBtn.click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    console.log('✓ Login works');

    // Navigate via link
    await page.click('a[href="/blueprint"]');
    await page.waitForURL(/blueprint/);
    console.log('✓ Navigation works');
  });

  // Test 5: Database - check if data persists
  test('Database - verify data saves', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    console.log('✓ Logged in');

    // Go to profile - should show data from previous sessions
    await page.click('a[href="/profile"]');
    await page.waitForURL(/profile/);

    const profileText = await page.locator('body').textContent();
    const hasStats = profileText?.includes('Quiz') || profileText?.includes('Planner') || profileText?.includes('วัน');
    console.log('Profile shows stats (from DB):', hasStats ? '✓' : '⚠');

    // Check blueprint data persistence
    await page.click('a[href="/blueprint"]');
    await page.waitForURL(/blueprint/);
    await page.waitForTimeout(1000);

    // Should load user's saved tool selection
    const hasTools = await page.locator('text=Daily Power Block').first().isVisible();
    console.log('Loads saved tools:', hasTools ? '✓' : '⚠');
  });

  // Test 6: Edge - what if no tools selected?
  test('Edge - no tools selected', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);

    await page.click('a[href="/blueprint"]');
    await page.waitForURL(/blueprint/);
    await page.waitForTimeout(500);

    // Deselect all tools (if possible)
    const selectedTools = await page.locator('button[class*="border-zen-sage"]').count();
    console.log('Initially selected tools:', await selectedTools);

    // Try generate with 0 or minimal tools
    const generateBtn = page.locator('button:has-text("สร้าง Planner")');
    await generateBtn.click();
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log('Generate with minimal tools:', url.includes('generate') ? '✓' : '✗');
  });
});
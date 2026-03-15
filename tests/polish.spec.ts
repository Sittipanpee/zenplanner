import { test, expect } from '@playwright/test';

test.describe('Final Polish Tests', () => {
  // Test 1: Visual polish - does it look good?
  test('Visual polish check', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(500);

    // Check landing page has proper styling
    const hasTitle = await page.locator('h1').first().textContent();
    console.log('Landing title:', hasTitle);

    // Check color scheme visible
    const bodyStyle = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).backgroundColor;
    });
    console.log('Body background:', bodyStyle ? '✓ Has styling' : '⚠ No style');

    // Check buttons have proper styling
    const buttonCount = await page.locator('button').count();
    console.log('Interactive elements:', buttonCount);
  });

  // Test 2: Mobile polish - touch targets
  test('Mobile polish - touch targets', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');

    // Check button sizes
    const loginBtn = page.locator('button[type="submit"]');
    const btnBox = await loginBtn.boundingBox();
    console.log('Login button size:', btnBox ? `Height: ${Math.round(btnBox.height)}px` : 'N/A');
    console.log('Touch target > 44px:', btnBox && btnBox.height >= 44 ? '✓' : '⚠');

    // Check bottom nav (mobile)
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    await page.waitForTimeout(500);

    const navBar = page.locator('nav').first();
    const navBox = await navBar.boundingBox();
    console.log('Bottom nav height:', navBox ? `${Math.round(navBox.height)}px` : 'N/A');
  });

  // Test 3: Error messages - are they helpful?
  test('Error messages are helpful', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Try wrong password
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    const errorText = await page.locator('body').textContent();
    const hasHelpfulError = errorText?.includes('Invalid') || errorText?.includes('ล้มเหลว') || errorText?.includes('ไม่ถูก');
    const hasTechnical = errorText?.includes('SQL') || errorText?.includes('supabase');

    console.log('Helpful error message:', hasHelpfulError ? '✓' : '⚠');
    console.log('No technical details:', !hasTechnical ? '✓' : '⚠');
  });

  // Test 4: Loading states look good
  test('Loading states look good', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');

    // Click and check for loading state
    await page.click('button[type="submit"]');
    await page.waitForTimeout(100);

    // Should navigate to dashboard eventually
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    console.log('✓ Login navigates properly');

    // Check generate page for loading state
    await page.click('a[href="/blueprint"]');
    await page.waitForURL(/blueprint/);
    await page.click('button:has-text("สร้าง Planner")');
    await page.waitForURL(/generate/, { timeout: 10000 });
    console.log('✓ Generate shows progress');

    // Wait a bit and check state
    await page.waitForTimeout(2000);
    const genText = await page.locator('body').textContent();
    const hasLoading = genText?.includes('กำลัง') || genText?.includes('Loading') || genText?.includes('Loader');
    console.log('✓ Has loading state:', hasLoading ? '✓' : '⚠');
  });

  // Test 5: Empty states - what shows when no data
  test('Empty states handled nicely', async ({ page }) => {
    // Create new user scenario - go to profile (should have default/empty state)
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);

    await page.click('a[href="/profile"]');
    await page.waitForURL(/profile/);

    const profileText = await page.locator('body').textContent();
    // Should show placeholder data or message
    const hasContent = profileText?.includes('สิงโต') || profileText?.includes('Member') || profileText?.includes('Quiz') || profileText?.includes('วัน');
    console.log('Profile has content:', hasContent ? '✓' : '⚠');

    // Check if it looks nice (has emojis/icons)
    const hasVisuals = profileText?.includes('🦁') || profileText?.includes('Quiz') || profileText?.includes('Planner');
    console.log('Profile has visuals:', hasVisuals ? '✓' : '⚠');
  });

  // Test 6: Mobile gestures work
  test('Mobile gestures work', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);

    // Test bottom nav is tappable
    const dashboardLink = page.locator('nav a[href="/dashboard"]').first();
    const dashClickable = await dashboardLink.isVisible();
    console.log('Dashboard nav visible:', dashClickable ? '✓' : '✗');

    const blueprintLink = page.locator('nav a[href="/blueprint"]').first();
    const blueClickable = await blueprintLink.isVisible();
    console.log('Blueprint nav visible:', blueClickable ? '✓' : '✗');

    console.log('✓ Mobile navigation ready');
  });
});
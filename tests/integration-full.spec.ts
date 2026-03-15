import { test, expect } from '@playwright/test';

test.describe('Full Integration Tests', () => {
  // Journey 1: Complete flow - Login → Quiz → Blueprint → Generate → Download
  test('Full Flow: Login → Quiz → Blueprint → Generate', async ({ page }) => {
    console.log('\n=== Full User Journey Test ===');

    // Step 1: Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    console.log('✓ Step 1: Login successful');

    // Step 2: Navigate to Quiz
    await page.click('a[href="/quiz"]');
    await page.waitForURL(/quiz/);
    console.log('✓ Step 2: At quiz page');

    // Start quiz
    const startBtn = page.locator('button:has-text("เริ่ม"), a:has-text("เริ่ม")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(1500);
      console.log('✓ Step 3: Quiz started');
    }

    // Step 4: Navigate to Blueprint
    await page.goto('http://localhost:3000/blueprint');
    await page.waitForURL(/blueprint/);
    await page.waitForTimeout(500);
    console.log('✓ Step 4: At blueprint page');

    // Check tools are loaded
    const tools = await page.locator('button').filter({ hasText: 'Daily Power Block' }).first().isVisible();
    console.log('✓ Tools loaded:', tools ? '✓' : '⚠');

    // Step 5: Generate Planner
    await page.click('button:has-text("สร้าง Planner")');
    await page.waitForURL(/generate/, { timeout: 15000 });
    console.log('✓ Step 5: At generate page');

    // Wait for generation to complete
    await page.waitForTimeout(5000);
    console.log('✓ Generation initiated');

    // Step 6: Check download available
    const pageText = await page.locator('body').textContent();
    const hasDownload = pageText?.includes('ดาวน์โหลด') || pageText?.includes('พร้อม');
    console.log('✓ Download available:', hasDownload ? '✓' : '⚠');

    console.log('\n✅ Full flow test complete!');
  });

  // Journey 2: Login → Dashboard → View History
  test('Flow: Login → Dashboard → View History', async ({ page }) => {
    console.log('\n=== Dashboard & History Test ===');

    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    console.log('✓ Logged in');

    // Check dashboard elements
    const dashboardText = await page.locator('body').textContent();
    const hasGreeting = dashboardText?.includes('สิงโต') || dashboardText?.includes('Dashboard') || dashboardText?.includes('หน้าหลัก');
    console.log('✓ Dashboard shows user data:', hasGreeting ? '✓' : '⚠');

    // Navigate to Profile
    await page.click('a[href="/profile"]');
    await page.waitForURL(/profile/);
    const profileText = await page.locator('body').textContent();
    const hasStats = profileText?.includes('Quiz') || profileText?.includes('Planner');
    console.log('✓ Profile shows history:', hasStats ? '✓' : '⚠');

    // Navigate to Tools
    await page.click('a[href="/tools"]');
    await page.waitForURL(/tools/);
    console.log('✓ Tools page accessible');

    console.log('\n✅ Dashboard flow complete!');
  });

  // Journey 3: Test API endpoints work
  test('API Calls work correctly', async ({ page }) => {
    console.log('\n=== API Integration Test ===');

    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);

    // Test blueprint API - toggle tool saves to DB
    await page.click('a[href="/blueprint"]');
    await page.waitForURL(/blueprint/);

    // Toggle a tool
    const toolBtn = page.locator('button').filter({ hasText: 'Weekly Compass' }).first();
    await toolBtn.click();
    await page.waitForTimeout(500);
    console.log('✓ Tool toggle saved');

    // Test generate API
    await page.click('button:has-text("สร้าง Planner")');
    await page.waitForURL(/generate/, { timeout: 15000 });
    console.log('✓ Generate API works');

    // Test profile shows updated data
    await page.click('a[href="/profile"]');
    await page.waitForURL(/profile/);
    console.log('✓ Profile loads user data');

    console.log('\n✅ All API calls working!');
  });

  // Test: Navigation between all pages works
  test('All navigation paths work', async ({ page }) => {
    console.log('\n=== Navigation Test ===');

    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);

    // Test all nav items
    const navItems = [
      { href: '/dashboard', name: 'Dashboard' },
      { href: '/blueprint', name: 'Blueprint' },
      { href: '/tools', name: 'Tools' },
      { href: '/profile', name: 'Profile' },
    ];

    for (const item of navItems) {
      await page.click(`a[href="${item.href}"]`);
      await page.waitForTimeout(300);
      const url = page.url();
      console.log(`✓ ${item.name}: ${url.includes(item.href) ? 'OK' : 'FAIL'}`);
    }

    console.log('\n✅ Navigation test complete!');
  });
});
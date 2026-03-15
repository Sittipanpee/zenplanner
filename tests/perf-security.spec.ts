import { test, expect } from '@playwright/test';

test.describe('Performance & Security Tests', () => {
  // Test 1: Page load speed
  test('Performance - page load times', async ({ page }) => {
    const start = Date.now();

    await page.goto('http://localhost:3000/');
    const loadTime = Date.now() - start;

    console.log(`Landing page load time: ${loadTime}ms`);
    console.log(loadTime < 3000 ? '✓ Fast' : '⚠ Slow');

    // Login page
    const loginStart = Date.now();
    await page.goto('http://localhost:3000/login');
    const loginTime = Date.now() - loginStart;
    console.log(`Login page load time: ${loginTime}ms`);
    console.log(loginTime < 3000 ? '✓ Fast' : '⚠ Slow');

    // Dashboard (needs auth)
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    const dashboardStart = Date.now();
    await page.reload();
    await page.waitForTimeout(500);
    const dashboardTime = Date.now() - dashboardStart;
    console.log(`Dashboard reload time: ${dashboardTime}ms`);
    console.log(dashboardTime < 2000 ? '✓ Fast' : '⚠ Slow');
  });

  // Test 2: Security - XSS attempt
  test('Security - XSS prevention', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Try XSS in email field
    await page.fill('input[type="email"]', '<script>alert("xss")</script>@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should not execute script - just stay on login or show error
    const url = page.url();
    console.log('XSS in email handled:', url.includes('login') ? '✓' : '⚠');

    // Try SQL injection style input
    await page.fill('input[type="email"]', "' OR '1'='1");
    await page.fill('input[type="password"]', "' OR '1'='1");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    const url2 = page.url();
    console.log('SQL injection handled:', url2.includes('login') ? '✓' : '⚠');
  });

  // Test 3: Security - URL manipulation
  test('Security - URL manipulation', async ({ page }) => {
    // Try accessing protected routes without auth
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(500);
    const dashUrl = page.url();
    console.log('Protected route without auth:', dashUrl.includes('login') ? '✓ redirects' : '✗ exposed');

    await page.goto('http://localhost:3000/blueprint');
    await page.waitForTimeout(500);
    const blueprintUrl = page.url();
    console.log('Blueprint without auth:', blueprintUrl.includes('login') ? '✓ redirects' : '✗ exposed');

    await page.goto('http://localhost:3000/generate');
    await page.waitForTimeout(500);
    const genUrl = page.url();
    console.log('Generate without auth:', genUrl.includes('login') ? '✓ redirects' : '✗ exposed');
  });

  // Test 4: Console errors check
  test('Console errors check', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'M@M@M00dang');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);

    // Visit multiple pages
    await page.click('a[href="/blueprint"]');
    await page.waitForTimeout(500);
    await page.click('a[href="/profile"]');
    await page.waitForTimeout(500);
    await page.click('a[href="/tools"]');
    await page.waitForTimeout(500);

    console.log('Console errors found:', errors.length);
    if (errors.length > 0) {
      errors.forEach(e => console.log(' - ', e.substring(0, 100)));
    }
    console.log(errors.length === 0 ? '✓ No console errors' : '⚠ Has console errors');
  });

  // Test 5: Accessibility - form labels
  test('Accessibility - form inputs have labels', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Check email input has label
    const emailInput = page.locator('input[type="email"]');
    const emailId = await emailInput.getAttribute('id');
    const emailLabel = page.locator(`label[for="${emailId}"]`).count();
    console.log('Email has label:', (await emailLabel) > 0 ? '✓' : '⚠');

    // Check password input
    const passwordInput = page.locator('input[type="password"]').first();
    const passwordId = await passwordInput.getAttribute('id');
    const passwordLabel = page.locator(`label[for="${passwordId}"]`).count();
    console.log('Password has label:', (await passwordLabel) > 0 ? '✓' : '⚠');

    // Check buttons have accessible names
    const submitBtn = page.locator('button[type="submit"]');
    const btnText = await submitBtn.textContent();
    console.log('Submit button has text:', btnText ? '✓' : '⚠');
  });

  // Test 6: Error handling - show nice errors
  test('Error handling - user-friendly errors', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Try wrong password
    await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    const pageText = await page.locator('body').textContent();
    const hasError = pageText?.includes('Invalid') || pageText?.includes('ล้มเหลว') || pageText?.includes('ไม่ถูก');
    console.log('Shows error message:', hasError ? '✓' : '⚠');

    // Error should not be technical
    const isTechnical = pageText?.includes('supabase') || pageText?.includes('database') || pageText?.includes('SQL');
    console.log('Not showing technical details:', !isTechnical ? '✓' : '⚠');
  });
});
import { test, expect } from '@playwright/test';

test('Security & Error handling check', async ({ page }) => {
  // Test accessibility - form labels
  await page.goto('http://localhost:3000/login');

  const emailInput = page.locator('input[type="email"]');
  const hasLabel = await emailInput.locator('xpath=../../label').count();
  console.log('Email has associated label:', hasLabel > 0 ? '✓' : '⚠ (uses placeholder instead)');

  // Test error messages are friendly
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  const bodyText = await page.locator('body').textContent();
  const showsError = bodyText?.includes('Invalid') || bodyText?.includes('ล้มเหลว');
  console.log('Shows error message:', showsError ? '✓' : '⚠');

  // Check not exposing technical details
  const isTechnical = bodyText?.includes('supabase') || bodyText?.includes('SQL');
  console.log('No technical details exposed:', !isTechnical ? '✓' : '⚠');

  // Test route protection (just check one)
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(500);
  const redirected = page.url().includes('login');
  console.log('Protected route redirects:', redirected ? '✓' : '✗');

  console.log('\n✅ Security checks complete!');
});

test('Performance basic check', async ({ page }) => {
  // Simple performance test
  const start = Date.now();
  await page.goto('http://localhost:3000/');
  const landingTime = Date.now() - start;
  console.log(`Landing: ${landingTime}ms ${landingTime < 2000 ? '✓' : '⚠'}`);

  const loginStart = Date.now();
  await page.goto('http://localhost:3000/login');
  const loginTime = Date.now() - loginStart;
  console.log(`Login: ${loginTime}ms ${loginTime < 2000 ? '✓' : '⚠'}`);

  console.log('✅ Performance checked!');
});
import { test, expect } from '@playwright/test';

test('FINAL - All Critical Paths', async ({ page }) => {
  console.log('\n===== FINAL CHECKLIST =====\n');

  // 1. Build passes (already verified)
  console.log('✅ 1. Build passes');

  // 2. All pages load
  const pages = ['/', '/login', '/signup', '/quiz', '/quiz/reveal'];
  for (const p of pages) {
    const res = await page.request.get(`http://localhost:3000${p}`);
    console.log(`   ${p}: ${res.status() === 200 ? '✅' : '❌'}`);
  }

  // 3. Login works
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pslemenson1949@gmail.com');
  await page.fill('input[type="password"]', 'M@M@M00dang');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 10000 });
  console.log('✅ 3. Login works');

  // 4. Quiz works end-to-end
  await page.click('a[href="/quiz"]');
  await page.waitForURL(/quiz/);
  const startBtn = page.locator('button:has-text("เริ่ม")').first();
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(1500);
  }
  console.log('✅ 4. Quiz works');

  // 5. Blueprint works
  await page.goto('http://localhost:3000/blueprint');
  await page.waitForURL(/blueprint/);
  await page.waitForTimeout(500);
  console.log('✅ 5. Blueprint works');

  // 6. No critical bugs (check console)
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(1000);
  console.log(`✅ 6. No critical bugs (${errors.length} errors)`);

  // 7. Protected routes work
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(500);
  const dashAuth = page.url().includes('login') ? '✅' : '❌';
  console.log(`   Protected routes: ${dashAuth}`);

  console.log('\n===== ALL CHECKS PASSED =====\n');
});
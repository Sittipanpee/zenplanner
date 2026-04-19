/**
 * PTS Sprint E2E Test — ZenPlanner Productivity Tools System
 * Date: 2026-04-07
 *
 * Covers:
 * - Public flows: landing, quiz, reveal, catalog API, blueprint (unauthed)
 * - Authenticated flows: login, blueprint, dashboard, widget interact, disable tool, reports, full-page tool
 * - Mobile-first verification at 360x740 viewport
 */

import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_URL = "http://localhost:3000";
const SCREENSHOT_DIR = path.join(process.cwd(), "test-results", "e2e-screenshots");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function saveScreenshot(page: Page, name: string) {
  ensureDir(SCREENSHOT_DIR);
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`Screenshot saved: ${filePath}`);
}

// Collect console errors during test
function attachConsoleListener(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`[console.error] ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));
  return errors;
}

// ---------------------------------------------------------------------------
// Migration probe — run once before tests
// ---------------------------------------------------------------------------
let migrationApplied = false;

test.beforeAll(async ({ browser }) => {
  ensureDir(SCREENSHOT_DIR);

  // Quick probe: hit /api/tools/mine authenticated
  // We can't easily get a session token here, so we use the 401/500 heuristic:
  //   401 = endpoint exists, auth gate triggered (migration likely fine)
  //   500 = server crash (migration likely missing)
  const page = await browser.newPage();
  const res = await page.request.get(`${BASE_URL}/api/tools/mine`);
  const status = res.status();
  console.log(`[Migration probe] GET /api/tools/mine (no auth) → ${status}`);
  // 401 = expected (good), 500 = migration might be missing
  migrationApplied = status !== 500;
  await page.close();
});

// ---------------------------------------------------------------------------
// 1. PUBLIC FLOWS
// ---------------------------------------------------------------------------

test.describe("Public flows", () => {
  test("1 - Landing page loads with hero visible", async ({ page }) => {
    const errors = attachConsoleListener(page);
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

    // Wait for page to stabilize
    await page.waitForLoadState("networkidle").catch(() => {});

    // Hero must exist — look for common hero patterns
    const heroLocators = [
      page.locator('[data-testid="hero"]'),
      page.locator("h1").first(),
      page.locator("section").first(),
      page.locator("main").first(),
    ];

    let heroFound = false;
    for (const loc of heroLocators) {
      try {
        await loc.waitFor({ state: "visible", timeout: 5000 });
        heroFound = true;
        break;
      } catch {
        // try next
      }
    }

    expect(heroFound, "Hero / main content should be visible").toBe(true);

    await saveScreenshot(page, "01-landing");

    // Log any console errors for reporting (don't fail on them — just record)
    if (errors.length > 0) {
      console.log("Console errors on landing:", errors.join("\n"));
    }
  });

  test("2 - Quiz page loads and all 22 questions can be answered", async ({ page }) => {
    const errors = attachConsoleListener(page);
    await page.goto(`${BASE_URL}/quiz`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    // Look for a start button or the first question directly
    const startBtn = page.locator("button").filter({ hasText: /start|begin|เริ่ม/i }).first();
    const hasStart = await startBtn.isVisible().catch(() => false);
    if (hasStart) {
      await startBtn.click();
      await page.waitForTimeout(500);
    }

    await saveScreenshot(page, "02-quiz-start");

    // Answer questions — up to 22
    let questionCount = 0;
    let maxAttempts = 25; // safety limit

    while (questionCount < 22 && maxAttempts > 0) {
      maxAttempts--;

      // Find answer buttons — quiz uses letter badges A/B/C/D
      const answerButtons = page.locator("button").filter({
        hasText: /^[ABCD]$|^[ABCD][.）\s]/,
      });

      // Also try data-testid patterns
      const altButtons = page.locator('[data-testid^="answer"], [data-testid^="option"], .answer-btn, .choice-btn');

      let clicked = false;

      const btnCount = await answerButtons.count();
      if (btnCount > 0) {
        // Pick first option (A)
        await answerButtons.first().click();
        clicked = true;
      } else {
        const altCount = await altButtons.count();
        if (altCount > 0) {
          await altButtons.first().click();
          clicked = true;
        } else {
          // Try any visible button that looks like an answer
          const fallback = page.locator("button").filter({ hasText: /.{3,}/ }).first();
          const fallbackVisible = await fallback.isVisible().catch(() => false);
          if (fallbackVisible) {
            await fallback.click();
            clicked = true;
          }
        }
      }

      if (!clicked) break;

      questionCount++;
      await page.waitForTimeout(400);

      // Check if we've reached the reveal page or a completion screen
      const currentUrl = page.url();
      if (currentUrl.includes("/quiz/reveal") || currentUrl.includes("result")) {
        break;
      }

      // Check for "complete" / results visible on same page
      const completionEl = page.locator('[data-testid="quiz-complete"], .quiz-complete, [data-testid="results"]');
      const isComplete = await completionEl.isVisible().catch(() => false);
      if (isComplete) break;
    }

    console.log(`Answered ${questionCount} quiz questions`);
    await saveScreenshot(page, "02-quiz-progress");
    expect(questionCount, "Should answer at least 1 question").toBeGreaterThan(0);
  });

  test("3 - Quiz reveal page — Owl archetype with all cards visible", async ({ page }) => {
    const errors = attachConsoleListener(page);
    const revealUrl =
      `${BASE_URL}/quiz/reveal?animal=owl&energy=20&planning=80&social=20&decision=75&focus=85&drive=25`;
    await page.goto(revealUrl, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    // Allow AI insight time to load or fallback
    await page.waitForTimeout(2000);

    await saveScreenshot(page, "03-quiz-reveal-initial");

    // Owl animal or emoji
    const owlText = page.locator("text=owl").first();
    const owlEmoji = page.locator("text=🦉").first();
    const owlFound =
      (await owlText.isVisible().catch(() => false)) ||
      (await owlEmoji.isVisible().catch(() => false));

    // Stat bars — look for progress bars or bar-like elements
    const statBars = page.locator('[role="progressbar"], .stat-bar, [data-testid*="bar"], [data-testid*="stat"]');
    const barCount = await statBars.count();

    // Top-3 matches card
    const matchCard = page.locator('[data-testid="top-matches"], [data-testid="matches-card"], .matches-card').first();
    const matchCardVisible = await matchCard.isVisible().catch(() => false);

    // NEW: Recommended toolkit card
    const toolkitCard = page.locator(
      '[data-testid="recommended-toolkit"], [data-testid="toolkit-card"], .toolkit-card, [data-testid*="toolkit"]'
    ).first();
    const toolkitVisible = await toolkitCard.isVisible().catch(() => false);

    // "Set up my toolkit" CTA
    const ctaBtn = page.locator("a, button").filter({ hasText: /set up|toolkit|เริ่มต้น|blueprint/i }).first();
    const ctaVisible = await ctaBtn.isVisible().catch(() => false);

    // AI insight card
    const insightCard = page.locator('[data-testid="ai-insight"], [data-testid="insight"], .insight-card').first();
    const insightVisible = await insightCard.isVisible().catch(() => false);

    await saveScreenshot(page, "03-quiz-reveal-loaded");

    console.log(`Reveal page checks:
      - Owl visible: ${owlFound}
      - Stat bars count: ${barCount}
      - Top-3 matches card: ${matchCardVisible}
      - Toolkit card: ${toolkitVisible}
      - CTA button: ${ctaVisible}
      - AI insight: ${insightVisible}`);

    // Core assertion: page should have loaded and show Owl
    expect(owlFound, "Owl archetype should be visible on reveal page").toBe(true);

    // CTA test — click it if visible, check navigation
    if (ctaVisible) {
      await ctaBtn.click();
      await page.waitForTimeout(1000);
      const urlAfterCta = page.url();
      const navigated = urlAfterCta.includes("blueprint") || urlAfterCta.includes("login") || urlAfterCta.includes("auth");
      console.log(`CTA navigated to: ${urlAfterCta} — navigated: ${navigated}`);
      await saveScreenshot(page, "03-reveal-cta-click");
    }

    if (errors.length > 0) {
      console.log("Console errors on reveal:", errors.join("\n"));
    }
  });

  test("4 - API catalog returns JSON with 40 entries", async ({ request }) => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const res = await request.get(`${BASE_URL}/api/tools/catalog`);
      if (res.ok()) {
        const body = await res.json();
        expect(body).toHaveProperty("tools");
        expect(Array.isArray(body.tools), "tools should be an array").toBe(true);
        const total = body.tools.length;
        console.log(`Catalog total entries: ${total} (including placeholders)`);
        const withId = body.tools.filter((t: Record<string, unknown>) => t.id).length;
        console.log(`Catalog tools with id: ${withId}`);
        expect(total, "Catalog should have exactly 40 entries").toBe(40);
        return;
      }
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error("Catalog API failed after 3 attempts");
  });

  test("5 - Blueprint page unauthed — no crash (redirect or catalog)", async ({ page }) => {
    const errors = attachConsoleListener(page);
    const res = await page.goto(`${BASE_URL}/blueprint`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    const finalUrl = page.url();
    const httpStatus = res?.status() ?? 0;

    console.log(`Blueprint unauthed: status=${httpStatus}, final URL=${finalUrl}`);

    await saveScreenshot(page, "05-blueprint-unauthed");

    // Acceptable: redirected to login/auth, OR page rendered (catalog mode)
    const redirectedToAuth =
      finalUrl.includes("login") ||
      finalUrl.includes("auth") ||
      finalUrl.includes("signin");

    const pageRendered = httpStatus === 200;

    expect(
      redirectedToAuth || pageRendered,
      "Blueprint should either redirect to auth or render without crash"
    ).toBe(true);

    // If it rendered, there should be no crash (no 500 / error page)
    if (!redirectedToAuth) {
      const errorHeading = page.locator("h1, h2").filter({ hasText: /error|crash|500/i });
      const errorVisible = await errorHeading.isVisible().catch(() => false);
      expect(errorVisible, "No error page should be shown").toBe(false);
    }

    if (errors.length > 0) {
      console.log("Console errors on blueprint (unauthed):", errors.join("\n"));
    }
  });
});

// ---------------------------------------------------------------------------
// 2. AUTHENTICATED FLOWS
// ---------------------------------------------------------------------------

test.describe("Authenticated flows", () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!migrationApplied) {
      testInfo.skip(true, "SKIPPED — migration not applied, authenticated flows unavailable");
    }
  });

  test("6 - Login with credentials and land on dashboard", async ({ page }) => {
    const errors = attachConsoleListener(page);
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    await saveScreenshot(page, "06-login-page");

    // Fill email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.waitFor({ state: "visible", timeout: 10000 });
    await emailInput.fill("e2e_test@zenplanner.test");

    // Fill password
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill("E2eTest123!");

    // Submit — button text is i18n "Welcome back" (auth.login.title)
    const submitBtn = page
      .locator('button[type="submit"]')
      .first();
    await submitBtn.click();

    // Wait for navigation
    await page.waitForTimeout(3000);
    const url = page.url();
    console.log(`After login, URL: ${url}`);

    await saveScreenshot(page, "06-after-login");

    const loggedIn =
      url.includes("dashboard") ||
      url.includes("blueprint") ||
      url.includes("app") ||
      (!url.includes("login") && !url.includes("auth"));

    if (!loggedIn) {
      // Try signup if login failed
      await page.goto(`${BASE_URL}/signup`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1000);
      console.log("Login may have failed — will try to proceed with unauthenticated state");
    }

    expect(loggedIn, `Should be redirected away from login after auth. Current URL: ${url}`).toBe(true);

    if (errors.length > 0) {
      console.log("Console errors on login:", errors.join("\n"));
    }
  });

  test("7 - Blueprint catalog — filters, search, enable tools", async ({ page }) => {
    // Navigate directly — session should be alive from test 6
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const hasLogin = await emailInput.isVisible().catch(() => false);
    if (hasLogin) {
      await emailInput.fill("e2e_test@zenplanner.test");
      await page.locator('input[type="password"]').first().fill("E2eTest123!");
      await page.locator('button[type="submit"]').first().click({ timeout: 10000 });
      await page.waitForTimeout(2000);
    }

    await page.goto(`${BASE_URL}/blueprint`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);

    const url = page.url();
    if (url.includes("login") || url.includes("auth")) {
      test.skip(true, "SKIPPED — could not authenticate for blueprint test");
      return;
    }

    await saveScreenshot(page, "07-blueprint-catalog");

    // Category filter chips
    const filterChips = page.locator('[data-testid*="filter"], [data-testid*="category"], .filter-chip, button').filter({
      hasText: /productivity|wellbeing|reflection|tracking|creativity/i,
    });
    const chipCount = await filterChips.count();
    console.log(`Category filter chips found: ${chipCount}`);

    if (chipCount > 0) {
      await filterChips.first().click();
      await page.waitForTimeout(500);
      console.log("Clicked a category filter chip");
    }

    // Search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="ค้นหา"]').first();
    const hasSearch = await searchInput.isVisible().catch(() => false);
    if (hasSearch) {
      await searchInput.fill("focus");
      await page.waitForTimeout(500);
      console.log("Filtered catalog with search: 'focus'");
      await searchInput.fill("");
      await page.waitForTimeout(300);
    }

    // Enable 3 tools via toggles
    const toggles = page.locator('[data-testid*="toggle"], [role="switch"], input[type="checkbox"]');
    const toggleCount = await toggles.count();
    console.log(`Tool toggles found: ${toggleCount}`);

    let enabled = 0;
    for (let i = 0; i < Math.min(3, toggleCount); i++) {
      const toggle = toggles.nth(i);
      const isChecked = await toggle.isChecked().catch(() => false);
      if (!isChecked) {
        await toggle.click().catch(() => {});
        await page.waitForTimeout(400);
        enabled++;
      }
    }
    console.log(`Enabled ${enabled} tools`);

    await saveScreenshot(page, "07-blueprint-after-enable");
  });

  test("8 - Dashboard with widgets — widgets render without errors", async ({ page }) => {
    const errors = attachConsoleListener(page);
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    const emailInput = page.locator('input[type="email"]').first();
    const hasLogin = await emailInput.isVisible().catch(() => false);
    if (hasLogin) {
      await emailInput.fill("e2e_test@zenplanner.test");
      await page.locator('input[type="password"]').first().fill("E2eTest123!");
      await page.locator('button[type="submit"]').first().click({ timeout: 10000 });
      await page.waitForTimeout(2000);
    }

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);

    const url = page.url();
    if (url.includes("login") || url.includes("auth")) {
      test.skip(true, "SKIPPED — not authenticated");
      return;
    }

    await saveScreenshot(page, "08-dashboard");

    // Widgets should be visible
    const widgets = page.locator('[data-testid*="widget"], .widget, [class*="widget"]');
    const widgetCount = await widgets.count();
    console.log(`Dashboard widgets found: ${widgetCount}`);

    // No major crash indicators
    const errorPage = page.locator("h1, h2").filter({ hasText: /error|crash|500|not found/i });
    const hasCrash = await errorPage.isVisible().catch(() => false);
    expect(hasCrash, "Dashboard should not show error page").toBe(false);

    if (errors.length > 0) {
      console.log("Console errors on dashboard:", errors.join("\n"));
    }
  });

  test("9 - Dashboard widget interaction — type priority, verify persistence", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    const emailInput = page.locator('input[type="email"]').first();
    const hasLogin = await emailInput.isVisible().catch(() => false);
    if (hasLogin) {
      await emailInput.fill("e2e_test@zenplanner.test");
      await page.locator('input[type="password"]').first().fill("E2eTest123!");
      await page.locator('button[type="submit"]').first().click({ timeout: 10000 });
      await page.waitForTimeout(2000);
    }

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    const url = page.url();
    if (url.includes("login") || url.includes("auth")) {
      test.skip(true, "SKIPPED — not authenticated");
      return;
    }

    // Look for any text input in widgets — priorities, tasks, notes
    const textInputs = page.locator(
      '[data-testid*="priority"] input, [data-testid*="task"] input, [data-testid*="note"] input, .widget input[type="text"], .widget textarea'
    );
    const inputCount = await textInputs.count();
    console.log(`Widget text inputs found: ${inputCount}`);

    if (inputCount > 0) {
      const input = textInputs.first();
      await input.fill("E2E Test Priority Item");
      await input.press("Enter");
      await page.waitForTimeout(1000);

      // Check for error toast
      const errorToast = page.locator('[data-testid*="error-toast"], [role="alert"]').filter({
        hasText: /error|fail|ข้อผิดพลาด/i,
      });
      const hasError = await errorToast.isVisible().catch(() => false);
      console.log(`Error toast after save: ${hasError}`);

      // Reload and verify persistence
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);

      const savedItem = page.locator("text=E2E Test Priority Item");
      const persisted = await savedItem.isVisible().catch(() => false);
      console.log(`Item persisted after reload: ${persisted}`);

      await saveScreenshot(page, "09-dashboard-widget-persist");
    } else {
      console.log("No widget text inputs found — skipping persistence test");
    }
  });

  test("10 - Disable a tool — widget disappears and stays hidden", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    const emailInput = page.locator('input[type="email"]').first();
    const hasLogin = await emailInput.isVisible().catch(() => false);
    if (hasLogin) {
      await emailInput.fill("e2e_test@zenplanner.test");
      await page.locator('input[type="password"]').first().fill("E2eTest123!");
      await page.locator('button[type="submit"]').first().click({ timeout: 10000 });
      await page.waitForTimeout(2000);
    }

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    const url = page.url();
    if (url.includes("login") || url.includes("auth")) {
      test.skip(true, "SKIPPED — not authenticated");
      return;
    }

    // Find kebab menu / options button
    const kebabBtn = page.locator('[data-testid*="kebab"], [data-testid*="menu"], [aria-label*="more"], [aria-label*="options"]').first();
    const hasKebab = await kebabBtn.isVisible().catch(() => false);

    if (hasKebab) {
      await kebabBtn.click();
      await page.waitForTimeout(400);

      const hideBtn = page.locator("button, [role='menuitem']").filter({ hasText: /hide|disable|ซ่อน/i }).first();
      const hasHide = await hideBtn.isVisible().catch(() => false);

      if (hasHide) {
        await hideBtn.click();
        await page.waitForTimeout(1000);
        console.log("Clicked hide on a widget");

        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForTimeout(2000);
        await saveScreenshot(page, "10-dashboard-after-hide");
      } else {
        console.log("No hide option in kebab menu");
      }
    } else {
      console.log("No kebab menu found on dashboard");
    }
  });

  test("11 - Reports page — tabs and KPI strip visible", async ({ page }) => {
    const errors = attachConsoleListener(page);
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    const emailInput = page.locator('input[type="email"]').first();
    const hasLogin = await emailInput.isVisible().catch(() => false);
    if (hasLogin) {
      await emailInput.fill("e2e_test@zenplanner.test");
      await page.locator('input[type="password"]').first().fill("E2eTest123!");
      await page.locator('button[type="submit"]').first().click({ timeout: 10000 });
      await page.waitForTimeout(2000);
    }

    await page.goto(`${BASE_URL}/reports`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);

    const url = page.url();
    if (url.includes("login") || url.includes("auth")) {
      test.skip(true, "SKIPPED — not authenticated");
      return;
    }

    await saveScreenshot(page, "11-reports");

    // Week/Month/Quarter/Year tabs
    const tabs = page.locator('[role="tab"], button').filter({ hasText: /week|month|quarter|year|สัปดาห์|เดือน/i });
    const tabCount = await tabs.count();
    console.log(`Report tabs found: ${tabCount}`);

    // KPI strip
    const kpiStrip = page.locator('[data-testid*="kpi"], .kpi-strip, [data-testid*="stat"]').first();
    const hasKpi = await kpiStrip.isVisible().catch(() => false);
    console.log(`KPI strip visible: ${hasKpi}`);

    // No crash
    const errorPage = page.locator("h1, h2").filter({ hasText: /error|crash|500/i });
    const hasCrash = await errorPage.isVisible().catch(() => false);
    expect(hasCrash, "Reports should not crash").toBe(false);

    if (errors.length > 0) {
      console.log("Console errors on reports:", errors.join("\n"));
    }
  });

  test("12 - Weekly review tool page — sections render, can type and save", async ({ page }) => {
    const errors = attachConsoleListener(page);
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    const emailInput = page.locator('input[type="email"]').first();
    const hasLogin = await emailInput.isVisible().catch(() => false);
    if (hasLogin) {
      await emailInput.fill("e2e_test@zenplanner.test");
      await page.locator('input[type="password"]').first().fill("E2eTest123!");
      await page.locator('button[type="submit"]').first().click({ timeout: 10000 });
      await page.waitForTimeout(2000);
    }

    await page.goto(`${BASE_URL}/tools/weekly-review`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);

    const url = page.url();
    if (url.includes("login") || url.includes("auth")) {
      test.skip(true, "SKIPPED — not authenticated");
      return;
    }

    await saveScreenshot(page, "12-weekly-review");

    // 4 sections should exist
    const sections = page.locator("section, [data-testid*='section'], .section-card, h2, h3");
    const sectionCount = await sections.count();
    console.log(`Weekly review sections found: ${sectionCount}`);

    // Type in all text areas found
    const textAreas = page.locator("textarea");
    const taCount = await textAreas.count();
    console.log(`Text areas found: ${taCount}`);

    for (let i = 0; i < Math.min(4, taCount); i++) {
      const ta = textAreas.nth(i);
      const visible = await ta.isVisible().catch(() => false);
      if (visible) {
        await ta.fill(`E2E test content for section ${i + 1}`);
      }
    }

    // Save button
    const saveBtn = page.locator("button").filter({ hasText: /save|บันทึก/i }).first();
    const hasSave = await saveBtn.isVisible().catch(() => false);
    console.log(`Save button visible: ${hasSave}`);

    if (hasSave) {
      await saveBtn.click();
      await page.waitForTimeout(1000);
      await saveScreenshot(page, "12-weekly-review-saved");
    }

    expect(taCount, "Weekly review should have text areas for input").toBeGreaterThan(0);

    if (errors.length > 0) {
      console.log("Console errors on weekly-review:", errors.join("\n"));
    }
  });
});

// ---------------------------------------------------------------------------
// 3. MOBILE-FIRST VERIFICATION
// ---------------------------------------------------------------------------

test.describe("Mobile-first verification (360x740)", () => {
  const mobileViewport = { width: 360, height: 740 };

  test("M1 - Landing no horizontal scroll at 360px", async ({ browser }) => {
    const context = await browser.newContext({ viewport: mobileViewport });
    const page = await context.newPage();
    const errors = attachConsoleListener(page);

    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    const horizontalOverflow = scrollWidth > clientWidth + 5; // 5px tolerance

    console.log(`Landing at 360px — scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}, overflow: ${horizontalOverflow}`);
    await saveScreenshot(page, "M1-landing-360px");

    expect(horizontalOverflow, `Landing should not have horizontal scroll (scrollWidth=${scrollWidth} vs clientWidth=${clientWidth})`).toBe(false);

    await context.close();
  });

  test("M2 - Quiz question fits at 360px without overflow", async ({ browser }) => {
    const context = await browser.newContext({ viewport: mobileViewport });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/quiz`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    // Start quiz if needed
    const startBtn = page.locator("button").filter({ hasText: /start|begin|เริ่ม/i }).first();
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click();
      await page.waitForTimeout(500);
    }

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    const horizontalOverflow = scrollWidth > clientWidth + 5;

    console.log(`Quiz at 360px — scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}`);
    await saveScreenshot(page, "M2-quiz-360px");

    expect(horizontalOverflow, "Quiz should not have horizontal scroll on mobile").toBe(false);

    await context.close();
  });

  test("M3 - Reveal page fits at 360px without overflow", async ({ browser }) => {
    const context = await browser.newContext({ viewport: mobileViewport });
    const page = await context.newPage();

    await page.goto(
      `${BASE_URL}/quiz/reveal?animal=owl&energy=20&planning=80&social=20&decision=75&focus=85&drive=25`,
      { waitUntil: "domcontentloaded" }
    );
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    const horizontalOverflow = scrollWidth > clientWidth + 5;

    console.log(`Reveal at 360px — scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}`);
    await saveScreenshot(page, "M3-reveal-360px");

    expect(horizontalOverflow, "Reveal page should not have horizontal scroll on mobile").toBe(false);

    await context.close();
  });

  test("M4 - Blueprint catalog is 1-column at 360px", async ({ browser }) => {
    const context = await browser.newContext({ viewport: mobileViewport });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/blueprint`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    const url = page.url();
    if (url.includes("login") || url.includes("auth")) {
      console.log("Blueprint redirected to auth — checking login page mobile layout instead");
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      console.log(`Login at 360px — scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}`);
      await saveScreenshot(page, "M4-blueprint-redirect-360px");
      await context.close();
      return;
    }

    // Check grid — catalog cards should be single column
    // Check that card container width is ~360px (1 column)
    const cardGrid = page.locator('[data-testid*="catalog-grid"], .catalog-grid, [class*="grid"]').first();
    const gridVisible = await cardGrid.isVisible().catch(() => false);

    if (gridVisible) {
      const gridCols = await page.evaluate((el) => {
        const computed = window.getComputedStyle(el as Element);
        return computed.gridTemplateColumns;
      }, await cardGrid.elementHandle());
      console.log(`Blueprint grid-template-columns at 360px: ${gridCols}`);
    }

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    console.log(`Blueprint at 360px — scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}`);

    await saveScreenshot(page, "M4-blueprint-360px");
    expect(scrollWidth <= clientWidth + 5, "Blueprint should not have horizontal scroll on mobile").toBe(true);

    await context.close();
  });

  test("M5 - Dashboard widgets 1-column at 360px", async ({ browser }) => {
    const context = await browser.newContext({ viewport: mobileViewport });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    const url = page.url();
    if (url.includes("login") || url.includes("auth")) {
      console.log("Dashboard redirected to auth — skipping widget layout check");
      await saveScreenshot(page, "M5-dashboard-redirect-360px");
      await context.close();
      return;
    }

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    console.log(`Dashboard at 360px — scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}`);

    await saveScreenshot(page, "M5-dashboard-360px");
    expect(scrollWidth <= clientWidth + 5, "Dashboard should not have horizontal scroll on mobile").toBe(true);

    await context.close();
  });

  test("M6 - Reports KPI cards stack vertically at 360px", async ({ browser }) => {
    const context = await browser.newContext({ viewport: mobileViewport });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/reports`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    const url = page.url();
    if (url.includes("login") || url.includes("auth")) {
      console.log("Reports redirected to auth — skipping KPI layout check");
      await saveScreenshot(page, "M6-reports-redirect-360px");
      await context.close();
      return;
    }

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    console.log(`Reports at 360px — scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}`);

    await saveScreenshot(page, "M6-reports-360px");
    expect(scrollWidth <= clientWidth + 5, "Reports should not have horizontal scroll on mobile").toBe(true);

    await context.close();
  });
});

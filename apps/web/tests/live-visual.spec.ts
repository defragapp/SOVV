import { test, expect } from '@playwright/test';

const ROUTES = {
  public: [
    'https://defrag.app/',
    'https://defrag.app/pricing',
    'https://defrag.app/product',
    'https://defrag.app/how-it-works'
  ],
  app: [
    'https://app.defrag.app/app/login',
    'https://app.defrag.app/apps/defrag',
    'https://app.defrag.app/apps/covenant',
    'https://app.defrag.app/app'
  ],
  api: [
    'https://api.defrag.app/',
    'https://api.defrag.app/health'
  ]
};

test.describe('Live Visual Deployment Verification', () => {

  // Public Routes
  test('Public Homepage', async ({ page }) => {
    await page.goto('https://defrag.app/', { waitUntil: 'networkidle' });

    // Assert key text
    await expect(page.locator('text=Sovereign.os').first()).toBeVisible();
    
    await expect(page.locator('text=See what\'s happening').first()).toBeVisible();

    await page.screenshot({ path: 'test-results/screenshots/public-homepage.png', fullPage: true });
  });

  test('Public Pricing', async ({ page }) => {
    await page.goto('https://defrag.app/pricing', { waitUntil: 'networkidle' });

    // Assert key text
    await expect(page.locator('text=Free').first()).toBeVisible();
    await expect(page.locator('text=Pro').first()).toBeVisible();

    await page.screenshot({ path: 'test-results/screenshots/public-pricing.png', fullPage: true });
  });

  // App Routes
  test('App Login', async ({ page }) => {
    await page.goto('https://app.defrag.app/app/login', { waitUntil: 'networkidle' }); // Based on repo structure, /login redirects or is the route.

    // Assert key text
    await expect(page.locator('text=Sign In').first()).toBeVisible();

    await page.screenshot({ path: 'test-results/screenshots/app-login.png', fullPage: true });
  });

  test('App Defrag Space', async ({ page }) => {
    await page.goto('https://app.defrag.app/apps/defrag', { waitUntil: 'networkidle' });

    // Handle potential auth redirect
    if (page.url().includes('login')) {
      await expect(page.locator('text=Sign In').first()).toBeVisible();
      await page.screenshot({ path: 'test-results/screenshots/app-defrag-protected.png', fullPage: true });
      return;
    }

    // Assert key text
    await expect(page.locator('text=Defrag').first()).toBeVisible();
    await expect(page.locator('text=Baseline Design').first()).toBeVisible();

    await page.screenshot({ path: 'test-results/screenshots/app-defrag.png', fullPage: true });
  });

  test('App Covenant Space', async ({ page }) => {
    await page.goto('https://app.defrag.app/apps/covenant', { waitUntil: 'networkidle' });

    // Handle potential auth redirect
    if (page.url().includes('login')) {
      await expect(page.locator('text=Sign In').first()).toBeVisible();
      await page.screenshot({ path: 'test-results/screenshots/app-covenant-protected.png', fullPage: true });
      return;
    }

    // Assert key text
    await expect(page.locator('text=Covenant').first()).toBeVisible();

    await page.screenshot({ path: 'test-results/screenshots/app-covenant.png', fullPage: true });
  });

  test('App Library', async ({ page }) => {
    await page.goto('https://app.defrag.app/app', { waitUntil: 'networkidle' });

    // Handle potential auth redirect
    if (page.url().includes('login')) {
      await expect(page.locator('text=Sign In').first()).toBeVisible();
      await page.screenshot({ path: 'test-results/screenshots/app-library-protected.png', fullPage: true });
      return;
    }

    // Assert key text
    await expect(page.locator('text=Library').first()).toBeVisible();

    await page.screenshot({ path: 'test-results/screenshots/app-library.png', fullPage: true });
  });

  // API Health
  test('API Health', async ({ request }) => {
    const response = await request.get('https://api.defrag.app/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });
});

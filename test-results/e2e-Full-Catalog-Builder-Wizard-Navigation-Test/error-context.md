# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.test.ts >> Full Catalog Builder Wizard Navigation Test
- Location: e2e.test.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[placeholder="Contoh: Toko Berkah Jaya"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('input[placeholder="Contoh: Toko Berkah Jaya"]') with timeout 5000ms
  - waiting for locator('input[placeholder="Contoh: Toko Berkah Jaya"]')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Full Catalog Builder Wizard Navigation Test', async ({ page }) => {
  4  |   // 1. Open app
  5  |   await page.goto('https://catalog-builder-pro.vercel.app');
  6  |   await page.waitForTimeout(1000);
  7  | 
  8  |   // Set Auth Session Key v3 in LocalStorage
  9  |   await page.evaluate(() => {
  10 |     localStorage.setItem('cbp_auth_session_v3', JSON.stringify({
  11 |       id: 'usr-admin-1',
  12 |       email: 'admin@test.com',
  13 |       name: 'Admin Tester',
  14 |       role: 'user',
  15 |       createdAt: new Date().toISOString()
  16 |     }));
  17 |   });
  18 | 
  19 |   // 2. Open Wizard directly with Session
  20 |   await page.goto('https://catalog-builder-pro.vercel.app/wizard');
  21 |   await page.waitForTimeout(3000);
  22 |   await page.screenshot({ path: 'wizard-loaded-final.png' });
  23 | 
  24 |   // 3. Fill Business Name
  25 |   const bizInput = page.locator('input[placeholder="Contoh: Toko Berkah Jaya"]');
> 26 |   await expect(bizInput).toBeVisible({ timeout: 5000 });
     |                          ^ Error: expect(locator).toBeVisible() failed
  27 |   await bizInput.fill('Kedai Sulthan');
  28 |   console.log('Filled Business Name: Kedai Sulthan');
  29 | 
  30 |   // 4. Click Lanjut Step
  31 |   const nextBtn = page.getByRole('button', { name: 'Lanjut Step' });
  32 |   await nextBtn.click();
  33 |   await page.waitForTimeout(2000);
  34 |   await page.screenshot({ path: 'step2-product-page.png' });
  35 | 
  36 |   // Verify step 2 is active
  37 |   await expect(page).toHaveURL(/step=02/);
  38 |   console.log('SUCCESS 100%: Wizard step navigation verified end-to-end on live site!');
  39 | });
  40 | 
```
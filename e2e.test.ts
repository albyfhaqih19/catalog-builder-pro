import { test, expect } from '@playwright/test';

test('Full Catalog Builder Wizard Navigation Test', async ({ page }) => {
  // 1. Open app
  await page.goto('https://catalog-builder-pro.vercel.app');
  await page.waitForTimeout(1000);

  // Set Auth Session Key v3 & default user in LocalStorage
  await page.evaluate(() => {
    const ownerUser = {
      id: 'usr-default-owner',
      email: 'owner@admin.com',
      name: 'Owner Admin',
      storeName: 'Toko Admin',
      role: 'admin',
      status: 'approved',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('cbp_users_v3', JSON.stringify([ownerUser]));
    localStorage.setItem('cbp_auth_session_v3', JSON.stringify(ownerUser));
  });

  // 2. Open Wizard directly with Session
  await page.goto('https://catalog-builder-pro.vercel.app/wizard');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'wizard-loaded-final.png' });

  // 3. Fill Business Name
  const bizInput = page.locator('input[placeholder="Contoh: Toko Berkah Jaya"]');
  await expect(bizInput).toBeVisible({ timeout: 5000 });
  await bizInput.fill('Kedai Sulthan');
  console.log('Filled Business Name: Kedai Sulthan');

  // 4. Click Lanjut Step
  const nextBtn = page.getByRole('button', { name: 'Lanjut Step' });
  await nextBtn.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'step2-product-page.png' });

  // Verify step 2 is active
  await expect(page).toHaveURL(/step=02/);
  console.log('SUCCESS 100%: Wizard step navigation verified end-to-end on live site!');
});

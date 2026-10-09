import { test, expect } from '@playwright/test';

test('Full Catalog Builder Wizard Navigation Test', async ({ page }) => {
  // 1. Open local vite server or vercel
  await page.goto('https://catalog-builder-pro.vercel.app/wizard');
  await page.waitForTimeout(5000);

  // Print all elements on screen to console
  const content = await page.content();
  console.log('PAGE HTML LENGTH:', content.length);
  const text = await page.locator('body').innerText();
  console.log('BODY TEXT:', text.slice(0, 500));
});

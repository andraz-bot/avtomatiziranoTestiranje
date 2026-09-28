import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('Prijava uporabnika', async ({ page }) => {
  await page.goto('https://pis.intra.igea.si/pis-ua/');

  await page.waitForLoadState('networkidle');

  const userInput = page.locator('#username').or(page.locator('input[type="text"]'));
  const passInput = page.locator('#password').or(page.locator('input[type="password"]'));

  await userInput.first().fill("pis_igeaupravniaktiadmin");
  await passInput.first().fill("a");

  const submitBtn = page.locator('button[type="submit"], input[type="submit"], button:has-text("Prijava")');
  await submitBtn.first().click();

  await page.waitForURL('**/pis-ua/**', { timeout: 15000 });

  await page.context().storageState({ path: authFile });
});
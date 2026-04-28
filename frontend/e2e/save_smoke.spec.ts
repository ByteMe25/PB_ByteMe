import { test, expect } from '@playwright/test';

test('Salva File - esporta e scarica un file', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  await page.getByRole('button', { name: 'Salva File' }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Esporta' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).not.toBe('');
});
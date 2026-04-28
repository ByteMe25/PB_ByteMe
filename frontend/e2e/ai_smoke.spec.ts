import { test, expect } from '@playwright/test';

test('Operazioni AI - traduce in inglese e inserisce il testo', async ({ page }) => {
  // Mocka la chiamata AI prima di caricare la pagina
  await page.route('**/api/ai/generate', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ generated_text: 'This is the translated text in English.' }),
    });
  });

  await page.goto('http://localhost:8080/');

  await page.getByRole('button', { name: 'Operazioni AI' }).click();

  const traduciBtn = page.getByRole('button', { name: 'Traduci' });
  await expect(traduciBtn).toBeVisible();
  await traduciBtn.click();

  const ingleseBtn = page.getByRole('button', { name: 'Inglese' });
  await expect(ingleseBtn).toBeVisible();
  await ingleseBtn.click();

  // Ora la risposta è istantanea grazie al mock, 5 secondi bastano
  const inserisciBtn = page.locator('button:has-text("Inserisci")');
  await expect(inserisciBtn).toBeVisible({ timeout: 5000 });
  await inserisciBtn.click();

  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.waitForTimeout(500);
  expect(errors).toHaveLength(0);
});
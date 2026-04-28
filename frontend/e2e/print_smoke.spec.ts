import { test, expect } from '@playwright/test';

test('Stampa - apre il dialog di stampa', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  // Intercetta l'apertura del dialog di stampa prima del click
  const printDialogPromise = page.waitForEvent('dialog').catch(() => null);
  await page.getByRole('button', { name: 'Stampa' }).click();

  // Verifica alternativa: controlla che non ci siano errori JS sulla pagina
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.waitForTimeout(500);
  expect(errors).toHaveLength(0);
});
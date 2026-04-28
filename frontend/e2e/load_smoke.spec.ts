import { test, expect } from '@playwright/test';

test('Carica File - apre il dialog di selezione file', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Carica File' }).click(),
  ]);

  expect(fileChooser).toBeTruthy();
});
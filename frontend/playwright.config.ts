import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 10000, //10s per test, sufficiente con i mock
  use: {
    baseURL: 'http://localhost:8080', 
  },
});
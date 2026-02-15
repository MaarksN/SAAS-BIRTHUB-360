import { test, expect } from '@playwright/test';

test.describe('Smoke Test', () => {
  test('should load the home page', async ({ page }) => {
    const response = await page.goto('/');

    // Check if response is OK
    expect(response?.status()).toBe(200);

    // Check for title or key element
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Example assertion
    // expect(title).not.toBe('');
  });
});

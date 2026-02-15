import { test, expect } from '@playwright/test';

test.describe('Landing Page Smoke Test', () => {
  test('should render key landing page elements', async ({ page }) => {
    try {
      const response = await page.goto('/');

      // 1. Verify Server Response
      expect(response?.status()).toBe(200);

      // 2. Verify Main Headline
      // "The Ultimate Sales Operating System"
      await expect(page.getByRole('heading', { name: /The Ultimate Sales Operating System/i })).toBeVisible();

      // 3. Verify CTA Buttons
      // "Start Free Trial" link
      const startTrialBtn = page.getByRole('link', { name: /Start Free Trial/i });
      await expect(startTrialBtn).toBeVisible();
      await expect(startTrialBtn).toHaveAttribute('href', '/dashboard');

      // 4. Verify Feature Cards presence
      await expect(page.getByText('Precision Prospecting')).toBeVisible();
      await expect(page.getByText('Automated Outreach')).toBeVisible();
      await expect(page.getByText('Revenue Intelligence')).toBeVisible();

      // 5. Verify Footer existence
      await expect(page.getByRole('contentinfo')).toBeVisible(); // Footer usually has contentinfo role or we check specific text
      await expect(page.getByText('The all-in-one platform for modern sales teams.')).toBeVisible();

    } catch (error) {
      console.error('Smoke test failed. Ensure the server is running at http://localhost:3000');
      throw error;
    }
  });
});

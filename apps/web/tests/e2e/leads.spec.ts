import { expect, test } from '@playwright/test';

test.describe('Leads Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock leads API response
    await page.route('/api/leads', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'lead-1',
              name: 'John Doe',
              email: 'john@example.com',
              companyName: 'Acme Corp',
              phone: '123-456-7890',
              status: 'NEW',
            },
          ],
        }),
      });
    });

    // Mock initial data (since it's server-rendered, we might need to intercept the page load request or rely on the hydration if using useQuery)
    // For simplicity, we assume the page fetches via fetch() in LeadList or we test the optimistic update interaction after load.

    await page.goto('/leads');
  });

  test('should display leads', async ({ page }) => {
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Acme Corp')).toBeVisible();
    await expect(page.getByText('NEW')).toBeVisible();
  });

  test('should optimistically update lead status', async ({ page }) => {
    // Mock the PATCH request
    await page.route('/api/leads/lead-1', async (route) => {
      // Simulate network delay to verify optimistic update
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'lead-1',
          status: 'QUALIFIED',
        }),
      });
    });

    // Find and click the "Qualify" button (it appears on hover in the real component,
    // but in test we might need to force click or hover first)
    // The component uses group-hover:opacity-100.
    const leadRow = page.getByText('John Doe').locator('..');
    await leadRow.hover();

    const qualifyButton = page.getByRole('button', { name: 'Qualify' });
    await expect(qualifyButton).toBeVisible();
    await qualifyButton.click();

    // Verify Optimistic Update: Status should change immediately to 'QUALIFIED'
    // This assumes LeadListItem displays the status text
    await expect(page.getByText('QUALIFIED')).toBeVisible();
    await expect(page.getByText('NEW')).not.toBeVisible();

    // Verify Toast
    await expect(page.getByText('Status updated')).toBeVisible();
  });
});

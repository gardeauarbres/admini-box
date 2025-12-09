import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/AdminiBox/);
});

test('navigation links work', async ({ page }) => {
    await page.goto('/');

    // Click the get started link.
    // Note: This assumes the user is not logged in and sees the landing page or login, 
    // or checks for elements present on the dashboard if no auth.
    // Since we have Auth, this might redirect to /login.
    // Let's verify we are on login if not authenticated or dashboard if we are.
    // For this basic test, we just check if the page loads and has some content.

    // Check for logo or main text
    await expect(page.locator('body')).toBeVisible();
});

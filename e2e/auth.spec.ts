import { test, expect } from '@playwright/test';

test('should allow a new user to register', async ({ page }) => {
    const uniqueId = Date.now();
    const email = `test.user.${uniqueId}@example.com`;
    const name = 'Test User';
    const password = 'Password@123'; // Matches complexity requirements

    await page.goto('/register');

    await page.fill('input[name="name"]', name);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    // Submit form
    await page.click('button[type="submit"]');

    // Expect to be redirected to home or show dashboard
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Verify user is logged in (e.g., check for "Tableau de Bord")
    await expect(page.locator('h1')).toContainText('Tableau de Bord');
});

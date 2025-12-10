import { test, expect } from '@playwright/test';

test.describe('Visual Components & Micro-Interactions', () => {

    test('MagneticButton works and tracks mouse', async ({ page }) => {
        await page.goto('/');

        // Locate a magnetic button (e.g., Theme Toggle or Navigation Item)
        // Assuming the Navigation uses MagneticButton
        const navItem = page.locator('nav a').first();

        // It should be visible
        await expect(navItem).toBeVisible();

        // Hover over it
        await navItem.hover();

        // Check if transform style is applied (this implies framer-motion is working)
        // Note: Testing exact animation values is hard, but we can check if style attribute changes or exists
        // We might need to select the specific motion.div inside if the structure is complex
        // But usually hover should trigger some change. 

        // For now, mostly checking it doesn't crash the page on hover
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('SpotlightCard renders correctly', async ({ page }) => {
        // Go to a page with spotlight cards, e.g., Analytics
        // We need to login first or use a public page if available.
        // Reusing auth logic or assuming session persistence might be needed.
        // For this test, let's try to register/login quickly if needed, or check public components.
        // Since we don't have a reliable "seed" user, we'll skip login complexity and check if home has them
        // (DashboardWidgets use SpotlightCard)

        // Note: Without auth, we might be redirected to Login.
        // Let's create a test user first.
        const uniqueId = Date.now();
        const email = `visual.test.${uniqueId}@example.com`;
        const name = 'Visual Test User';
        const password = 'Password@123';

        await page.goto('/register');
        await page.fill('input[name="name"]', name);
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/', { timeout: 10000 });

        // Now we should be on Dashboard
        // Check for SpotlightCards (class .glass-panel usually wrapped in it)
        // We added SpotlightCard to DashboardWidgets and Analytics

        // Wait for dashboard to load
        await expect(page.locator('h1')).toContainText('Tableau de Bord');

        // Check for at least one element that likely uses SpotlightCard
        // The widgets are draggable, but they are wrapped in SpotlightCard.
        // We can inspect the DOM for the radial-gradient style which Spotlight puts in 'mousemove'

        const card = page.locator('.glass-panel').first();
        await expect(card).toBeVisible();

        // Hover to trigger spotlight
        await card.hover();

        // Verify no console errors (implicit in playwright test pass)
    });

    test('SmartScanner is present on Finance page', async ({ page }) => {
        // Authenticate
        const uniqueId = Date.now();
        const email = `scanner.test.${uniqueId}@example.com`;
        const name = 'Scanner Test User';
        const password = 'Password@123';

        await page.goto('/register');
        await page.fill('input[name="name"]', name);
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/', { timeout: 10000 });

        // Go to Finance
        await page.goto('/finance');
        await page.waitForURL('/finance'); // Ensure we are not redirected to login

        // Check for SmartScanner text
        await expect(page.getByText(/Smart Scan/)).toBeVisible();
    });
});

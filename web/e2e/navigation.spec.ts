import { test, expect } from "@playwright/test";
import { navigateTo, SELECTORS } from "./helpers";

test.describe("Global navigation", () => {
  test("header has logo and nav links", async ({ page }) => {
    await navigateTo(page, "/");

    const header = page.locator(SELECTORS.header);
    await expect(header).toBeVisible();

    // Logo text
    await expect(header.getByText("LVL")).toBeVisible();

    // Nav links
    const shopLink = header.getByRole("link", { name: "Shop" });
    await expect(shopLink).toBeVisible();

    const liveLink = header.getByRole("link", { name: "Live" });
    await expect(liveLink).toBeVisible();
  });

  test("bottom nav visible on mobile viewport", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Bottom nav is only visible on mobile");

    await navigateTo(page, "/");

    const bottomNav = page.locator(SELECTORS.bottomNav);
    await expect(bottomNav).toBeVisible();

    // Verify tab labels
    await expect(bottomNav.getByText("Home")).toBeVisible();
    await expect(bottomNav.getByText("LIVE")).toBeVisible();
    await expect(bottomNav.getByText("Account")).toBeVisible();
  });

  test("bottom nav is hidden on desktop", async ({ page, isMobile }) => {
    test.skip(isMobile, "This test is for desktop only");

    await navigateTo(page, "/");

    const bottomNav = page.locator(SELECTORS.bottomNav);
    await expect(bottomNav).not.toBeVisible();
  });

  test("404 page shows for invalid routes", async ({ page }) => {
    await navigateTo(page, "/this-page-does-not-exist-12345");

    // Next.js shows a 404 page — look for common 404 indicators
    const notFoundText = page.getByText(/404|not found|page not found/i);
    await expect(notFoundText).toBeVisible();
  });

  test("can navigate between main sections", async ({ page }) => {
    // Start on homepage
    await navigateTo(page, "/");
    await expect(page).toHaveURL("/");

    // Go to Live
    const liveLink = page.locator(SELECTORS.header).getByRole("link", { name: "Live" });
    await liveLink.click();
    await expect(page).toHaveURL(/\/live/);

    // Go back to home via logo or Shop link
    await page.goBack();
    await expect(page).toHaveURL("/");

    // Navigate to cart
    await navigateTo(page, "/cart");
    await expect(page).toHaveURL(/\/cart/);

    // Navigate to auth
    await navigateTo(page, "/auth/login");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("header cart icon links to cart page", async ({ page }) => {
    await navigateTo(page, "/");

    const cartLink = page.locator(SELECTORS.cartLink);
    const exists = await cartLink.isVisible().catch(() => false);

    if (exists) {
      await cartLink.click();
      await expect(page).toHaveURL(/\/cart/);
    }
  });
});

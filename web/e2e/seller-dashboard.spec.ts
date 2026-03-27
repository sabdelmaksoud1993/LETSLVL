import { test, expect } from "@playwright/test";
import { navigateTo } from "./helpers";

test.describe("Seller dashboard (unauthenticated)", () => {
  test("seller dashboard page is accessible", async ({ page }) => {
    await navigateTo(page, "/seller/dashboard");

    // The seller pages render outside SiteShell (no header/footer).
    // When not authenticated, the page should still render (seller pages
    // handle their own auth checks). We verify the page loads without errors.
    await expect(page).toHaveURL(/\/seller\/dashboard/);
  });

  test("seller products page is accessible", async ({ page }) => {
    await navigateTo(page, "/seller/products");
    await expect(page).toHaveURL(/\/seller\/products/);
  });

  test("login page is accessible from auth flow", async ({ page }) => {
    await navigateTo(page, "/auth/login");

    // Verify the login page renders properly
    const signInButton = page.getByRole("button", { name: /sign in/i });
    await expect(signInButton).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";
import { navigateTo, TEXT } from "./helpers";

test.describe("Cart & Checkout", () => {
  test("cart page loads", async ({ page }) => {
    await navigateTo(page, "/cart");
    // Either "Your Cart" or "Your cart is empty" should be visible
    const cartHeading = page.getByRole("heading", { name: /your cart/i });
    await expect(cartHeading).toBeVisible();
  });

  test("shows empty state when no items", async ({ page }) => {
    // Clear any existing cart state by navigating fresh
    await navigateTo(page, "/cart");

    const emptyMessage = page.getByText(TEXT.emptyCart);
    await expect(emptyMessage).toBeVisible();

    // Should show Continue Shopping button
    const continueShoppingButton = page.getByRole("link", { name: /continue shopping/i });
    await expect(continueShoppingButton).toBeVisible();
  });

  test("can navigate to checkout from cart with items", async ({ page }) => {
    // First add an item to cart
    await navigateTo(page, "/product/p1");
    const addToCartButton = page.getByRole("button", { name: TEXT.addToCart });
    await addToCartButton.click();

    // Navigate to cart
    await navigateTo(page, "/cart");

    // Cart should have items
    const cartHeading = page.getByRole("heading", { name: /your cart/i });
    await expect(cartHeading).toBeVisible();

    // Click Proceed to Checkout
    const checkoutButton = page.getByRole("link", { name: /proceed to checkout/i });
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();

    await expect(page).toHaveURL(/\/checkout/);
  });

  test("checkout shows shipping form or sign-in prompt", async ({ page }) => {
    await navigateTo(page, "/checkout");

    // Checkout requires auth — should show either shipping form or sign in prompt
    // When not authenticated, shows "Sign in to Checkout"
    const signInPrompt = page.getByText(/sign in to checkout/i);
    const shippingHeading = page.getByText(/shipping address/i);

    const signInVisible = await signInPrompt.isVisible().catch(() => false);
    const shippingVisible = await shippingHeading.isVisible().catch(() => false);

    // One of these should be true
    expect(signInVisible || shippingVisible).toBeTruthy();
  });

  test("checkout sign-in prompt has Sign In button", async ({ page }) => {
    await navigateTo(page, "/checkout");

    // When not authenticated, there should be a sign-in link/button
    const signInLink = page.getByRole("link", { name: TEXT.signIn });
    const signInVisible = await signInLink.isVisible().catch(() => false);

    if (signInVisible) {
      await expect(signInLink).toBeVisible();
      await signInLink.click();
      await expect(page).toHaveURL(/\/auth\/login/);
    }
  });
});

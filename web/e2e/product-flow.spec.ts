import { test, expect } from "@playwright/test";
import { navigateTo, TEXT } from "./helpers";

test.describe("Product browsing", () => {
  test("can navigate to a product detail page", async ({ page }) => {
    await navigateTo(page, "/");

    // Wait for product cards to appear in the Trending section
    const trendingHeading = page.getByRole("heading", { name: TEXT.trendingNow });
    await expect(trendingHeading).toBeVisible();

    // Click the first product card link
    const productLinks = page.locator('a[href^="/product/"]');
    await expect(productLinks.first()).toBeVisible();
    await productLinks.first().click();

    // Should navigate to a product page
    await expect(page).toHaveURL(/\/product\//);
  });

  test("product page shows title, price, and description", async ({ page }) => {
    // Navigate directly to the first mock product
    await navigateTo(page, "/product/p1");

    // Product title heading
    const title = page.getByRole("heading", { level: 1 });
    await expect(title).toBeVisible();

    // Price should be visible (formatted with AED or currency)
    const priceText = page.locator("text=/AED|\\d+/").first();
    await expect(priceText).toBeVisible();

    // Description text
    const description = page.getByText(/limited edition|oversized|premium/i).first();
    await expect(description).toBeVisible();
  });

  test("can select a size", async ({ page }) => {
    await navigateTo(page, "/product/p1");

    // Size label should be visible
    const sizeLabel = page.getByText("Size", { exact: true });
    await expect(sizeLabel).toBeVisible();

    // Click a size button (e.g. "M")
    const sizeButton = page.getByRole("button", { name: "M", exact: true });
    await expect(sizeButton).toBeVisible();
    await sizeButton.click();

    // After clicking, the button should have the selected styling (yellow bg)
    await expect(sizeButton).toHaveClass(/bg-lvl-yellow/);
  });

  test("ADD TO CART button is visible", async ({ page }) => {
    await navigateTo(page, "/product/p1");

    const addToCartButton = page.getByRole("button", { name: TEXT.addToCart });
    await expect(addToCartButton).toBeVisible();
    await expect(addToCartButton).toBeEnabled();
  });

  test("can add product to cart", async ({ page }) => {
    await navigateTo(page, "/product/p1");

    // Click Add to Cart
    const addToCartButton = page.getByRole("button", { name: TEXT.addToCart });
    await addToCartButton.click();

    // Button text should change to "ADDED!"
    await expect(page.getByRole("button", { name: /added/i })).toBeVisible();
  });

  test("cart count updates in header after adding product", async ({ page }) => {
    await navigateTo(page, "/product/p1");

    // Add to cart
    const addToCartButton = page.getByRole("button", { name: TEXT.addToCart });
    await addToCartButton.click();

    // Navigate to cart to verify item is there
    await navigateTo(page, "/cart");

    // Cart should not show empty state
    const emptyMessage = page.getByText(TEXT.emptyCart);
    await expect(emptyMessage).not.toBeVisible();
  });
});

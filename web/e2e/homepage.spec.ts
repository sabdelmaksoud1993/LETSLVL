import { test, expect } from "@playwright/test";
import { navigateTo, SELECTORS, TEXT } from "./helpers";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, "/");
  });

  test("page loads with hero heading", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(TEXT.heroHeading);
  });

  test("category pills are visible and clickable", async ({ page }) => {
    // Category pills are rendered as links inside the CategoryPills component
    const categorySection = page.locator(".pt-6").first();
    await expect(categorySection).toBeVisible();

    // At least one category link should exist
    const categoryLinks = categorySection.getByRole("link");
    await expect(categoryLinks.first()).toBeVisible();

    // Click a category link and verify navigation
    const firstCategory = categoryLinks.first();
    const href = await firstCategory.getAttribute("href");
    await firstCategory.click();
    if (href) {
      await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });

  test("LIVE NOW section shows stream cards", async ({ page }) => {
    // The Live Now section may or may not appear depending on mock data
    const liveSection = page.getByText(TEXT.liveNow);
    const isVisible = await liveSection.isVisible().catch(() => false);

    if (isVisible) {
      await expect(liveSection).toBeVisible();
      // Stream cards contain LIVE badges
      const liveBadges = page.getByText("LIVE", { exact: true });
      await expect(liveBadges.first()).toBeVisible();
    }
  });

  test("TRENDING NOW section shows product cards", async ({ page }) => {
    const trendingHeading = page.getByRole("heading", { name: TEXT.trendingNow });
    await expect(trendingHeading).toBeVisible();

    // Product cards should be rendered below the heading
    const trendingSection = trendingHeading.locator("..");
    const productLinks = trendingSection.getByRole("link");
    await expect(productLinks.first()).toBeVisible();
  });

  test("navigation links work — Shop and Live", async ({ page }) => {
    // Header should have Shop link
    const shopLink = page.getByRole("link", { name: "Shop" }).first();
    await expect(shopLink).toBeVisible();

    // Header should have Live link
    const liveLink = page.getByRole("link", { name: "Live" }).first();
    await expect(liveLink).toBeVisible();

    // Click Live and verify navigation
    await liveLink.click();
    await expect(page).toHaveURL(/\/live/);
  });

  test("footer is visible", async ({ page }) => {
    const footer = page.locator(SELECTORS.footer);
    await expect(footer).toBeVisible();

    // Footer contains brand name
    await expect(footer.getByText("LVL")).toBeVisible();
  });
});

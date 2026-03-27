import { test, expect } from "@playwright/test";
import { navigateTo } from "./helpers";

test.describe("Live auction feed", () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, "/live");
  });

  test("live page loads", async ({ page }) => {
    // The live page has a header with LET'S LVL branding
    const brandText = page.getByText("LVL").first();
    await expect(brandText).toBeVisible();
  });

  test("category pills are visible for filtering", async ({ page }) => {
    // Live page has category pills for filtering streams
    // Status tabs (LIVE, Upcoming, Ended) should be visible
    const liveTab = page.getByRole("button", { name: "LIVE", exact: true });
    await expect(liveTab).toBeVisible();

    const upcomingTab = page.getByRole("button", { name: "Upcoming" });
    await expect(upcomingTab).toBeVisible();

    const endedTab = page.getByRole("button", { name: "Ended" });
    await expect(endedTab).toBeVisible();
  });

  test("status tabs filter streams", async ({ page }) => {
    // Click Upcoming tab
    const upcomingTab = page.getByRole("button", { name: "Upcoming" });
    await upcomingTab.click();

    // The tab should be active (has specific styling)
    await expect(upcomingTab).toHaveClass(/bg-lvl-black/);

    // Click back to LIVE tab
    const liveTab = page.getByRole("button", { name: "LIVE", exact: true });
    await liveTab.click();
    await expect(liveTab).toHaveClass(/bg-lvl-black/);
  });

  test("stream count indicator is visible when on LIVE tab", async ({ page }) => {
    // When on LIVE tab, stream count text should appear
    const streamCount = page.getByText(/stream.*live now/i);
    await expect(streamCount).toBeVisible();
  });

  test("stream cards or empty state are displayed", async ({ page }) => {
    // After loading, either stream cards or "No live streams" message appears
    const loadingSpinner = page.locator(".animate-spin");
    // Wait for loading to finish
    await loadingSpinner.waitFor({ state: "hidden", timeout: 10_000 }).catch(() => {
      // Loading may have already finished
    });

    // Either stream cards or empty state should be visible
    const streamCards = page.locator("[class*='space-y-3'] > *");
    const emptyState = page.getByText(/no live streams|check back later/i);

    const hasCards = (await streamCards.count()) > 0;
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    expect(hasCards || hasEmptyState).toBeTruthy();
  });
});

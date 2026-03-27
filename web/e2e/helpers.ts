import { type Page, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Navigation helpers
// ---------------------------------------------------------------------------

/**
 * Navigate to a path relative to the base URL and wait for the page to be
 * ready (network idle + DOM content loaded).
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await waitForPageLoad(page);
}

/**
 * Wait until the page finishes loading (networkidle is best-effort — it
 * resolves once there are no more than 0 network connections for 500 ms).
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
}

// ---------------------------------------------------------------------------
// Common selectors / text constants
// ---------------------------------------------------------------------------

export const SELECTORS = {
  /** Site header */
  header: "header",
  /** Footer element */
  footer: "footer",
  /** Bottom mobile navigation bar */
  bottomNav: 'nav[aria-label="Mobile navigation"]',
  /** Cart icon link in header */
  cartLink: 'a[href="/cart"]',
  /** Main content area */
  main: "main",
} as const;

export const TEXT = {
  heroHeading: /built for/i,
  heroSubHeading: /the bold/i,
  trendingNow: /trending now/i,
  liveNow: /live now/i,
  addToCart: /add to cart/i,
  signIn: /sign in/i,
  createAccount: /create one/i,
  yourCart: /your cart/i,
  emptyCart: /your cart is empty/i,
  checkout: /checkout/i,
  shopNow: /shop now/i,
} as const;

// ---------------------------------------------------------------------------
// Assertion helpers
// ---------------------------------------------------------------------------

/**
 * Assert that the page title contains the expected text (case-insensitive).
 */
export async function expectTitleContains(
  page: Page,
  text: string,
): Promise<void> {
  await expect(page).toHaveTitle(new RegExp(text, "i"));
}

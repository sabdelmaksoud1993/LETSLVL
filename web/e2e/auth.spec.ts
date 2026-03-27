import { test, expect } from "@playwright/test";
import { navigateTo } from "./helpers";

test.describe("Authentication", () => {
  test("login page loads with email and password fields", async ({ page }) => {
    await navigateTo(page, "/auth/login");

    // Email field
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("type", "email");

    // Password field
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();
  });

  test("login page has Sign In button", async ({ page }) => {
    await navigateTo(page, "/auth/login");

    const signInButton = page.getByRole("button", { name: /sign in/i });
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeEnabled();
  });

  test("login page has Google social login button", async ({ page }) => {
    await navigateTo(page, "/auth/login");

    const googleButton = page.getByRole("button", { name: /continue with google/i });
    await expect(googleButton).toBeVisible();
  });

  test("login page has link to register", async ({ page }) => {
    await navigateTo(page, "/auth/login");

    const createAccountLink = page.getByRole("link", { name: /create one/i });
    await expect(createAccountLink).toBeVisible();
    await expect(createAccountLink).toHaveAttribute("href", "/auth/register");
  });

  test("login page has forgot password button", async ({ page }) => {
    await navigateTo(page, "/auth/login");

    const forgotButton = page.getByRole("button", { name: /forgot password/i });
    await expect(forgotButton).toBeVisible();
  });

  test("register page loads with all required fields", async ({ page }) => {
    await navigateTo(page, "/auth/register");

    // Full Name
    const nameInput = page.getByLabel(/full name/i);
    await expect(nameInput).toBeVisible();

    // Email
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();

    // Phone
    const phoneInput = page.getByLabel(/phone/i);
    await expect(phoneInput).toBeVisible();

    // Password
    const passwordInput = page.getByLabel("Password", { exact: true });
    await expect(passwordInput).toBeVisible();

    // Confirm Password
    const confirmInput = page.getByLabel(/confirm password/i);
    await expect(confirmInput).toBeVisible();
  });

  test("register page has Create Account submit button", async ({ page }) => {
    await navigateTo(page, "/auth/register");

    const createButton = page.getByRole("button", { name: /create account/i });
    await expect(createButton).toBeVisible();
  });

  test("can navigate from login to register", async ({ page }) => {
    await navigateTo(page, "/auth/login");

    const createLink = page.getByRole("link", { name: /create one/i });
    await createLink.click();

    await expect(page).toHaveURL(/\/auth\/register/);
  });
});

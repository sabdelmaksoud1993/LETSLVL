# E2E Tests — Playwright

## Setup

Install Playwright and its browser binaries:

```bash
npm install -D @playwright/test
npx playwright install
```

## Running Tests

Run all tests:

```bash
npx playwright test
```

Run a specific test file:

```bash
npx playwright test e2e/homepage.spec.ts
```

Run in headed mode (to see the browser):

```bash
npx playwright test --headed
```

Run only on Desktop Chrome:

```bash
npx playwright test --project="Desktop Chrome"
```

Run only on Mobile Chrome:

```bash
npx playwright test --project="Mobile Chrome"
```

## Viewing Reports

After a test run, open the HTML report:

```bash
npx playwright show-report
```

## Test Structure

| File                        | Covers                                |
| --------------------------- | ------------------------------------- |
| `homepage.spec.ts`          | Hero, categories, trending, live now  |
| `product-flow.spec.ts`      | Product detail, size select, add cart |
| `cart-checkout.spec.ts`     | Cart states, checkout flow            |
| `live-feed.spec.ts`         | Live page, filters, stream cards      |
| `auth.spec.ts`              | Login, register, social auth          |
| `seller-dashboard.spec.ts`  | Seller pages (unauthenticated)        |
| `navigation.spec.ts`        | Header, bottom nav, 404, routing      |
| `helpers.ts`                | Shared utilities and selectors        |

## Configuration

See `../playwright.config.ts` for:
- **Base URL**: `http://localhost:3000`
- **Projects**: Desktop Chrome, Mobile Chrome (Pixel 5)
- **Screenshots**: On failure only
- **Timeout**: 30 seconds per test
- **Retries**: 1 in CI, 0 locally

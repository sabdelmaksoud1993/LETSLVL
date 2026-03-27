// ---------------------------------------------------------------------------
// LET'S LVL — Email Template Functions
// Returns fully inline-styled HTML strings for transactional emails.
// ---------------------------------------------------------------------------

const BRAND = {
  bg: "#0A0A0A",
  card: "#141414",
  yellow: "#F5C518",
  white: "#FFFFFF",
  muted: "#9CA3AF",
  black: "#000000",
} as const;

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://letslvl.com";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>LET'S LVL</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:Arial,Helvetica,sans-serif;color:${BRAND.white};-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};">
  <tr>
    <td align="center" style="padding:24px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        ${header()}
        <tr>
          <td style="padding:0 0 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.card};border-radius:12px;">
              <tr>
                <td style="padding:32px 24px;">
                  ${content}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${footer()}
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function header(): string {
  return `<tr>
  <td align="center" style="padding:0 0 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.black};border-radius:12px 12px 0 0;">
      <tr>
        <td align="center" style="padding:24px;">
          <span style="font-size:28px;font-weight:800;letter-spacing:4px;color:${BRAND.yellow};text-transform:uppercase;text-decoration:none;">
            LET'S LVL
          </span>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

function footer(): string {
  return `<tr>
  <td align="center" style="padding:16px 0 0;">
    <p style="margin:0 0 8px;font-size:13px;color:${BRAND.muted};line-height:1.5;">
      Built in Dubai. Shaped by culture.
    </p>
    <p style="margin:0;font-size:12px;color:${BRAND.muted};line-height:1.5;">
      <a href="${BASE_URL}" style="color:${BRAND.yellow};text-decoration:none;">letslvl.com</a>
    </p>
  </td>
</tr>`;
}

function ctaButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
  <tr>
    <td align="center" style="background-color:${BRAND.yellow};border-radius:8px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:${BRAND.black};text-decoration:none;text-transform:uppercase;letter-spacing:2px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

function divider(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding:16px 0;">
      <div style="border-top:1px solid #2A2A2A;"></div>
    </td>
  </tr>
</table>`;
}

// ---------------------------------------------------------------------------
// 1. Order Confirmation Email
// ---------------------------------------------------------------------------

export interface OrderConfirmationData {
  orderNumber: string;
  orderDate: string;
  items: ReadonlyArray<{
    title: string;
    quantity: number;
    price: number;
    currency?: string;
  }>;
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string | null;
    city: string;
    country: string;
  };
  subtotal: number;
  shipping: number;
  total: number;
  currency?: string;
}

export function orderConfirmationEmail(data: OrderConfirmationData): string {
  const cur = data.currency ?? "AED";

  const itemRows = data.items
    .map(
      (item) => `<tr>
  <td style="padding:8px 0;font-size:14px;color:${BRAND.white};border-bottom:1px solid #2A2A2A;">
    ${escapeHtml(item.title)}
  </td>
  <td align="center" style="padding:8px 0;font-size:14px;color:${BRAND.muted};border-bottom:1px solid #2A2A2A;">
    ${item.quantity}
  </td>
  <td align="right" style="padding:8px 0;font-size:14px;color:${BRAND.white};border-bottom:1px solid #2A2A2A;">
    ${formatPrice(item.price * item.quantity, item.currency ?? cur)}
  </td>
</tr>`
    )
    .join("\n");

  const content = `
<h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:${BRAND.yellow};text-transform:uppercase;letter-spacing:2px;">
  Order Confirmed
</h1>
<p style="margin:0 0 24px;font-size:14px;color:${BRAND.muted};line-height:1.5;">
  Thank you for your order! We'll notify you when it ships.
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
  <tr>
    <td style="font-size:13px;color:${BRAND.muted};padding:4px 0;">Order Number</td>
    <td align="right" style="font-size:14px;color:${BRAND.white};font-weight:700;padding:4px 0;">${escapeHtml(data.orderNumber)}</td>
  </tr>
  <tr>
    <td style="font-size:13px;color:${BRAND.muted};padding:4px 0;">Date</td>
    <td align="right" style="font-size:14px;color:${BRAND.white};padding:4px 0;">${escapeHtml(data.orderDate)}</td>
  </tr>
</table>

${divider()}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:1px;padding:0 0 8px;">Item</td>
    <td align="center" style="font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:1px;padding:0 0 8px;">Qty</td>
    <td align="right" style="font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:1px;padding:0 0 8px;">Price</td>
  </tr>
  ${itemRows}
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
  <tr>
    <td style="font-size:13px;color:${BRAND.muted};padding:4px 0;">Subtotal</td>
    <td align="right" style="font-size:14px;color:${BRAND.white};padding:4px 0;">${formatPrice(data.subtotal, cur)}</td>
  </tr>
  <tr>
    <td style="font-size:13px;color:${BRAND.muted};padding:4px 0;">Shipping</td>
    <td align="right" style="font-size:14px;color:${BRAND.white};padding:4px 0;">${data.shipping === 0 ? "FREE" : formatPrice(data.shipping, cur)}</td>
  </tr>
  <tr>
    <td style="font-size:14px;color:${BRAND.white};font-weight:700;padding:8px 0 0;">Total</td>
    <td align="right" style="font-size:18px;color:${BRAND.yellow};font-weight:700;padding:8px 0 0;">${formatPrice(data.total, cur)}</td>
  </tr>
</table>

${divider()}

<p style="margin:0 0 4px;font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:1px;">Shipping Address</p>
<p style="margin:0;font-size:14px;color:${BRAND.white};line-height:1.6;">
  ${escapeHtml(data.shippingAddress.fullName)}<br/>
  ${escapeHtml(data.shippingAddress.line1)}<br/>
  ${data.shippingAddress.line2 ? escapeHtml(data.shippingAddress.line2) + "<br/>" : ""}
  ${escapeHtml(data.shippingAddress.city)}, ${escapeHtml(data.shippingAddress.country)}
</p>

${ctaButton("View Order", `${BASE_URL}/account/orders`)}
`;

  return emailWrapper(content);
}

// ---------------------------------------------------------------------------
// 2. Order Shipped Email
// ---------------------------------------------------------------------------

export interface OrderShippedData {
  orderNumber: string;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
  trackingUrl?: string | null;
}

export function orderShippedEmail(data: OrderShippedData): string {
  const trackingSection = data.trackingNumber
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
  <tr>
    <td style="font-size:13px;color:${BRAND.muted};padding:4px 0;">Tracking Number</td>
    <td align="right" style="font-size:14px;color:${BRAND.white};font-weight:700;padding:4px 0;">${escapeHtml(data.trackingNumber)}</td>
  </tr>
</table>`
    : "";

  const deliverySection = data.estimatedDelivery
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
  <tr>
    <td style="font-size:13px;color:${BRAND.muted};padding:4px 0;">Estimated Delivery</td>
    <td align="right" style="font-size:14px;color:${BRAND.white};padding:4px 0;">${escapeHtml(data.estimatedDelivery)}</td>
  </tr>
</table>`
    : "";

  const buttonHref = sanitizeUrl(data.trackingUrl ?? "", `${BASE_URL}/account/orders`);

  const content = `
<h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:${BRAND.yellow};text-transform:uppercase;letter-spacing:2px;">
  Your Order Has Shipped
</h1>
<p style="margin:0 0 24px;font-size:14px;color:${BRAND.muted};line-height:1.5;">
  Great news! Your order <strong style="color:${BRAND.white};">${escapeHtml(data.orderNumber)}</strong> is on its way.
</p>

${trackingSection}
${deliverySection}

${ctaButton("Track Order", buttonHref)}
`;

  return emailWrapper(content);
}

// ---------------------------------------------------------------------------
// 3. Welcome Email
// ---------------------------------------------------------------------------

export interface WelcomeEmailData {
  firstName: string;
}

export function welcomeEmail(data: WelcomeEmailData): string {
  const content = `
<h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:${BRAND.yellow};text-transform:uppercase;letter-spacing:2px;">
  Welcome to LET'S LVL
</h1>
<p style="margin:0 0 24px;font-size:14px;color:${BRAND.muted};line-height:1.5;">
  Hey ${escapeHtml(data.firstName)}, welcome to the community. We're building the future of fashion in the MENA region — and you're part of it.
</p>

${divider()}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding:12px 0;">
      <a href="${BASE_URL}" style="font-size:14px;color:${BRAND.yellow};text-decoration:none;font-weight:600;">Shop the Collection &rarr;</a>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 0;border-top:1px solid #2A2A2A;">
      <a href="${BASE_URL}/live" style="font-size:14px;color:${BRAND.yellow};text-decoration:none;font-weight:600;">Live Auctions &rarr;</a>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 0;border-top:1px solid #2A2A2A;">
      <a href="${BASE_URL}/seller" style="font-size:14px;color:${BRAND.yellow};text-decoration:none;font-weight:600;">Become a Seller &rarr;</a>
    </td>
  </tr>
</table>

${ctaButton("Start Shopping", BASE_URL)}
`;

  return emailWrapper(content);
}

// ---------------------------------------------------------------------------
// 4. Password Reset Email
// ---------------------------------------------------------------------------

export interface PasswordResetEmailData {
  resetLink: string;
  expiryMinutes?: number;
}

export function passwordResetEmail(data: PasswordResetEmailData): string {
  const expiry = data.expiryMinutes ?? 60;

  const content = `
<h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:${BRAND.yellow};text-transform:uppercase;letter-spacing:2px;">
  Reset Your Password
</h1>
<p style="margin:0 0 24px;font-size:14px;color:${BRAND.muted};line-height:1.5;">
  We received a request to reset your password. Click the button below to choose a new one.
</p>

${ctaButton("Reset Password", sanitizeUrl(data.resetLink, `${BASE_URL}/auth/login`))}

<p style="margin:24px 0 0;font-size:12px;color:${BRAND.muted};line-height:1.5;">
  This link expires in ${expiry} minutes. If you didn't request a password reset, you can safely ignore this email.
</p>
`;

  return emailWrapper(content);
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeUrl(url: string, fallback: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return fallback;
    return url;
  } catch {
    return fallback;
  }
}

function formatPrice(amount: number, currency: string = "AED"): string {
  return `${amount.toLocaleString()} ${currency}`;
}

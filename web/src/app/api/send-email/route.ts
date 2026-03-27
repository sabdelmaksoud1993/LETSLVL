import { NextRequest, NextResponse } from "next/server";
import {
  orderConfirmationEmail,
  orderShippedEmail,
  welcomeEmail,
  passwordResetEmail,
  type OrderConfirmationData,
  type OrderShippedData,
  type WelcomeEmailData,
  type PasswordResetEmailData,
} from "@/lib/email-templates";

// ---------------------------------------------------------------------------
// Template registry — maps template name to subject + html builder
// ---------------------------------------------------------------------------

type TemplateMap = {
  "order-confirmation": { data: OrderConfirmationData; subject: string };
  "order-shipped": { data: OrderShippedData; subject: string };
  welcome: { data: WelcomeEmailData; subject: string };
  "password-reset": { data: PasswordResetEmailData; subject: string };
};

type TemplateName = keyof TemplateMap;

const VALID_TEMPLATES: ReadonlySet<string> = new Set<TemplateName>([
  "order-confirmation",
  "order-shipped",
  "welcome",
  "password-reset",
]);

function buildEmail(
  template: TemplateName,
  data: unknown,
): { subject: string; html: string } {
  switch (template) {
    case "order-confirmation": {
      const d = data as OrderConfirmationData;
      return {
        subject: `Order Confirmed — ${d.orderNumber}`,
        html: orderConfirmationEmail(d),
      };
    }
    case "order-shipped": {
      const d = data as OrderShippedData;
      return {
        subject: `Your Order Has Shipped — ${d.orderNumber}`,
        html: orderShippedEmail(d),
      };
    }
    case "welcome":
      return {
        subject: "Welcome to LET'S LVL",
        html: welcomeEmail(data as WelcomeEmailData),
      };
    case "password-reset":
      return {
        subject: "Reset Your Password — LET'S LVL",
        html: passwordResetEmail(data as PasswordResetEmailData),
      };
    default: {
      const _exhaustive: never = template;
      throw new Error(`Unknown template: ${_exhaustive}`);
    }
  }
}

// ---------------------------------------------------------------------------
// POST /api/send-email
// ---------------------------------------------------------------------------

interface SendEmailBody {
  to: string;
  template: string;
  data: Record<string, unknown>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // --- Auth guard: only allow internal server-side calls -----------------
    const internalSecret = req.headers.get("x-internal-secret");
    const expectedSecret = process.env.INTERNAL_API_SECRET;
    if (expectedSecret && internalSecret !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await req.json()) as Partial<SendEmailBody>;

    // --- Validate inputs ---------------------------------------------------
    if (!body.to || typeof body.to !== "string" || !EMAIL_REGEX.test(body.to)) {
      return NextResponse.json(
        { error: "Missing or invalid 'to' field" },
        { status: 400 },
      );
    }

    if (!body.template || !VALID_TEMPLATES.has(body.template)) {
      return NextResponse.json(
        {
          error: `Invalid template. Must be one of: ${[...VALID_TEMPLATES].join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (!body.data || typeof body.data !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid 'data' field" },
        { status: 400 },
      );
    }

    const template = body.template as TemplateName;
    const { subject, html } = buildEmail(template, body.data);

    // --- Dev mode: log to console ------------------------------------------
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.log("──────────────────────────────────────────────────");
      console.log("[DEV EMAIL]");
      console.log(`  To:       ${body.to}`);
      console.log(`  Subject:  ${subject}`);
      console.log(`  Template: ${template}`);
      console.log("  HTML length:", html.length, "chars");
      console.log("──────────────────────────────────────────────────");

      return NextResponse.json({ success: true, dev: true });
    }

    // --- Production: send via Resend API -----------------------------------
    const fromAddress =
      process.env.EMAIL_FROM ?? "LET'S LVL <noreply@letslvl.com>";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: body.to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[send-email] Resend API error:", res.status, errBody);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 502 },
      );
    }

    const result = (await res.json()) as Record<string, unknown>;
    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    console.error("[send-email] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

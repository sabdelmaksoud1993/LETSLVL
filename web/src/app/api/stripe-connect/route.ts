import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { sellerId, email } = await request.json();

    if (!sellerId || !email) {
      return NextResponse.json(
        { error: "sellerId and email are required" },
        { status: 400 }
      );
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey || stripeKey === "placeholder") {
      // Dev mode: return mock onboarding URL
      return NextResponse.json({
        url: "/seller/dashboard?connect=mock",
        accountId: "mock_acct_" + Date.now(),
        mode: "development",
      });
    }

    // Dynamic import so the app still works without the stripe package
    // installed in dev environments.
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);

    // Create connected account
    const account = await stripe.accounts.create({
      type: "express",
      email,
      country: "AE",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
    });

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${request.nextUrl.origin}/seller/dashboard?connect=refresh`,
      return_url: `${request.nextUrl.origin}/seller/dashboard?connect=success&account=${account.id}`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      url: accountLink.url,
      accountId: account.id,
      mode: "production",
    });
  } catch (err) {
    console.error("Stripe Connect onboarding error:", err);
    return NextResponse.json(
      { error: "Failed to create Stripe Connect account" },
      { status: 500 }
    );
  }
}

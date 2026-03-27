import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId query parameter is required" },
        { status: 400 }
      );
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // Dev mode: return mock status
    if (
      !stripeKey ||
      stripeKey === "placeholder" ||
      accountId.startsWith("mock_acct_")
    ) {
      return NextResponse.json({
        accountId,
        chargesEnabled: true,
        payoutsEnabled: true,
        detailsSubmitted: true,
        mode: "development",
      });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);

    const account = await stripe.accounts.retrieve(accountId);

    return NextResponse.json({
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      mode: "production",
    });
  } catch (err) {
    console.error("Stripe Connect status error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve account status" },
      { status: 500 }
    );
  }
}

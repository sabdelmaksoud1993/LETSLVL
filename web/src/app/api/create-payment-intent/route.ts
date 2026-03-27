import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'aed' } = await request.json();

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number.' },
        { status: 400 },
      );
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // Development mode: return mock when Stripe is not configured
    if (!stripeKey || stripeKey === 'placeholder') {
      return NextResponse.json({
        clientSecret: 'mock_secret_' + Date.now(),
        paymentIntentId: 'mock_pi_' + Date.now(),
        mode: 'development',
      });
    }

    // Production: use Stripe
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const stripe = require('stripe')(stripeKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses smallest currency unit
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      mode: 'production',
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Payment intent creation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

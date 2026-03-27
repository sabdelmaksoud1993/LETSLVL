interface PaymentIntentResponse {
  readonly clientSecret: string;
  readonly paymentIntentId: string;
  readonly mode: string;
}

export async function createPaymentIntent(
  amount: number,
  currency: string = 'AED',
): Promise<PaymentIntentResponse> {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency: currency.toLowerCase() }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Payment intent creation failed (${response.status}): ${errorBody}`,
    );
  }

  const data: PaymentIntentResponse = await response.json();
  return data;
}

/**
 * Converts an AED amount to the smallest currency unit (fils).
 * Stripe expects amounts in the smallest unit (e.g. 100 fils = 1 AED).
 */
export function formatStripeAmount(amount: number): number {
  return Math.round(amount * 100);
}

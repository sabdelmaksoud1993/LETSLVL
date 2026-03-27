'use client';

import { useCallback, useState } from 'react';
import { createPaymentIntent } from '@/lib/stripe';

export type PaymentMethod = 'card' | 'cod' | 'tabby';

interface PaymentFormProps {
  readonly amount: number;
  readonly currency?: string;
  readonly onPaymentComplete?: (result: PaymentResult) => void;
}

export interface PaymentResult {
  readonly method: PaymentMethod;
  readonly success: boolean;
  readonly paymentIntentId?: string;
  readonly mode?: string;
  readonly error?: string;
}

const PAYMENT_METHODS: ReadonlyArray<{
  readonly id: PaymentMethod;
  readonly label: string;
  readonly description: string;
}> = [
  {
    id: 'card',
    label: 'Card Payment',
    description: 'Pay securely with your credit or debit card',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when you receive your order. COD fee: 10 AED',
  },
  {
    id: 'tabby',
    label: 'Tabby - Buy Now, Pay Later',
    description: 'Split into 4 interest-free payments',
  },
] as const;

export function PaymentForm({
  amount,
  currency = 'AED',
  onPaymentComplete,
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [error, setError] = useState<string | null>(null);

  const processPayment = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      if (selectedMethod === 'card') {
        // Validate card fields
        if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
          setError('Please fill in all card fields');
          setIsProcessing(false);
          return;
        }

        const result = await createPaymentIntent(amount, currency);
        onPaymentComplete?.({
          method: 'card',
          success: true,
          paymentIntentId: result.paymentIntentId,
          mode: result.mode,
        });
      } else if (selectedMethod === 'cod') {
        // COD does not need a payment intent
        onPaymentComplete?.({
          method: 'cod',
          success: true,
        });
      } else if (selectedMethod === 'tabby') {
        // Tabby integration placeholder
        onPaymentComplete?.({
          method: 'tabby',
          success: true,
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Payment processing failed';
      setError(message);
      onPaymentComplete?.({
        method: selectedMethod,
        success: false,
        error: message,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedMethod, cardNumber, cardExpiry, cardCvc, amount, currency, onPaymentComplete]);

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                isSelected
                  ? 'border-lvl-yellow bg-lvl-slate/50 ring-1 ring-lvl-yellow'
                  : 'border-lvl-slate bg-lvl-carbon hover:border-lvl-smoke/50'
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    isSelected ? 'border-lvl-yellow' : 'border-lvl-smoke/50'
                  }`}
                >
                  {isSelected && (
                    <div className="h-2.5 w-2.5 rounded-full bg-lvl-yellow" />
                  )}
                </div>
                <div>
                  <p className="font-display text-sm font-semibold uppercase tracking-wide text-lvl-white">
                    {method.label}
                  </p>
                  <p className="font-body text-xs text-lvl-smoke mt-0.5">
                    {method.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Card Payment Fields */}
      {selectedMethod === 'card' && (
        <div className="space-y-4 rounded-lg border border-lvl-slate bg-lvl-carbon p-4">
          <div>
            <label
              htmlFor="card-number"
              className="mb-1.5 block font-body text-xs text-lvl-smoke"
            >
              Card Number
            </label>
            <input
              id="card-number"
              type="text"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              value={cardNumber}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
                setCardNumber(formatted);
              }}
              className="w-full rounded-md border border-lvl-slate bg-lvl-black px-3 py-2.5 font-body text-sm text-lvl-white placeholder:text-lvl-smoke/40 focus:border-lvl-yellow focus:outline-none focus:ring-1 focus:ring-lvl-yellow"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="card-expiry"
                className="mb-1.5 block font-body text-xs text-lvl-smoke"
              >
                Expiry
              </label>
              <input
                id="card-expiry"
                type="text"
                inputMode="numeric"
                placeholder="MM / YY"
                maxLength={7}
                value={cardExpiry}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  const formatted =
                    raw.length > 2 ? raw.slice(0, 2) + ' / ' + raw.slice(2, 4) : raw;
                  setCardExpiry(formatted);
                }}
                className="w-full rounded-md border border-lvl-slate bg-lvl-black px-3 py-2.5 font-body text-sm text-lvl-white placeholder:text-lvl-smoke/40 focus:border-lvl-yellow focus:outline-none focus:ring-1 focus:ring-lvl-yellow"
              />
            </div>
            <div>
              <label
                htmlFor="card-cvc"
                className="mb-1.5 block font-body text-xs text-lvl-smoke"
              >
                CVC
              </label>
              <input
                id="card-cvc"
                type="text"
                inputMode="numeric"
                placeholder="123"
                maxLength={4}
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-md border border-lvl-slate bg-lvl-black px-3 py-2.5 font-body text-sm text-lvl-white placeholder:text-lvl-smoke/40 focus:border-lvl-yellow focus:outline-none focus:ring-1 focus:ring-lvl-yellow"
              />
            </div>
          </div>
          <p className="font-body text-[10px] text-lvl-smoke/60">
            Card payments are processed securely via Stripe. Your card details
            are never stored on our servers.
          </p>
        </div>
      )}

      {/* COD Notice */}
      {selectedMethod === 'cod' && (
        <div className="rounded-lg border border-lvl-slate bg-lvl-carbon p-4">
          <p className="font-body text-sm text-lvl-smoke">
            Pay when you receive your order. A COD fee of{' '}
            <span className="font-semibold text-lvl-white">10 AED</span> will
            be added to your total.
          </p>
        </div>
      )}

      {/* Tabby Info */}
      {selectedMethod === 'tabby' && (
        <div className="rounded-lg border border-lvl-slate bg-lvl-carbon p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-16 items-center justify-center rounded bg-[#3CFFD0]/10 font-display text-xs font-bold text-[#3CFFD0]">
              tabby
            </div>
            <p className="font-body text-sm font-medium text-lvl-white">
              Buy Now, Pay Later
            </p>
          </div>
          <p className="font-body text-sm text-lvl-smoke">
            Split your purchase of{' '}
            <span className="font-semibold text-lvl-white">
              {amount.toFixed(2)} {currency}
            </span>{' '}
            into{' '}
            <span className="font-semibold text-lvl-white">
              4 interest-free payments
            </span>{' '}
            of{' '}
            <span className="font-semibold text-lvl-yellow">
              {(amount / 4).toFixed(2)} {currency}
            </span>{' '}
            each.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-3"
          role="alert"
        >
          <p className="font-body text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={processPayment}
        disabled={isProcessing}
        className="w-full rounded-lg bg-lvl-yellow py-3.5 font-display text-sm font-bold uppercase tracking-wider text-lvl-black transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing
          ? 'PROCESSING...'
          : selectedMethod === 'cod'
            ? `PAY ${(amount + 10).toFixed(2)} ${currency} ON DELIVERY`
            : `PAY ${amount.toFixed(2)} ${currency}`}
      </button>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Banknote,
  Clock,
  ChevronRight,
  Check,
  ShoppingBag,
  CheckCircle,
  LogIn,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getCartItems, clearCart, type CartEntry } from "@/lib/cart-store";
import { createOrder } from "@/lib/supabase-data";
import { useAuth } from "@/lib/auth-context";

type Step = 1 | 2 | 3;
type PaymentMethod = "card" | "cod" | "tabby";

const COUNTRIES = [
  "UAE",
  "Saudi Arabia",
  "Kuwait",
  "Oman",
  "Bahrain",
  "Qatar",
];

const FREE_SHIPPING_THRESHOLD = 200;
const SHIPPING_COST = 25;

interface ShippingForm {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  country: string;
}

const INITIAL_SHIPPING: ShippingForm = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  country: "UAE",
};

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [
    { num: 1, label: "Shipping" },
    { num: 2, label: "Payment" },
    { num: 3, label: "Review" },
  ] as const;

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-body font-bold transition-colors",
              currentStep > step.num
                ? "bg-lvl-success text-white"
                : currentStep === step.num
                  ? "bg-lvl-yellow text-lvl-black"
                  : "bg-lvl-slate text-lvl-smoke"
            )}
          >
            {currentStep > step.num ? (
              <Check className="h-4 w-4" />
            ) : (
              step.num
            )}
          </div>
          <span
            className={cn(
              "text-sm font-body hidden sm:block",
              currentStep >= step.num ? "text-lvl-white" : "text-lvl-smoke"
            )}
          >
            {step.label}
          </span>
          {idx < steps.length - 1 && (
            <ChevronRight className="h-4 w-4 text-lvl-slate mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

function InputField({
  label,
  id,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-body font-medium text-lvl-white mb-1.5"
      >
        {label}
        {required && <span className="text-lvl-error ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg bg-lvl-carbon border border-lvl-slate px-4 py-2.5 text-sm font-body text-lvl-white placeholder:text-lvl-smoke/50 focus:outline-none focus:ring-1 focus:ring-lvl-yellow focus:border-lvl-yellow transition-colors"
      />
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [shipping, setShipping] = useState<ShippingForm>(INITIAL_SHIPPING);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [items, setItems] = useState<CartEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const refreshCart = useCallback(() => {
    setItems(getCartItems());
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshCart();
  }, [refreshCart]);

  function updateShipping(field: keyof ShippingForm, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingCost =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;

  async function handlePlaceOrder() {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setPlacingOrder(true);
    setOrderError(null);

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        title: item.product.title,
        image: item.product.images[0] ?? "",
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const order = await createOrder({
        user_id: user.id,
        items: orderItems,
        subtotal,
        shipping: shippingCost,
        total,
        shipping_address: {
          full_name: shipping.fullName,
          phone: shipping.phone,
          line1: shipping.line1,
          line2: shipping.line2 || null,
          city: shipping.city,
          state: "",
          country: shipping.country,
          postal_code: "",
        },
        payment_method: paymentMethod,
      });

      clearCart();
      setOrderNumber((order as unknown as Record<string, unknown>).order_number as string ?? order.id);
    } catch (err) {
      setOrderError(
        err instanceof Error ? err.message : "Failed to place order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  if (!mounted) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-lvl-carbon mx-auto" />
          <div className="h-96 rounded-xl bg-lvl-carbon" />
        </div>
      </main>
    );
  }

  // Auth gate
  if (!authLoading && !user) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <LogIn className="mx-auto h-16 w-16 text-lvl-slate" />
        <h1 className="mt-6 font-display text-3xl uppercase text-lvl-white">
          Sign in to Checkout
        </h1>
        <p className="mt-2 text-lvl-smoke font-body">
          You need to be logged in to place an order.
        </p>
        <Link href="/auth/login" className="mt-8 inline-block">
          <Button
            variant="primary"
            size="lg"
            className="font-display uppercase tracking-wider"
          >
            Sign In
          </Button>
        </Link>
      </main>
    );
  }

  // Order confirmation
  if (orderNumber) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <CheckCircle className="mx-auto h-20 w-20 text-lvl-success" />
        <h1 className="mt-6 font-display text-3xl sm:text-4xl uppercase text-lvl-white">
          Order Placed!
        </h1>
        <p className="mt-2 text-lvl-smoke font-body">
          Thank you for your order.
        </p>
        <p className="mt-4 font-display text-xl text-lvl-yellow">
          {orderNumber}
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href="/account/orders">
            <Button
              variant="outline"
              size="lg"
              className="font-display uppercase tracking-wider"
            >
              View Orders
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="primary"
              size="lg"
              className="font-display uppercase tracking-wider"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-lvl-slate" />
        <h1 className="mt-6 font-display text-3xl uppercase text-lvl-white">
          Nothing to Checkout
        </h1>
        <p className="mt-2 text-lvl-smoke font-body">
          Your cart is empty. Add some items first.
        </p>
        <Link href="/" className="mt-8 inline-block">
          <Button
            variant="primary"
            size="lg"
            className="font-display uppercase tracking-wider"
          >
            Continue Shopping
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <h1 className="pt-6 font-display text-3xl sm:text-4xl uppercase tracking-tight text-lvl-white text-center">
        Checkout
      </h1>

      <div className="mt-6">
        <StepIndicator currentStep={step} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="rounded-xl bg-lvl-carbon p-6">
              <h2 className="font-display text-xl uppercase tracking-wider text-lvl-white mb-6">
                Shipping Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  id="fullName"
                  value={shipping.fullName}
                  onChange={(val) => updateShipping("fullName", val)}
                  required
                  placeholder="John Doe"
                />
                <InputField
                  label="Phone"
                  id="phone"
                  type="tel"
                  value={shipping.phone}
                  onChange={(val) => updateShipping("phone", val)}
                  required
                  placeholder="+971 50 123 4567"
                />
                <div className="sm:col-span-2">
                  <InputField
                    label="Address Line 1"
                    id="line1"
                    value={shipping.line1}
                    onChange={(val) => updateShipping("line1", val)}
                    required
                    placeholder="Street address"
                  />
                </div>
                <div className="sm:col-span-2">
                  <InputField
                    label="Address Line 2"
                    id="line2"
                    value={shipping.line2}
                    onChange={(val) => updateShipping("line2", val)}
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>
                <InputField
                  label="City"
                  id="city"
                  value={shipping.city}
                  onChange={(val) => updateShipping("city", val)}
                  required
                  placeholder="Dubai"
                />
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-body font-medium text-lvl-white mb-1.5"
                  >
                    Country<span className="text-lvl-error ml-0.5">*</span>
                  </label>
                  <select
                    id="country"
                    value={shipping.country}
                    onChange={(e) => updateShipping("country", e.target.value)}
                    className="w-full rounded-lg bg-lvl-carbon border border-lvl-slate px-4 py-2.5 text-sm font-body text-lvl-white focus:outline-none focus:ring-1 focus:ring-lvl-yellow focus:border-lvl-yellow transition-colors appearance-none cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setStep(2)}
                  className="font-display uppercase tracking-wider"
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="rounded-xl bg-lvl-carbon p-6">
              <h2 className="font-display text-xl uppercase tracking-wider text-lvl-white mb-6">
                Payment Method
              </h2>

              <div className="space-y-3">
                {/* Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={cn(
                    "w-full flex items-center gap-4 rounded-xl border-2 p-4 transition-colors text-left",
                    paymentMethod === "card"
                      ? "border-lvl-yellow bg-lvl-yellow/5"
                      : "border-lvl-slate hover:border-lvl-smoke"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      paymentMethod === "card"
                        ? "bg-lvl-yellow text-lvl-black"
                        : "bg-lvl-slate text-lvl-smoke"
                    )}
                  >
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lvl-white font-body font-medium text-sm">
                      Credit / Debit Card
                    </p>
                    <p className="text-lvl-smoke font-body text-xs mt-0.5">
                      Visa, Mastercard, AMEX
                    </p>
                  </div>
                  <div
                    className={cn(
                      "ml-auto h-5 w-5 rounded-full border-2",
                      paymentMethod === "card"
                        ? "border-lvl-yellow bg-lvl-yellow"
                        : "border-lvl-slate"
                    )}
                  >
                    {paymentMethod === "card" && (
                      <Check className="h-full w-full text-lvl-black p-0.5" />
                    )}
                  </div>
                </button>

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={cn(
                    "w-full flex items-center gap-4 rounded-xl border-2 p-4 transition-colors text-left",
                    paymentMethod === "cod"
                      ? "border-lvl-yellow bg-lvl-yellow/5"
                      : "border-lvl-slate hover:border-lvl-smoke"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      paymentMethod === "cod"
                        ? "bg-lvl-yellow text-lvl-black"
                        : "bg-lvl-slate text-lvl-smoke"
                    )}
                  >
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lvl-white font-body font-medium text-sm">
                      Cash on Delivery
                    </p>
                    <p className="text-lvl-smoke font-body text-xs mt-0.5">
                      Pay when you receive your order
                    </p>
                  </div>
                  <div
                    className={cn(
                      "ml-auto h-5 w-5 rounded-full border-2",
                      paymentMethod === "cod"
                        ? "border-lvl-yellow bg-lvl-yellow"
                        : "border-lvl-slate"
                    )}
                  >
                    {paymentMethod === "cod" && (
                      <Check className="h-full w-full text-lvl-black p-0.5" />
                    )}
                  </div>
                </button>

                {/* Tabby BNPL */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("tabby")}
                  className={cn(
                    "w-full flex items-center gap-4 rounded-xl border-2 p-4 transition-colors text-left",
                    paymentMethod === "tabby"
                      ? "border-lvl-yellow bg-lvl-yellow/5"
                      : "border-lvl-slate hover:border-lvl-smoke"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      paymentMethod === "tabby"
                        ? "bg-lvl-yellow text-lvl-black"
                        : "bg-lvl-slate text-lvl-smoke"
                    )}
                  >
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lvl-white font-body font-medium text-sm">
                      Tabby — Buy Now, Pay Later
                    </p>
                    <p className="text-lvl-smoke font-body text-xs mt-0.5">
                      Split into 4 interest-free payments
                    </p>
                  </div>
                  <div
                    className={cn(
                      "ml-auto h-5 w-5 rounded-full border-2",
                      paymentMethod === "tabby"
                        ? "border-lvl-yellow bg-lvl-yellow"
                        : "border-lvl-slate"
                    )}
                  >
                    {paymentMethod === "tabby" && (
                      <Check className="h-full w-full text-lvl-black p-0.5" />
                    )}
                  </div>
                </button>
              </div>

              {/* Card form (mock) */}
              {paymentMethod === "card" && (
                <div className="mt-6 space-y-4 rounded-xl bg-lvl-black/50 p-4">
                  <InputField
                    label="Card Number"
                    id="cardNumber"
                    value=""
                    onChange={() => {}}
                    placeholder="1234 5678 9012 3456"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Expiry"
                      id="cardExpiry"
                      value=""
                      onChange={() => {}}
                      placeholder="MM/YY"
                    />
                    <InputField
                      label="CVC"
                      id="cardCvc"
                      value=""
                      onChange={() => {}}
                      placeholder="123"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(1)}
                  className="font-display uppercase tracking-wider"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setStep(3)}
                  className="font-display uppercase tracking-wider"
                >
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Shipping summary */}
              <div className="rounded-xl bg-lvl-carbon p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-lg uppercase tracking-wider text-lvl-white">
                    Shipping
                  </h2>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-lvl-yellow text-sm font-body hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-sm font-body text-lvl-smoke space-y-0.5">
                  <p className="text-lvl-white font-medium">
                    {shipping.fullName || "Not provided"}
                  </p>
                  <p>{shipping.line1 || "No address"}</p>
                  {shipping.line2 && <p>{shipping.line2}</p>}
                  <p>
                    {shipping.city}
                    {shipping.city && ", "}
                    {shipping.country}
                  </p>
                  <p>{shipping.phone}</p>
                </div>
              </div>

              {/* Payment summary */}
              <div className="rounded-xl bg-lvl-carbon p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-lg uppercase tracking-wider text-lvl-white">
                    Payment
                  </h2>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-lvl-yellow text-sm font-body hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm font-body text-lvl-smoke">
                  {paymentMethod === "card" && "Credit / Debit Card"}
                  {paymentMethod === "cod" && "Cash on Delivery"}
                  {paymentMethod === "tabby" && "Tabby — Buy Now, Pay Later"}
                </p>
              </div>

              {/* Items */}
              <div className="rounded-xl bg-lvl-carbon p-6">
                <h2 className="font-display text-lg uppercase tracking-wider text-lvl-white mb-4">
                  Items ({items.length})
                </h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}-${item.color}`}
                      className="flex items-center gap-3"
                    >
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-lvl-slate shrink-0">
                        <Image
                          src={item.product.images[0] ?? ""}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lvl-white text-sm font-body font-medium truncate">
                          {item.product.title}
                        </p>
                        <p className="text-lvl-smoke text-xs font-body">
                          Qty: {item.quantity}
                          {item.size ? ` / ${item.size}` : ""}
                          {item.color ? ` / ${item.color}` : ""}
                        </p>
                      </div>
                      <span className="text-lvl-white text-sm font-body font-medium shrink-0">
                        {formatPrice(
                          item.product.price * item.quantity,
                          item.product.currency
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {orderError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4">
                  <p className="text-red-400 text-sm font-body">{orderError}</p>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(2)}
                  className="font-display uppercase tracking-wider"
                  disabled={placingOrder}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="font-display uppercase tracking-wider"
                >
                  {placingOrder ? "PLACING ORDER..." : "PLACE ORDER"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-xl bg-lvl-carbon p-6">
            <h2 className="font-display text-xl uppercase tracking-wider text-lvl-white mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm font-body">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="flex justify-between"
                >
                  <span className="text-lvl-smoke truncate mr-2">
                    {item.product.title} x{item.quantity}
                  </span>
                  <span className="text-lvl-white font-medium shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="border-t border-lvl-slate pt-3 flex justify-between">
                <span className="text-lvl-smoke">Subtotal</span>
                <span className="text-lvl-white font-medium">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-lvl-smoke">Shipping</span>
                <span className="text-lvl-white font-medium">
                  {shippingCost === 0 ? (
                    <span className="text-lvl-success">FREE</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="border-t border-lvl-slate pt-3 flex justify-between">
                <span className="text-lvl-white font-medium">Total</span>
                <span className="text-lvl-white font-display text-lg">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

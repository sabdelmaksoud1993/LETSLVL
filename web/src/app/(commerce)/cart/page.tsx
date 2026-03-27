"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  getCartItems,
  updateQuantity,
  removeFromCart,
  getCartTotal,
  type CartEntry,
} from "@/lib/cart-store";

const FREE_SHIPPING_THRESHOLD = 200;
const SHIPPING_COST = 25;

export default function CartPage() {
  const [items, setItems] = useState<CartEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  const refreshCart = useCallback(() => {
    setItems(getCartItems());
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshCart();

    const onCartUpdate = () => refreshCart();
    window.addEventListener("cart-updated", onCartUpdate);
    return () => window.removeEventListener("cart-updated", onCartUpdate);
  }, [refreshCart]);

  function handleUpdateQuantity(
    productId: string,
    size: string | null,
    color: string | null,
    qty: number
  ) {
    const updated = updateQuantity(productId, size, color, qty);
    setItems(updated);
  }

  function handleRemove(
    productId: string,
    size: string | null,
    color: string | null
  ) {
    const updated = removeFromCart(productId, size, color);
    setItems(updated);
  }

  if (!mounted) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-lvl-white">
          Your Cart
        </h1>
        <div className="mt-8 animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-lvl-carbon" />
          ))}
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-lvl-slate" />
        <h1 className="mt-6 font-display text-3xl uppercase text-lvl-white">
          Your cart is empty
        </h1>
        <p className="mt-2 text-lvl-smoke font-body">
          Looks like you haven&apos;t added anything yet.
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

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <h1 className="pt-6 font-display text-3xl sm:text-4xl uppercase tracking-tight text-lvl-white">
        Your Cart
      </h1>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const lineTotal = item.product.price * item.quantity;
            const key = `${item.product.id}-${item.size}-${item.color}`;

            return (
              <div
                key={key}
                className="flex gap-4 rounded-xl bg-lvl-carbon p-4"
              >
                {/* Image */}
                <Link
                  href={`/product/${item.product.id}`}
                  className="relative h-24 w-24 shrink-0 rounded-lg overflow-hidden bg-lvl-slate"
                >
                  <Image
                    src={item.product.images[0] ?? ""}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </Link>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <Link
                      href={`/product/${item.product.id}`}
                      className="text-lvl-white font-body font-medium text-sm hover:text-lvl-yellow transition-colors line-clamp-1"
                    >
                      {item.product.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-lvl-smoke font-body">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    {/* Quantity controls */}
                    <div className="inline-flex items-center rounded-lg bg-lvl-slate">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product.id,
                            item.size,
                            item.color,
                            item.quantity - 1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center text-lvl-white hover:text-lvl-yellow transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm text-lvl-white font-body font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product.id,
                            item.size,
                            item.color,
                            item.quantity + 1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center text-lvl-white hover:text-lvl-yellow transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lvl-white font-body font-semibold text-sm">
                        {formatPrice(lineTotal, item.product.currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(item.product.id, item.size, item.color)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-lvl-smoke hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        aria-label={`Remove ${item.product.title} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-xl bg-lvl-carbon p-6">
            <h2 className="font-display text-xl uppercase tracking-wider text-lvl-white mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-lvl-smoke">Subtotal</span>
                <span className="text-lvl-white font-medium">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-lvl-smoke">Shipping</span>
                <span className="text-lvl-white font-medium">
                  {shipping === 0 ? (
                    <span className="text-lvl-success">FREE</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-lvl-smoke">
                  Free shipping on orders over{" "}
                  {formatPrice(FREE_SHIPPING_THRESHOLD)}
                </p>
              )}
              <div className="border-t border-lvl-slate pt-3 flex justify-between">
                <span className="text-lvl-white font-medium">Total</span>
                <span className="text-lvl-white font-display text-lg">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <Link href="/checkout" className="mt-6 block">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                className="font-display uppercase tracking-wider"
              >
                Proceed to Checkout
              </Button>
            </Link>

            <Link
              href="/"
              className="mt-3 block text-center text-sm text-lvl-smoke font-body hover:text-lvl-yellow transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

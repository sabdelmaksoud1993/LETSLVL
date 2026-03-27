"use client";

import type { Product } from "@/types/database";

export interface CartEntry {
  product: Product;
  quantity: number;
  size: string | null;
  color: string | null;
}

const CART_KEY = "lvl_cart";

function getCart(): CartEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveCart(cart: CartEntry[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(product: Product, size: string | null, color: string | null): CartEntry[] {
  const cart = getCart();
  const existingIndex = cart.findIndex(
    (item) => item.product.id === product.id && item.size === size && item.color === color
  );

  if (existingIndex >= 0) {
    const updated = cart.map((item, i) =>
      i === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
    );
    saveCart(updated);
    return updated;
  }

  const updated = [...cart, { product, quantity: 1, size, color }];
  saveCart(updated);
  return updated;
}

export function removeFromCart(productId: string, size: string | null, color: string | null): CartEntry[] {
  const cart = getCart();
  const updated = cart.filter(
    (item) => !(item.product.id === productId && item.size === size && item.color === color)
  );
  saveCart(updated);
  return updated;
}

export function updateQuantity(productId: string, size: string | null, color: string | null, quantity: number): CartEntry[] {
  const cart = getCart();
  if (quantity <= 0) return removeFromCart(productId, size, color);

  const updated = cart.map((item) =>
    item.product.id === productId && item.size === size && item.color === color
      ? { ...item, quantity }
      : item
  );
  saveCart(updated);
  return updated;
}

export function getCartItems(): CartEntry[] {
  return getCart();
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function clearCart(): void {
  saveCart([]);
}

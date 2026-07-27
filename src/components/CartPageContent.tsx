"use client";

import { CartView } from "@/components/CartView";

export function CartPageContent() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-bold uppercase tracking-widest text-ink-muted">
        Cart
      </p>
      <h1 className="mt-2 font-poster text-4xl uppercase text-ink">Your bag</h1>
      <div className="mt-12">
        <CartView />
      </div>
    </div>
  );
}

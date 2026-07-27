"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { formatPrice } from "@/lib/format";
import { logoutCustomerAction } from "@/lib/shopify/customer-actions";
import type { Customer } from "@/lib/shopify/customer";
import { site } from "@/lib/site";

type AccountDashboardProps = {
  customer: Customer;
};

function formatOrderDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(site.locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusLabel(value: string | null) {
  if (!value) return "—";
  return value.replace(/_/g, " ").toLowerCase();
}

export function AccountDashboard({ customer }: AccountDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const displayName =
    [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
    customer.email;

  function handleLogout() {
    startTransition(async () => {
      await logoutCustomerAction();
      router.refresh();
    });
  }

  return (
    <div className="w-full text-left">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink/15 pb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
            Signed in
          </p>
          <h2 className="mt-2 font-display text-3xl italic leading-none text-ink sm:text-4xl">
            {displayName}
          </h2>
          <p className="mt-2 text-sm font-semibold text-ink-muted">
            {customer.email}
          </p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={handleLogout}
          className="border-2 border-ink px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand disabled:opacity-50"
        >
          {isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>

      <div className="mt-8">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
            Order history
          </h3>
          <p className="text-xs font-semibold text-ink-muted">
            {customer.numberOfOrders}{" "}
            {customer.numberOfOrders === 1 ? "order" : "orders"}
          </p>
        </div>

        {customer.orders.length === 0 ? (
          <div className="mt-6 border-2 border-dashed border-ink/20 px-6 py-10 text-center">
            <p className="font-display text-2xl italic text-ink-muted">
              No orders yet
            </p>
            <p className="mt-2 text-sm font-semibold text-ink-muted">
              Guest checkout works anytime — orders appear here after you shop
              while signed in.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex border-2 border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
            >
              Shop all
            </Link>
          </div>
        ) : (
          <ul className="mt-6 divide-y-2 divide-ink/10 border-2 border-ink/15">
            {customer.orders.map((order) => {
              const preview = order.lineItems[0];
              return (
                <li key={order.id} className="flex gap-4 px-4 py-5 sm:px-5">
                  <div className="relative h-16 w-16 shrink-0 bg-white sm:h-20 sm:w-20">
                    {preview?.image ? (
                      <Image
                        src={preview.image.url}
                        alt={preview.image.altText ?? preview.title}
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-bold text-ink">
                        Order #{order.orderNumber}
                      </p>
                      <p className="font-poster text-lg uppercase text-ink">
                        {formatPrice(
                          order.totalPrice.amount,
                          order.totalPrice.currencyCode,
                        )}
                      </p>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-ink-muted">
                      {formatOrderDate(order.processedAt)} ·{" "}
                      {statusLabel(order.fulfillmentStatus)} ·{" "}
                      {statusLabel(order.financialStatus)}
                    </p>
                    {preview ? (
                      <p className="mt-2 truncate text-sm font-semibold text-ink">
                        {preview.title}
                        {order.lineItems.length > 1
                          ? ` +${order.lineItems.length - 1} more`
                          : ""}
                      </p>
                    ) : null}
                    <a
                      href={order.statusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted underline underline-offset-4 hover:text-ink"
                    >
                      Track order ↗
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

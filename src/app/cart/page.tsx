import type { Metadata } from "next";
import { CartPageContent } from "@/components/CartPageContent";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cart",
  description: `Your ${site.name} bag.`,
};

export default function CartPage() {
  return <CartPageContent />;
}

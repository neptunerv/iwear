import type { Metadata } from "next";
import { WishlistPageContent } from "@/components/WishlistPageContent";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Wishlist",
  description: `Saved frames at ${site.name}.`,
};

export default function WishlistPage() {
  return <WishlistPageContent />;
}

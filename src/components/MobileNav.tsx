"use client";

import Link from "next/link";
import { type ReactNode, useEffect } from "react";
import { CloseIcon } from "@/components/icons";
import { navLinks } from "@/lib/nav";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
  logo: ReactNode;
};

const menuLinks = [
  { href: "/shop", label: "Shop All" },
  ...navLinks.filter((link) => link.href !== "/shop"),
  { href: "/about", label: "About" },
  { href: "/account", label: "Account" },
  { href: "/cart", label: "Cart" },
] as const;

export function MobileNav({ open, onClose, logo }: MobileNavProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-ink text-cream md:hidden">
      <div className="flex items-center justify-between px-5 pt-4">
        <div onClick={onClose} className="flex shrink-0 items-center text-cream">
          {logo}
        </div>

        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="transition-opacity hover:opacity-60"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <nav
        aria-label="Mobile"
        className="flex flex-1 flex-col items-center justify-center px-8"
      >
        <ul className="flex flex-col items-center gap-7 text-center">
          {menuLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="font-display text-4xl italic leading-none transition-opacity hover:opacity-60"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

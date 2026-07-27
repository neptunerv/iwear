"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CloseIcon } from "@/components/icons";
import { navLinks } from "@/lib/nav";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: MobileNavProps) {
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
    <div className="fixed inset-0 z-[55] md:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-ink/20"
      />
      <nav
        aria-label="Mobile"
        className="absolute inset-x-0 top-0 border-b-2 border-ink bg-brand text-ink shadow-[0_8px_24px_rgba(13,11,9,0.08)]"
      >
        <div className="flex h-14 items-center justify-between px-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">Menu</p>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="transition-opacity hover:opacity-60"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <ul className="border-t-2 border-ink/15 px-5 py-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="block py-3.5 text-sm font-bold uppercase tracking-[0.16em]"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/account"
              onClick={onClose}
              className="block py-3.5 text-sm font-bold uppercase tracking-[0.16em]"
            >
              Account
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              onClick={onClose}
              className="block py-3.5 text-sm font-bold uppercase tracking-[0.16em]"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/faq"
              onClick={onClose}
              className="block py-3.5 text-sm font-bold uppercase tracking-[0.16em]"
            >
              FAQ
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

import Link from "next/link";
import { HeaderShell } from "@/components/HeaderShell";
import { IwearLogo } from "@/components/IwearLogo";
import { navLinks } from "@/lib/nav";

export function Header() {
  return (
    <HeaderShell
      logo={
        <Link href="/" className="flex shrink-0 items-center">
          <IwearLogo className="h-7 w-auto" title="iWear Sunglasses" />
        </Link>
      }
      nav={
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="nav-link text-xs font-bold uppercase tracking-[0.12em]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      }
    />
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/lib/utils";
import { Wordmark } from "@/components/brand/wordmark";

const NAV = [
  { href: "/", label: "Search" },
  { href: "/history", label: "History" },
];

// MOCK signed-in identity; Lane 1/5 replace with the ButterBase auth session.
const MOCK_EMAIL = "abhaykerala@gmail.com";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-sm transition-colors duration-[120ms]",
        active ? "text-ink" : "text-muted hover:text-ink",
      )}
    >
      {active && <span aria-hidden className="h-1.5 w-1.5 bg-accent" />}
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <Link href="/" aria-label="Vertex home">
              <Wordmark />
            </Link>
            <nav className="flex items-center gap-7">
              {NAV.map((n) => (
                <NavLink key={n.href} {...n} />
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden font-mono text-[12px] text-muted sm:inline">
              {MOCK_EMAIL}
            </span>
            <Link
              href="/sign-in"
              className="text-sm text-muted transition-colors duration-[120ms] hover:text-ink"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1120px] px-6 py-12">{children}</main>
    </div>
  );
}

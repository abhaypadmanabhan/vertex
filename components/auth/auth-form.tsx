"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import { Wordmark } from "@/components/brand/wordmark";
import { TAGLINE_MONO } from "@/components/brand/constants";

type Mode = "sign-in" | "sign-up";

function Field({
  id,
  label,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} autoComplete={autoComplete} required />
    </div>
  );
}

/**
 * Sign in / sign up (#18). Wires to ButterBase auth once Lane 1 merges; for now
 * it validates required fields and continues to the app (demo mode).
 */
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const isSignIn = mode === "sign-in";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    // TODO(Lane 5): call ButterBase auth (lib/api). Mock continues to the app.
    router.push("/");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between border-r border-line p-12 lg:flex">
        <Wordmark mark size="lg" />
        <div>
          <Kicker>Company intelligence</Kicker>
          <p className="mt-4 max-w-[15ch] font-display text-[40px] font-semibold leading-[1.02] tracking-[-0.02em]">
            Any company. Its real neighborhood.
          </p>
          <p className="mt-4 max-w-[44ch] text-[14px] leading-relaxed text-muted">
            Enrich a company live, write it into a shared graph, and rank
            competitors by shared investors, tech, and markets.
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.08em] text-muted">
          <span aria-hidden className="h-2 w-3 shrink-0 bg-accent" />
          {TAGLINE_MONO}
        </div>
      </aside>

      <main className="flex items-center justify-center p-8">
        <div className="w-full max-w-[360px]">
          <div className="mb-10 lg:hidden">
            <Wordmark mark />
          </div>

          <Kicker>{isSignIn ? "Sign in" : "Create account"}</Kicker>
          <h1 className="mt-4 font-display text-[32px] font-semibold tracking-[-0.02em]">
            {isSignIn ? "Welcome back" : "Create your account"}
          </h1>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
            />
            <Field
              id="password"
              label="Password"
              type="password"
              autoComplete={isSignIn ? "current-password" : "new-password"}
            />
            {!isSignIn && (
              <Field
                id="confirm"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
              />
            )}
            <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
              {isSignIn ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-[13px] text-muted">
            {isSignIn ? "New to Vertex? " : "Already have an account? "}
            <Link
              href={isSignIn ? "/sign-up" : "/sign-in"}
              className="text-ink underline decoration-line-strong underline-offset-2 transition-colors hover:text-accent"
            >
              {isSignIn ? "Create an account" : "Sign in"}
            </Link>
          </p>

          <p className="mt-10 font-mono text-[11px] text-muted">
            Demo mode — credentials aren&apos;t checked yet.
          </p>
        </div>
      </main>
    </div>
  );
}

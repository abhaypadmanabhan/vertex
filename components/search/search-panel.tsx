"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";

const EXAMPLES = ["Tsenta", "Baseten", "Modal"];

/** Idle search hero (#16). The thesis: any company → its real neighborhood. */
export function SearchPanel({ onSearch }: { onSearch: (name: string) => void }) {
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = q.trim();
    if (name) onSearch(name);
  };

  return (
    <div className="max-w-[760px] animate-type-settle">
      <Kicker>Company intelligence</Kicker>

      <h1 className="mt-6 font-display text-[clamp(40px,7vw,72px)] font-semibold leading-[0.98] tracking-[-0.02em]">
        Any company.
        <br />
        <span className="text-muted">Its real neighborhood.</span>
      </h1>

      <p className="mt-6 max-w-[54ch] text-[15px] leading-relaxed text-muted">
        Type a name — even one launched days ago. Vertex enriches it from public
        sources, writes it into a shared graph, and ranks competitors by shared
        investors, tech, and markets.
      </p>

      <form onSubmit={submit} className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Company name — e.g. Tsenta"
          aria-label="Company name"
          autoFocus
          className="h-11 flex-1 text-[15px]"
        />
        <Button type="submit" size="lg" disabled={!q.trim()}>
          Enrich
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="kicker">Try</span>
        {EXAMPLES.map((x) => (
          <button
            key={x}
            type="button"
            onClick={() => {
              setQ(x);
              onSearch(x);
            }}
            className="rounded-sm border border-line-strong px-2.5 py-1 font-mono text-[12px] text-muted transition-colors duration-[120ms] hover:border-ink/40 hover:text-ink"
          >
            {x}
          </button>
        ))}
      </div>
    </div>
  );
}

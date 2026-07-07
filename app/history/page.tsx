import { AppShell } from "@/components/app-shell";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { HistoryList } from "@/components/history/history-list";
import { MOCK_HISTORY } from "@/components/mock-data";

export const metadata = { title: "History — Vertex" };

export default function HistoryPage() {
  // MOCK history; Lane 5 replaces with `getHistory(jwt)` (RLS-scoped per user).
  const records = MOCK_HISTORY;

  return (
    <AppShell>
      <div className="flex flex-col gap-10">
        <div>
          <Kicker>History</Kicker>
          <h1 className="mt-4 font-display text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.01em]">
            Search history
          </h1>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-muted">
            Companies you&apos;ve enriched, newest first — scoped to your
            account.
          </p>
        </div>

        <Section label="All searches" meta={`${records.length} total`}>
          <HistoryList records={records} />
        </Section>
      </div>
    </AppShell>
  );
}

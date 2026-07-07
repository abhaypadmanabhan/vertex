import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { SearchExperience } from "@/components/search/search-experience";

export default function Page() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <SearchExperience />
      </Suspense>
    </AppShell>
  );
}

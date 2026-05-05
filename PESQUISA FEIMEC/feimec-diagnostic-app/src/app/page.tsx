import { AppShell } from "@/components/app-shell";
import { PortfolioOverview } from "@/components/portfolio-overview";

export default function Home() {
  return (
    <AppShell>
      <PortfolioOverview />
    </AppShell>
  );
}

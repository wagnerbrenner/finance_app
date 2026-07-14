import type { Metadata } from "next";
import { AppShell } from "@/features/shell/components/app-shell";
import { EmptyState } from "@/shared/components/empty-state";

export const metadata: Metadata = {
  title: "Dashboard · Finance OS",
};

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <EmptyState
        title="Em breve — conecte suas contas"
        description="Na próxima fase você cadastra contas e transações. O dashboard executivo nasce a partir desses dados."
      />
    </AppShell>
  );
}

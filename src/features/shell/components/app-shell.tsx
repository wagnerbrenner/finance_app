import { AppSidebar } from "@/features/shell/components/app-sidebar";
import { AppTopbar } from "@/features/shell/components/app-topbar";
import { MobileBottomNav } from "@/features/shell/components/mobile-bottom-nav";
import { LaunchHost } from "@/features/shell/components/launch-host";
import { SupportWidget } from "@/features/support/components/support-widget";
import { getCurrentProfile } from "@/features/auth/actions";
import { redirect } from "next/navigation";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
};

export async function AppShell({ children, title }: AppShellProps) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          title={title}
          email={profile.email}
          fullName={profile.fullName}
          avatarUrl={profile.avatarUrl}
        />
        <main className="flex-1 overflow-x-hidden p-3 pb-28 sm:p-4 md:p-6 md:pb-6">
          {children}
        </main>
        <MobileBottomNav />
        <LaunchHost />
        <SupportWidget userEmail={profile.email} />
      </div>
    </div>
  );
}

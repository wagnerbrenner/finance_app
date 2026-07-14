import { AppSidebar } from "@/features/shell/components/app-sidebar";
import { AppTopbar } from "@/features/shell/components/app-topbar";
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
    <div className="flex min-h-svh bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          title={title}
          email={profile.email}
          fullName={profile.fullName}
          avatarUrl={profile.avatarUrl}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

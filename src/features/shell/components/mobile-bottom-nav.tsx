"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV } from "@/features/shell/nav-items";
import { useUiStore } from "@/shared/stores/ui-store";

export function MobileBottomNav() {
  const pathname = usePathname();
  const setMobileOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const openLaunch = useUiStore((s) => s.openLaunch);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Navegação principal"
    >
      <div className="grid h-[4.25rem] grid-cols-5 items-end px-1 pb-1">
        {PRIMARY_NAV.slice(0, 2).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium",
                active ? "text-teal-400" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.title}
            </Link>
          );
        })}

        <div className="flex justify-center pb-1">
          <button
            type="button"
            onClick={() => openLaunch()}
            className="-mt-6 flex size-14 items-center justify-center rounded-full bg-teal-500 text-black shadow-lg shadow-teal-500/25 transition active:scale-95"
            aria-label="Novo lançamento"
          >
            <Plus className="size-7" strokeWidth={2.5} />
          </button>
        </div>

        {PRIMARY_NAV.slice(2).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium",
                active ? "text-teal-400" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.title}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex min-h-12 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium text-muted-foreground"
        >
          <MoreHorizontal className="size-5" />
          Mais
        </button>
      </div>
    </nav>
  );
}

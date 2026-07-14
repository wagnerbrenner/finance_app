"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/features/shell/nav-items";
import { useUiStore } from "@/shared/stores/ui-store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
      <img
        src="/logo.svg"
        alt=""
        width={32}
        height={32}
        className="size-8 rounded-md"
      />
      {!collapsed ? (
        <span className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight">
          Finance OS
        </span>
      ) : null}
    </Link>
  );
}

function NavList({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-2">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        if (!item.enabled) {
          return (
            <span
              key={item.href}
              title="Em breve"
              className={cn(
                "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground/50",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed ? <span>{item.title}</span> : null}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
              collapsed && "justify-center px-0",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {active ? (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-lg bg-muted"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            ) : null}
            <Icon className="relative z-10 size-4 shrink-0" />
            {!collapsed ? (
              <span className="relative z-10">{item.title}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebarCollapsed);
  const mobileOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileSidebarOpen);

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-border/60 bg-sidebar py-4 md:flex",
          collapsed ? "w-[68px]" : "w-60",
        )}
      >
        <div
          className={cn(
            "mb-6 flex items-center",
            collapsed ? "justify-center px-2" : "justify-between px-3",
          )}
        >
          <Brand collapsed={collapsed} />
          {!collapsed ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={toggle}
              aria-label="Recolher menu"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-2 top-4"
              onClick={toggle}
              aria-label="Expandir menu"
            >
              <PanelLeft className="size-4" />
            </Button>
          )}
        </div>
        <NavList collapsed={collapsed} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetHeader className="border-b border-border/60 px-4 py-4 text-left">
            <SheetTitle className="sr-only">Navegação</SheetTitle>
            <Brand />
          </SheetHeader>
          <div className="py-4">
            <NavList onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

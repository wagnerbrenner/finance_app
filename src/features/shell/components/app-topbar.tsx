"use client";

import Link from "next/link";
import { CreditCard, LogOut, Menu, Plus, UserRound } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { useUiStore } from "@/shared/stores/ui-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NotificationsBell } from "@/features/notifications/components/notifications-bell";

type UserMenuProps = {
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
};

export function UserMenu({ email, fullName, avatarUrl }: UserMenuProps) {
  const initials = (fullName ?? email)
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-7">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-teal-500/15 text-xs text-teal-300">
            {initials || <UserRound className="size-3.5" />}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-[140px] truncate sm:inline">
          {fullName ?? email}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              {fullName ?? "Conta"}
            </span>
            <span className="truncate text-xs text-muted-foreground">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/app/assinatura" />}>
          <CreditCard className="size-4" />
          Assinatura
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            void signOut();
          }}
        >
          <LogOut className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type AppTopbarProps = {
  title: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  planBadge?: string | null;
};

export function AppTopbar({ title, email, fullName, avatarUrl, planBadge }: AppTopbarProps) {
  const setMobileOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const openLaunch = useUiStore((s) => s.openLaunch);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-border/60 bg-background/80 px-3 backdrop-blur-md sm:gap-3 md:px-6">
      <div className="flex min-w-0 items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="size-4" />
        </Button>
        <h1 className="truncate font-[family-name:var(--font-display)] text-base font-semibold tracking-tight sm:text-lg">
          {title}
        </h1>
        {planBadge ? (
          <Badge variant="secondary" className="hidden shrink-0 text-[10px] sm:inline-flex">
            {planBadge}
          </Badge>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => openLaunch()}
          aria-label="Novo lançamento"
        >
          <Plus className="size-5 text-teal-400" />
        </Button>
        <Button
          type="button"
          className="hidden md:inline-flex"
          onClick={() => openLaunch()}
        >
          Novo lançamento
        </Button>
        <NotificationsBell />
        <UserMenu email={email} fullName={fullName} avatarUrl={avatarUrl} />
      </div>
    </header>
  );
}

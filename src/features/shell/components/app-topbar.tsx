"use client";

import { LogOut, Menu, UserRound } from "lucide-react";
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
};

export function AppTopbar({ title, email, fullName, avatarUrl }: AppTopbarProps) {
  const setMobileOpen = useUiStore((s) => s.setMobileSidebarOpen);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2">
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
        <h1 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          {title}
        </h1>
      </div>
      <UserMenu email={email} fullName={fullName} avatarUrl={avatarUrl} />
    </header>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchDueNotifications } from "@/features/finance/lookups";
import type { FinanceNotification } from "@/server/services/notifications.service";

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<FinanceNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pending, startLoad] = useTransition();

  function load() {
    if (loaded) return;
    startLoad(() => {
      void fetchDueNotifications().then((items) => {
        setNotifications(items);
        setLoaded(true);
      });
    });
  }

  useEffect(() => {
    const t = window.setTimeout(load, 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) load();
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label="Notificações"
          />
        }
      >
        <Bell className="size-4" />
        {notifications.length > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-teal-500 text-[10px] font-bold text-black">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuLabel>Vencimentos</DropdownMenuLabel>
        <div className="max-h-80 space-y-1 overflow-auto">
          {pending && !loaded ? (
            <p className="p-2 text-sm text-muted-foreground">Carregando…</p>
          ) : notifications.length ? (
            notifications.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="cursor-pointer p-0"
                render={<Link href={item.href} className="block w-full rounded-md p-2" />}
              >
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description} · {item.dueDate}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <p className="p-2 text-sm text-muted-foreground">
              Nenhum vencimento próximo.
            </p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

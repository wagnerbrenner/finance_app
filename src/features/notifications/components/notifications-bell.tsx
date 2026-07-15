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
import { NOTIFICATION_SEVERITY_LABELS } from "@/shared/lib/labels";
import { formatDate } from "@/shared/lib/formatters";
import { cn } from "@/lib/utils";

function rowClass(severity: FinanceNotification["severity"]) {
  if (severity === "overdue") return "bg-red-500/15 text-red-100";
  if (severity === "due_today") return "bg-amber-500/20 text-amber-50";
  if (severity === "due_in_1_day") return "bg-orange-500/15";
  return "";
}

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<FinanceNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pending, startLoad] = useTransition();

  function load() {
    if (loaded) return;
    startLoad(() => {
      void fetchDueNotifications()
        .then((items) => {
          setNotifications(items);
          setLoaded(true);
        })
        .catch(() => {
          setNotifications([]);
          setLoaded(true);
        });
    });
  }

  useEffect(() => {
    const t = window.setTimeout(load, 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const urgent = notifications.filter(
    (n) => n.severity === "overdue" || n.severity === "due_today",
  ).length;

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
          <span
            className={cn(
              "absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full text-[10px] font-bold",
              urgent > 0 ? "animate-pulse bg-red-500 text-white" : "bg-teal-500 text-black",
            )}
          >
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuLabel>Vencimentos (2 dias / amanhã / hoje)</DropdownMenuLabel>
        <div className="max-h-80 space-y-1 overflow-auto">
          {pending && !loaded ? (
            <p className="p-2 text-sm text-muted-foreground">Carregando…</p>
          ) : notifications.length ? (
            notifications.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className={cn("cursor-pointer p-0", rowClass(item.severity))}
                render={<Link href={item.href} className="block w-full rounded-md p-2" />}
              >
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs opacity-80">
                    {NOTIFICATION_SEVERITY_LABELS[item.severity]} · {item.description} ·{" "}
                    {formatDate(item.dueDate)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <p className="p-2 text-sm text-muted-foreground">Nenhum aviso.</p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

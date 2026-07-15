import Link from "next/link";
import { AlertTriangle, BellRing } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FinanceNotification } from "@/server/services/notifications.service";
import { NOTIFICATION_SEVERITY_LABELS } from "@/shared/lib/labels";
import { formatDate } from "@/shared/lib/formatters";
import { cn } from "@/lib/utils";

function severityStyles(severity: FinanceNotification["severity"]) {
  switch (severity) {
    case "overdue":
      return {
        banner: "border-red-500/80 bg-red-600 text-white shadow-[0_0_40px_-8px_rgba(220,38,38,0.8)]",
        row: "border-red-400/50 bg-red-950/40 hover:bg-red-950/70",
        badge: "destructive" as const,
      };
    case "due_today":
      return {
        banner: "border-amber-400/90 bg-amber-500 text-black shadow-[0_0_40px_-8px_rgba(245,158,11,0.85)]",
        row: "border-amber-400/40 bg-amber-950/30 hover:bg-amber-950/50",
        badge: "default" as const,
      };
    case "due_in_1_day":
      return {
        banner: "border-orange-400/70 bg-orange-500/90 text-black",
        row: "border-orange-400/30 bg-orange-950/25 hover:bg-orange-950/45",
        badge: "secondary" as const,
      };
    default:
      return {
        banner: "border-yellow-500/50 bg-yellow-500/20 text-yellow-50",
        row: "border-yellow-500/25 bg-yellow-950/20 hover:bg-yellow-950/40",
        badge: "outline" as const,
      };
  }
}

export function DueAlertsBanner({ notifications }: { notifications: FinanceNotification[] }) {
  if (notifications.length === 0) return null;

  const critical = notifications.filter(
    (n) => n.severity === "overdue" || n.severity === "due_today",
  );
  const topSeverity = critical.some((n) => n.severity === "overdue")
    ? "overdue"
    : critical.length
      ? "due_today"
      : notifications[0]!.severity;
  const styles = severityStyles(topSeverity);

  return (
    <section
      className={cn(
        "rounded-xl border-2 p-4 sm:p-5",
        styles.banner,
        (topSeverity === "overdue" || topSeverity === "due_today") && "animate-pulse",
      )}
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        {topSeverity === "overdue" || topSeverity === "due_today" ? (
          <AlertTriangle className="mt-0.5 size-7 shrink-0" aria-hidden />
        ) : (
          <BellRing className="mt-0.5 size-7 shrink-0" aria-hidden />
        )}
        <div className="min-w-0 flex-1 space-y-3">
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">
            {topSeverity === "overdue"
              ? "Vencimentos atrasados"
              : topSeverity === "due_today"
                ? "Vencimentos hoje"
                : "Vencimentos próximos"}
          </h2>
          <ul className="space-y-2">
            {notifications.map((item) => {
              const itemStyles = severityStyles(item.severity);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                      itemStyles.row,
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{item.title}</p>
                      <p className="truncate text-sm opacity-90">
                        {item.description} · {formatDate(item.dueDate)}
                      </p>
                    </div>
                    <Badge variant={itemStyles.badge} className="shrink-0">
                      {NOTIFICATION_SEVERITY_LABELS[item.severity]}
                    </Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

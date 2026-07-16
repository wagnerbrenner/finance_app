import { Resend } from "resend";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/server/db";
import { emailReminderLog, profiles } from "@/server/db/schema";
import {
  getDueNotifications,
  type FinanceNotification,
} from "@/server/services/notifications.service";
import { getEntitlements, hasProAccess } from "@/server/services/entitlements.service";
import { getSiteUrl } from "@/shared/lib/site-url";
import { BRAND } from "@/shared/lib/brand";
import { NOTIFICATION_SEVERITY_LABELS } from "@/shared/lib/labels";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress() {
  return process.env.EMAIL_FROM ?? BRAND.emailFromFallback;
}

export function brandEmailShell(title: string, bodyHtml: string) {
  const site = getSiteUrl();
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#09090b;color:#fafafa;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:24px 28px;background:linear-gradient(135deg,#0f766e,#134e4a);">
          <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:-0.02em;">${BRAND.name}</p>
          <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">${BRAND.tagline}</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">${title}</h1>
          ${bodyHtml}
          <p style="margin:28px 0 0;font-size:12px;color:#a1a1aa;">
            Este e-mail foi enviado por ${BRAND.name} ·
            <a href="${site}" style="color:#2dd4bf;text-decoration:none;">${site.replace(/^https?:\/\//, "")}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function dueItemsHtml(items: FinanceNotification[]) {
  const rows = items
    .map((item) => {
      const label = NOTIFICATION_SEVERITY_LABELS[item.severity] ?? item.severity;
      const color =
        item.severity === "overdue"
          ? "#ef4444"
          : item.severity === "due_today"
            ? "#f59e0b"
            : "#fb923c";
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #27272a;">
          <strong style="display:block;font-size:15px;">${escapeHtml(item.title)}</strong>
          <span style="font-size:13px;color:#a1a1aa;">${escapeHtml(item.description)} · ${item.dueDate}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #27272a;text-align:right;white-space:nowrap;">
          <span style="display:inline-block;padding:4px 8px;border-radius:999px;background:${color}22;color:${color};font-size:12px;font-weight:700;">${label}</span>
        </td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendDueReminderEmailsForAllUsers() {
  const resend = getResend();
  if (!resend) {
    return { ok: false as const, error: "RESEND_API_KEY não configurada", sent: 0 };
  }

  const site = getSiteUrl();
  const allProfiles = await db
    .select({ id: profiles.id, email: profiles.email, fullName: profiles.fullName })
    .from(profiles)
    .where(isNull(profiles.deletedAt));

  let sent = 0;
  for (const profile of allProfiles) {
    if (!profile.email) continue;
    const ent = await getEntitlements(profile.id);
    if (!hasProAccess(ent)) continue;
    const notifications = await getDueNotifications(profile.id);
    if (notifications.length === 0) continue;

    const toSend: FinanceNotification[] = [];
    for (const item of notifications) {
      const already = await db
        .select({ id: emailReminderLog.id })
        .from(emailReminderLog)
        .where(
          and(
            eq(emailReminderLog.userId, profile.id),
            eq(emailReminderLog.notificationKey, item.id),
            eq(emailReminderLog.severity, item.severity),
            eq(emailReminderLog.dueDate, item.dueDate),
          ),
        )
        .limit(1);
      if (already[0]) continue;
      toSend.push(item);
    }

    if (toSend.length === 0) continue;

    const hasCritical = toSend.some((n) => n.severity === "overdue" || n.severity === "due_today");
    const title = hasCritical
      ? `Atenção: vencimentos urgentes no ${BRAND.name}`
      : `Lembrete de vencimentos — ${BRAND.name}`;

    const html = brandEmailShell(
      title,
      `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#d4d4d8;">
        Olá${profile.fullName ? `, ${escapeHtml(profile.fullName)}` : ""} — estes compromissos precisam da sua atenção:
      </p>
      ${dueItemsHtml(toSend)}
      <p style="margin:24px 0 0;">
        <a href="${site}/dashboard" style="display:inline-block;background:#14b8a6;color:#042f2e;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:10px;">
          Abrir painel
        </a>
      </p>`,
    );

    const { error } = await resend.emails.send({
      from: fromAddress(),
      to: profile.email,
      subject: title,
      html,
    });

    if (error) {
      console.error("due reminder email failed", profile.id, error);
      continue;
    }

    await db.insert(emailReminderLog).values(
      toSend.map((item) => ({
        userId: profile.id,
        notificationKey: item.id,
        severity: item.severity,
        dueDate: item.dueDate,
      })),
    );
    sent += 1;
  }

  return { ok: true as const, sent };
}

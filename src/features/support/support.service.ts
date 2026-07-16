import { z } from "zod";
import { db } from "@/server/db";
import { supportMessages } from "@/server/db/schema";
import { matchSupportIntent } from "@/features/support/knowledge";
import { brandEmailShell } from "@/server/services/email.service";
import { Resend } from "resend";
import { BRAND } from "@/shared/lib/brand";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  name: z.string().max(120).optional(),
  userId: z.string().uuid().optional(),
});

const rateBucket = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const row = rateBucket.get(ip);
  if (!row || now > row.resetAt) {
    rateBucket.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (row.count >= limit) return false;
  row.count += 1;
  return true;
}

async function notifyInbox(opts: {
  message: string;
  email?: string;
  name?: string;
  ticketId: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const inbox = process.env.SUPPORT_INBOX_EMAIL;
  if (!key || !inbox) {
    console.warn("support escalate: RESEND_API_KEY or SUPPORT_INBOX_EMAIL missing");
    return;
  }
  const resend = new Resend(key);
  const from = process.env.EMAIL_FROM ?? BRAND.emailFromFallback;
  const html = brandEmailShell(
    "Nova mensagem no SAC",
    `<p style="margin:0 0 12px;font-size:15px;color:#d4d4d8;">
      Ticket <code>${opts.ticketId}</code>
    </p>
    <p style="margin:0 0 8px;font-size:14px;"><strong>De:</strong> ${opts.name || "—"} &lt;${opts.email || "sem e-mail"}&gt;</p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.5;white-space:pre-wrap;">${opts.message
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")}</p>`,
  );
  await resend.emails.send({
    from,
    to: inbox,
    subject: `[SAC] ${BRAND.name} — nova dúvida`,
    html,
  });
}

export async function handleSupportChat(
  raw: unknown,
  ip: string,
): Promise<{ reply: string; escalated: boolean; intentId: string | null }> {
  if (!rateLimit(ip)) {
    return {
      reply: "Muitas mensagens em pouco tempo. Espera um minuto e tenta de novo.",
      escalated: false,
      intentId: null,
    };
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      reply: "Não entendi a mensagem. Tenta de novo com um texto curto.",
      escalated: false,
      intentId: null,
    };
  }

  const { message, email, name, userId } = parsed.data;
  const match = matchSupportIntent(message);

  if (match.escalated) {
    const [row] = await db
      .insert(supportMessages)
      .values({
        userId: userId ?? null,
        email: email ? email : null,
        name: name ?? null,
        message,
        matchedIntent: null,
        status: "open",
      })
      .returning({ id: supportMessages.id });

    try {
      await notifyInbox({
        message,
        email: email || undefined,
        name: name || undefined,
        ticketId: row.id,
      });
    } catch (err) {
      console.error("support notify failed", err);
    }
  }

  return {
    reply: match.reply,
    escalated: match.escalated,
    intentId: match.intentId,
  };
}

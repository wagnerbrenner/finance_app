import { z } from "zod";
import { db } from "@/server/db";
import { supportMessages } from "@/server/db/schema";
import { matchSupportIntent } from "@/features/support/knowledge";
import { brandEmailShell } from "@/server/services/email.service";
import { Resend } from "resend";
import { BRAND } from "@/shared/lib/brand";

export const SUPPORT_INBOX_FALLBACK = "wagner.brenner13@gmail.com";

function supportInbox() {
  return process.env.SUPPORT_INBOX_EMAIL?.trim() || SUPPORT_INBOX_FALLBACK;
}

const chatBodySchema = z.object({
  message: z.string().min(1).max(2000),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  name: z.string().max(120).optional(),
  userId: z.string().uuid().optional(),
});

const feedbackBodySchema = z.object({
  message: z.string().min(8).max(4000),
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

function escapeHtml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

async function notifyInbox(opts: {
  subject: string;
  title: string;
  message: string;
  email?: string;
  name?: string;
  ticketId: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const inbox = supportInbox();
  if (!key) {
    console.warn("support notify: RESEND_API_KEY missing");
    return;
  }
  const resend = new Resend(key);
  const from = process.env.EMAIL_FROM ?? BRAND.emailFromFallback;
  const html = brandEmailShell(
    opts.title,
    `<p style="margin:0 0 12px;font-size:15px;color:#d4d4d8;">
      Ticket <code>${opts.ticketId}</code>
    </p>
    <p style="margin:0 0 8px;font-size:14px;"><strong>De:</strong> ${escapeHtml(opts.name || "—")} &lt;${escapeHtml(opts.email || "sem e-mail")}&gt;</p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(opts.message)}</p>`,
  );
  await resend.emails.send({
    from,
    to: inbox,
    subject: opts.subject,
    html,
  });
}

export async function handleSupportChat(
  raw: unknown,
  ip: string,
): Promise<{
  reply: string;
  escalated: boolean;
  intentId: string | null;
  openFeedback?: boolean;
}> {
  if (!rateLimit(ip)) {
    return {
      reply: "Muitas mensagens em pouco tempo. Espera um minuto e tenta de novo.",
      escalated: false,
      intentId: null,
    };
  }

  const parsed = chatBodySchema.safeParse(raw);
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
        subject: `[SAC] ${BRAND.name} — nova dúvida`,
        title: "Nova mensagem no SAC",
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
    openFeedback: match.openFeedback,
  };
}

export async function handleSupportFeedback(
  raw: unknown,
  ip: string,
): Promise<{ ok: boolean; reply: string; error?: string }> {
  if (!rateLimit(ip, 8, 60_000)) {
    return {
      ok: false,
      reply: "Muitas sugestões em pouco tempo. Espera um minuto.",
      error: "rate_limit",
    };
  }

  const parsed = feedbackBodySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      reply: "Escreve a sugestão com pelo menos algumas palavras (mín. 8 caracteres).",
      error: "invalid",
    };
  }

  const { message, email, name, userId } = parsed.data;

  const [row] = await db
    .insert(supportMessages)
    .values({
      userId: userId ?? null,
      email: email ? email : null,
      name: name ?? null,
      message,
      matchedIntent: "feedback",
      status: "feedback",
    })
    .returning({ id: supportMessages.id });

  try {
    await notifyInbox({
      subject: `[Melhoria] ${BRAND.name}`,
      title: "Sugestão de melhoria",
      message,
      email: email || undefined,
      name: name || undefined,
      ticketId: row.id,
    });
  } catch (err) {
    console.error("feedback notify failed", err);
  }

  return {
    ok: true,
    reply: "Sugestão enviada — obrigado! O time recebe no e-mail e lê com carinho.",
  };
}

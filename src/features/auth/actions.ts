"use server";

import { cache } from "react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/shared/lib/supabase/server";
import { createAdminClient, hasServiceRole } from "@/shared/lib/supabase/admin";
import { getProfileForUser } from "@/server/services/profiles.service";
import { getSiteUrl } from "@/shared/lib/site-url";
import {
  hasResendConfigured,
  sendSignupConfirmationEmail,
} from "@/server/services/email.service";

const credentialsSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const signUpSchema = credentialsSchema.extend({
  fullName: z.string().min(2, "Informe seu nome").optional(),
});

export type AuthActionState = {
  error?: string;
  success?: boolean;
  message?: string;
  needsConfirmation?: boolean;
  email?: string;
};

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("email rate")) {
    return "Limite de e-mails atingido. Aguarde alguns minutos e tente reenviar a confirmação.";
  }
  if (lower.includes("already registered") || lower.includes("user already")) {
    return "Este e-mail já está cadastrado. Faça login.";
  }
  if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
    return "Confirme seu e-mail antes de entrar. Use o botão para reenviar o link.";
  }
  return message;
}

/** Gera link de confirmação e envia pelo Resend (não depende do SMTP do Supabase). */
async function deliverConfirmationEmail(email: string, password?: string) {
  if (!hasResendConfigured() || !hasServiceRole()) {
    return {
      ok: false as const,
      error:
        "E-mail de confirmação ainda não está configurado (RESEND_API_KEY / SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  const origin = getSiteUrl();
  const admin = createAdminClient();

  const generated = password
    ? await admin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
        options: { redirectTo: `${origin}/auth/callback` },
      })
    : await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo: `${origin}/auth/callback` },
      });

  if (generated.error) {
    return { ok: false as const, error: mapAuthError(generated.error.message) };
  }

  const link = generated.data.properties?.action_link;
  if (!link) {
    return { ok: false as const, error: "Não foi possível gerar o link de confirmação." };
  }

  const sent = await sendSignupConfirmationEmail(email, link);
  if (!sent.ok) {
    const msg = sent.error ?? "Falha ao enviar e-mail pelo Resend.";
    const lower = msg.toLowerCase();
    return {
      ok: false as const,
      error:
        lower.includes("domain") || lower.includes("only send") || lower.includes("not allowed")
          ? "Resend só envia para o e-mail da sua conta enquanto usar onboarding@resend.dev. Verifique um domínio ou teste com o e-mail da conta Resend."
          : msg,
    };
  }

  return { ok: true as const };
}

export async function signInWithPassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const lower = error.message.toLowerCase();
    if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
      return {
        error: "Confirme seu e-mail antes de entrar.",
        needsConfirmation: true,
        email: parsed.data.email,
      };
    }
    return { error: "E-mail ou senha incorretos." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const origin = getSiteUrl();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  if (!data.session) {
    const delivered = await deliverConfirmationEmail(
      parsed.data.email,
      parsed.data.password,
    );
    if (!delivered.ok) {
      return {
        success: true,
        needsConfirmation: true,
        email: parsed.data.email,
        message: `Conta criada, mas o e-mail falhou: ${delivered.error}`,
      };
    }
    return {
      success: true,
      needsConfirmation: true,
      email: parsed.data.email,
      message:
        "Conta criada. Enviamos um e-mail de confirmação. Abra o link e depois faça login.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function resendConfirmationEmail(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = z.email("E-mail inválido").safeParse(email);
  if (!parsed.success) {
    return { error: "Informe um e-mail válido para reenviar a confirmação." };
  }

  if (hasResendConfigured() && hasServiceRole()) {
    const delivered = await deliverConfirmationEmail(parsed.data);
    if (!delivered.ok) {
      return { error: delivered.error, email: parsed.data, needsConfirmation: true };
    }
    return {
      success: true,
      needsConfirmation: true,
      email: parsed.data,
      message: "E-mail de confirmação reenviado. Verifique sua caixa de entrada.",
    };
  }

  const supabase = await createClient();
  const origin = getSiteUrl();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: mapAuthError(error.message), email: parsed.data, needsConfirmation: true };
  }

  return {
    success: true,
    needsConfirmation: true,
    email: parsed.data,
    message: "E-mail de confirmação reenviado. Verifique sua caixa de entrada.",
  };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  try {
    const profile = await getProfileForUser(user.id);
    if (profile) {
      return profile;
    }
  } catch {
    // DATABASE_URL may be missing in local UI-only runs — fall back to auth metadata
  }

  return {
    id: user.id,
    email: user.email ?? "",
    fullName:
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null,
    avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    locale: "pt-BR",
    currency: "BRL",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
});

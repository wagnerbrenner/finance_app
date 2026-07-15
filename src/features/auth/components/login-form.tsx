"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  resendConfirmationEmail,
  signInWithPassword,
  type AuthActionState,
} from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Entrando…" : "Entrar"}
    </Button>
  );
}

function ResendButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" className="w-full" disabled={pending}>
      {pending ? "Reenviando…" : "Reenviar e-mail de confirmação"}
    </Button>
  );
}

const initialState: AuthActionState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error") === "auth";
  const [state, formAction] = useActionState(signInWithPassword, initialState);
  const [resendState, resendAction] = useActionState(resendConfirmationEmail, initialState);

  const needsConfirmation = Boolean(state.needsConfirmation || resendState.needsConfirmation || authError);
  const knownEmail = state.email || resendState.email || "";

  return (
    <div className="flex w-full flex-col gap-6">
      {authError ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Não foi possível confirmar o e-mail. Peça um novo link abaixo ou tente entrar de novo.
        </p>
      ) : null}
      <form action={formAction} className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            defaultValue={knownEmail}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
        {resendState.success && resendState.message ? (
          <p className="text-sm text-teal-400" role="status">
            {resendState.message}
          </p>
        ) : null}
        {resendState.error ? (
          <p className="text-sm text-destructive" role="alert">
            {resendState.error}
          </p>
        ) : null}
        <SubmitButton />
      </form>
      {needsConfirmation ? (
        <form action={resendAction} className="space-y-2">
          {knownEmail ? (
            <input type="hidden" name="email" value={knownEmail} />
          ) : (
            <Input name="email" type="email" placeholder="E-mail para reenvio" required />
          )}
          <ResendButton />
        </form>
      ) : null}
      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/signup" className="text-teal-400 hover:text-teal-300">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

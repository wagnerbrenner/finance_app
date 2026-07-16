"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import {
  resendConfirmationEmail,
  signUp,
  type AuthActionState,
} from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400" disabled={pending}>
      {pending ? "Criando…" : "Criar conta"}
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

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [state, formAction] = useActionState(signUp, initialState);
  const [resendState, resendAction] = useActionState(resendConfirmationEmail, initialState);

  const confirmedEmail = state.email || resendState.email || email;

  return (
    <div className="flex w-full flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>
        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
        {(state.success && state.message) || (resendState.success && resendState.message) ? (
          <p className="text-sm text-teal-400" role="status">
            {resendState.message || state.message}{" "}
            <Link href="/login" className="underline hover:text-teal-300">
              Ir para login
            </Link>
          </p>
        ) : null}
        {resendState.error ? (
          <p className="text-sm text-destructive" role="alert">
            {resendState.error}
          </p>
        ) : null}
        <SubmitButton />
      </form>
      {state.needsConfirmation || resendState.needsConfirmation ? (
        <form action={resendAction}>
          <input type="hidden" name="email" value={confirmedEmail} />
          <ResendButton />
        </form>
      ) : null}
      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300">
          Entrar
        </Link>
      </p>
    </div>
  );
}

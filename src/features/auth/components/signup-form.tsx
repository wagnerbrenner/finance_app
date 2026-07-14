"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { signUp, type AuthActionState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Criando…" : "Criar conta"}
    </Button>
  );
}

const initialState: AuthActionState = {};

export function SignupForm() {
  const [state, formAction] = useActionState(signUp, initialState);

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
        {state.success && state.message ? (
          <p className="text-sm text-teal-400" role="status">
            {state.message}{" "}
            <Link href="/login" className="underline hover:text-teal-300">
              Ir para login
            </Link>
          </p>
        ) : null}
        <SubmitButton />
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="text-teal-400 hover:text-teal-300">
          Entrar
        </Link>
      </p>
    </div>
  );
}

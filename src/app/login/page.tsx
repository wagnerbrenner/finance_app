import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Entrar · Finance OS",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(20,184,166,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(39,39,42,0.8),_transparent_50%)]"
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight"
          >
            <img
              src="/logo.svg"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-md"
            />
            Finance OS
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu CFO pessoal. Entre para continuar.
          </p>
        </div>
        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>Entre com e-mail e senha.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

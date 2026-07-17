"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { MessageCircle, X, Send, Lightbulb } from "lucide-react";
import { SUPPORT_SHORTCUTS } from "@/features/support/knowledge";
import { BRAND } from "@/shared/lib/brand";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ChatMsg = { role: "user" | "assistant"; text: string };

type SupportWidgetProps = {
  userEmail?: string | null;
  userId?: string | null;
  userName?: string | null;
};

export function SupportWidget({ userEmail, userId, userName }: SupportWidgetProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: `E aí! Sou o assistente do ${BRAND.name}. Pergunte sobre lançar gasto, painel, recorrentes, metas ou assinatura — ou sugira uma melhoria.`,
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, showFeedback]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setBusy(true);
    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          email: userEmail || undefined,
          name: userName || undefined,
          userId: userId || undefined,
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        openFeedback?: boolean;
      };
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply ?? "Algo deu errado. Tenta de novo." },
      ]);
      if (data.openFeedback) setShowFeedback(true);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Falha de rede. Verifica a conexão e tenta outra vez." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function submitFeedback() {
    const trimmed = feedbackText.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/support/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          email: userEmail || undefined,
          name: userName || undefined,
        }),
      });
      const data = (await res.json()) as { reply?: string; ok?: boolean };
      setMessages((m) => [
        ...m,
        { role: "user", text: `[Sugestão] ${trimmed}` },
        {
          role: "assistant",
          text: data.reply ?? (data.ok ? "Enviado!" : "Não deu pra enviar. Tenta de novo."),
        },
      ]);
      if (data.ok) {
        setFeedbackText("");
        setShowFeedback(false);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Falha de rede ao enviar a sugestão." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[60] flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {open ? (
        <div className="pointer-events-auto flex h-[min(560px,75svh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-cyan-500/25 bg-[#0B1220] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
          <header className="flex items-center gap-3 border-b border-white/10 bg-[#070B14] px-3 py-2.5">
            <Image
              src="/brand/nerd-mascot.webp"
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-full object-cover object-top"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">Ajuda · {BRAND.name}</p>
              <p className="truncate text-xs text-slate-400">Funcionalidades e melhorias</p>
            </div>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="text-slate-300"
              onClick={() => setOpen(false)}
              aria-label="Fechar chat"
            >
              <X className="size-4" />
            </Button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((msg, i) => (
              <div
                key={`${i}-${msg.role}`}
                className={cn(
                  "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-snug",
                  msg.role === "user"
                    ? "ml-auto bg-cyan-500 text-slate-950"
                    : "mr-auto bg-white/5 text-slate-100",
                )}
              >
                {msg.text}
              </div>
            ))}

            {showFeedback ? (
              <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 p-3">
                <div className="mb-2 flex items-center gap-2 text-amber-300">
                  <Lightbulb className="size-4 shrink-0" />
                  <p className="text-sm font-semibold">Sugestão de melhoria</p>
                </div>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  placeholder="Descreve a ideia: o que falta, em qual tela, por que ajuda…"
                  className="w-full resize-none rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-sm text-white placeholder:text-slate-500"
                  disabled={busy}
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-amber-500 text-slate-950 hover:bg-amber-400"
                    disabled={busy || feedbackText.trim().length < 8}
                    onClick={() => void submitFeedback()}
                  >
                    Enviar sugestão
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-slate-300"
                    disabled={busy}
                    onClick={() => setShowFeedback(false)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <div className="space-y-2 border-t border-white/10 px-3 py-2.5">
            <div className="flex flex-wrap gap-1.5">
              {SUPPORT_SHORTCUTS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (s.kind === "feedback") {
                      setShowFeedback(true);
                      setMessages((m) => [
                        ...m,
                        {
                          role: "assistant",
                          text: "Beleza — descreve tua ideia no card de sugestão e envia.",
                        },
                      ]);
                      return;
                    }
                    void send(s.message);
                  }}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] disabled:opacity-50",
                    s.kind === "feedback"
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25"
                      : "border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Dúvida sobre o app…"
                disabled={busy}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-sm text-white placeholder:text-slate-500"
              />
              <Button
                type="submit"
                size="icon"
                disabled={busy || !input.trim()}
                className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                aria-label="Enviar"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto group relative flex size-14 items-center justify-center overflow-hidden rounded-full border border-cyan-400/40 bg-[#0B1220] shadow-[0_0_28px_rgba(34,211,238,0.35)] transition hover:scale-105"
        aria-label={open ? "Fechar ajuda" : "Abrir ajuda"}
      >
        {open ? (
          <MessageCircle className="size-6 text-cyan-300" />
        ) : (
          <Image
            src="/brand/nerd-mascot.webp"
            alt=""
            width={56}
            height={56}
            className="size-14 object-cover object-top"
            priority
          />
        )}
      </button>
    </div>
  );
}

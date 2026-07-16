"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { MessageCircle, X, Send } from "lucide-react";
import { SUPPORT_SHORTCUTS } from "@/features/support/knowledge";
import { BRAND } from "@/shared/lib/brand";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ChatMsg = { role: "user" | "assistant"; text: string };

type SupportWidgetProps = {
  userEmail?: string | null;
};

export function SupportWidget({ userEmail }: SupportWidgetProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [email, setEmail] = useState(userEmail ?? "");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: `E aí! Sou o assistente do ${BRAND.name}. Pergunte sobre lançar gasto, painel, recorrentes ou planos — se eu não souber, aviso o time.`,
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userEmail) setEmail(userEmail);
  }, [userEmail]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

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
          email: email.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { reply?: string };
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply ?? "Algo deu errado. Tenta de novo." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Falha de rede. Verifica a conexão e tenta outra vez." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[60] flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {open ? (
        <div className="pointer-events-auto flex h-[min(520px,70svh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-cyan-500/25 bg-[#0B1220] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
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
              <p className="truncate text-xs text-slate-400">Dúvidas, dicas e melhorias</p>
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
            <div ref={bottomRef} />
          </div>

          <div className="space-y-2 border-t border-white/10 px-3 py-2.5">
            <div className="flex flex-wrap gap-1.5">
              {SUPPORT_SHORTCUTS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  disabled={busy}
                  onClick={() => void send(s.message)}
                  className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50"
                >
                  {s.label}
                </button>
              ))}
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail (se precisar de resposta)"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500"
            />
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
                placeholder="Escreve tua dúvida…"
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

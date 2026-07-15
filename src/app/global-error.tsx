"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-4 text-center text-zinc-100">
        <h2 className="text-xl font-semibold">Erro inesperado</h2>
        <p className="max-w-md text-sm text-zinc-400">
          O aplicativo encontrou um problema. Recarregue a página para continuar.
        </p>
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-black hover:bg-teal-400"
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}

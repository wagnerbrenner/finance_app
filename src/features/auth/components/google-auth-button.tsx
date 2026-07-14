"use client";

import { useTransition } from "react";
import { signInWithGoogle } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

type GoogleAuthButtonProps = {
  label?: string;
};

export function GoogleAuthButton({
  label = "Continuar com Google",
}: GoogleAuthButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2"
      disabled={pending}
      onClick={() => startTransition(() => signInWithGoogle())}
    >
      <GoogleIcon />
      {pending ? "Redirecionando…" : label}
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M6.6 14.3l-.9.7-2.5 1.9C4.9 19.7 8.2 22 12 22c2.7 0 4.9-.9 6.5-2.4l-3.1-2.4c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1z"
      />
      <path
        fill="#4A90E2"
        d="M3.2 7.1C2.4 8.6 2 10.2 2 12s.4 3.4 1.2 4.9l3.4-2.6C6.2 13.3 6 12.7 6 12s.2-1.3.6-1.9L3.2 7.1z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.7 14.7 2 12 2 8.2 2 4.9 4.3 3.2 7.1l3.4 2.6C7.2 7.5 9.4 5.8 12 5.8z"
      />
    </svg>
  );
}

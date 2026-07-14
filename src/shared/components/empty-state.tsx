import { Wallet } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 px-6 py-20 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-teal-500/10 text-teal-400">
        <Wallet className="size-5" />
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

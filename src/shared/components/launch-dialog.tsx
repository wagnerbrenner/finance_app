"use client";

import type { ReactElement, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function LaunchDialog({
  title,
  description,
  children,
  trigger,
  open,
  onOpenChange,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  trigger?: ReactElement | string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}) {
  const triggerElement =
    typeof trigger === "string" ? (
      <Button type="button" className="w-full sm:w-auto">
        {trigger}
      </Button>
    ) : (
      trigger
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerElement ? <DialogTrigger render={triggerElement} /> : null}
      <DialogContent
        className={cn(
          // Mobile: bottom sheet full-width, keyboard-friendly
          "fixed inset-x-0 bottom-0 top-auto left-0 max-h-[min(92dvh,100%)] w-full max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-2xl p-0 sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl",
          className,
        )}
      >
        <div className="flex max-h-[min(92dvh,100%)] flex-col">
          <DialogHeader className="shrink-0 border-b border-border/60 px-4 pb-3 pt-4 pr-12 text-left">
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

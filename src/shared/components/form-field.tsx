"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function FormField({
  name,
  label,
  className,
  ...props
}: { name: string; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("grid gap-1.5", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} className="h-11 sm:h-9" {...props} />
    </label>
  );
}

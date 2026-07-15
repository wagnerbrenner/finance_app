"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { DateField } from "@/shared/components/date-field";

export function FormField({
  name,
  label,
  className,
  type,
  defaultValue,
  required,
  disabled,
  id,
  ...props
}: { name: string; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  if (type === "date") {
    return (
      <DateField
        name={name}
        label={label}
        className={className}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        id={id}
      />
    );
  }

  return (
    <label className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id ?? name}>{label}</Label>
      <Input
        id={id ?? name}
        name={name}
        type={type}
        className="h-11 sm:h-9"
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        {...props}
      />
    </label>
  );
}

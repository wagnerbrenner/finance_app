"use client";

import { useId, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

const EMPTY = "__none__";

export function FormSelect({
  name,
  label,
  options,
  defaultValue,
  value: valueProp,
  required,
  placeholder = "Selecione uma opção",
  onChange,
  className,
  disabled,
}: {
  name: string;
  label: string;
  options: Option[];
  defaultValue?: string;
  value?: string;
  required?: boolean;
  placeholder?: string;
  onChange?: (e: { target: { value: string; name: string } }) => void;
  className?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const controlled = valueProp !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const value = controlled ? (valueProp ?? "") : internal;
  const selectValue = value || null;

  function handleChange(next: string | null) {
    const v = !next || next === EMPTY ? "" : next;
    if (!controlled) setInternal(v);
    onChange?.({ target: { value: v, name } });
  }

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <input
        type="hidden"
        name={name}
        value={value}
        required={Boolean(required) && !value}
      />
      <Select
        value={selectValue}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          className="h-11 w-full min-w-0 border-input bg-input/30 text-foreground sm:h-9 dark:bg-input/30"
          size="default"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className="z-[200] max-h-[min(50dvh,320px)] border border-border bg-popover text-popover-foreground shadow-lg"
          alignItemWithTrigger={false}
          side="bottom"
          align="start"
        >
          {!required ? (
            <SelectItem value={EMPTY} className="text-muted-foreground">
              {placeholder}
            </SelectItem>
          ) : null}
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

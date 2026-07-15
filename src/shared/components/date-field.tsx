"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { brDateToIso, isoToBrDate, localDateISO } from "@/shared/lib/formatters";

function normalizeIncoming(value: string | number | readonly string[] | undefined): string {
  if (value == null || value === "") return localDateISO();
  const raw = String(Array.isArray(value) ? value[0] : value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return brDateToIso(raw) ?? localDateISO();
}

type DateFieldProps = {
  name: string;
  label: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string | number | readonly string[];
  id?: string;
};

/** Data em dd/mm/aaaa + calendário nativo. Envia yyyy-MM-dd. */
export function DateField({
  name,
  label,
  className,
  required,
  disabled,
  defaultValue,
  id: idProp,
}: DateFieldProps) {
  const id = idProp ?? name;
  const initialIso = normalizeIncoming(defaultValue);
  const [iso, setIso] = useState(initialIso);
  const [display, setDisplay] = useState(isoToBrDate(initialIso));

  function applyIso(next: string) {
    setIso(next);
    setDisplay(isoToBrDate(next));
  }

  function onDisplayChange(raw: string) {
    const digits = raw.replace(/[^\d]/g, "").slice(0, 8);
    let next = digits;
    if (digits.length > 4) {
      next = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      next = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setDisplay(next);
    const parsed = brDateToIso(next);
    if (parsed) setIso(parsed);
  }

  function onDisplayBlur() {
    const parsed = brDateToIso(display);
    if (parsed) applyIso(parsed);
    else setDisplay(isoToBrDate(iso));
  }

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-1.5">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder="dd/mm/aaaa"
          autoComplete="off"
          disabled={disabled}
          required={required}
          value={display}
          onChange={(e) => onDisplayChange(e.target.value)}
          onBlur={onDisplayBlur}
          className="h-11 flex-1 sm:h-9"
        />
        <div className="relative h-11 w-11 shrink-0 sm:h-9 sm:w-9">
          <span
            className="pointer-events-none absolute inset-0 inline-flex items-center justify-center rounded-lg border border-input bg-transparent text-muted-foreground"
            aria-hidden
          >
            <CalendarDays className="size-4" />
          </span>
          <input
            type="date"
            lang="pt-BR"
            disabled={disabled}
            value={iso}
            onChange={(e) => {
              if (e.target.value) applyIso(e.target.value);
            }}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            aria-label="Abrir calendário"
            title="Abrir calendário"
          />
        </div>
        <input type="hidden" name={name} value={iso} />
      </div>
    </div>
  );
}

import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number): string {
  return brl.format(value);
}

/** Data local em yyyy-MM-dd (evita virar o dia com toISOString UTC). */
export function localDateISO(value: Date = new Date()): string {
  return format(value, "yyyy-MM-dd");
}

/** yyyy-MM-dd → dd/mm/aaaa */
export function isoToBrDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** dd/mm/aaaa ou dd-mm-aaaa → yyyy-MM-dd */
export function brDateToIso(value: string): string | null {
  const m = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(value.trim());
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const dt = new Date(year, month - 1, day);
  if (dt.getFullYear() !== year || dt.getMonth() !== month - 1 || dt.getDate() !== day) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Aceita yyyy-MM-dd ou dd/mm/aaaa. */
export function parseDateInput(raw: string, fallback = localDateISO()): string {
  const value = raw.trim();
  if (!value) return fallback;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return brDateToIso(value) ?? fallback;
}

function toLocalDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return parseISO(`${value}T12:00:00`);
  }
  const fromBr = brDateToIso(value);
  if (fromBr) return parseISO(`${fromBr}T12:00:00`);
  return parseISO(value);
}

export function formatDate(value: Date | string, pattern = "dd/MM/yyyy"): string {
  return format(toLocalDate(value), pattern, { locale: ptBR });
}

export function formatRelative(value: Date | string): string {
  return formatDistanceToNow(toLocalDate(value), { addSuffix: true, locale: ptBR });
}

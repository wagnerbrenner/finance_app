"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { importTransactionsCsv } from "@/features/finance/actions";
import { actionToast } from "@/shared/components/action-toast";
import { FormSelect } from "@/shared/components/form-select";
import { parseBankCsv, type ParsedCsvRow } from "@/shared/lib/csv-import";
import { formatBRL, formatDate } from "@/shared/lib/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CsvImportForm({ accounts }: { accounts: { id: string; name: string }[] }) {
  const [rows, setRows] = useState<ParsedCsvRow[]>([]);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const summary = useMemo(() => {
    const income = rows.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
    const expense = rows.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);
    return { income, expense, count: rows.length };
  }, [rows]);

  function onFile(file: File | null) {
    setError(null);
    setRows([]);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const parsed = parseBankCsv(text);
        if (!parsed.length) {
          setError("Não encontramos linhas válidas. Verifique o CSV/OFX (Nubank: exportar extrato).");
          return;
        }
        setRows(parsed);
      } catch {
        setError("Falha ao ler o arquivo.");
      }
    };
    reader.readAsText(file, "UTF-8");
  }

  function importRows() {
    if (!accountId || !rows.length) return;
    const data = new FormData();
    data.set("path", "/app/importar");
    data.set("accountId", accountId);
    data.set("rows", JSON.stringify(rows));
    startTransition(() => {
      void actionToast(() => importTransactionsCsv(data), `${rows.length} lançamentos importados.`).then(
        (ok) => {
          if (ok) setRows([]);
        },
      );
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Arquivo CSV ou OFX</span>
          <input
            type="file"
            accept=".csv,.ofx,.txt,text/csv"
            className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <FormSelect
          name="accountId"
          label="Conta destino"
          required
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          options={accounts.map(({ id, name }) => ({ value: id, label: name }))}
        />
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {rows.length ? (
        <>
          <p className="text-sm text-muted-foreground">
            Pré-visualização: {summary.count} linhas · receitas {formatBRL(summary.income)} · despesas{" "}
            {formatBRL(summary.expense)}
          </p>
          <div className="max-h-80 overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 50).map((row, idx) => (
                  <TableRow key={`${row.date}-${idx}`}>
                    <TableCell>{formatDate(row.date)}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>{row.type === "income" ? "Receita" : "Despesa"}</TableCell>
                    <TableCell className="text-right">{formatBRL(row.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {rows.length > 50 ? (
            <p className="text-xs text-muted-foreground">Mostrando 50 de {rows.length} linhas.</p>
          ) : null}
          <Button type="button" onClick={importRows} disabled={pending || !accountId}>
            {pending ? "Importando…" : `Importar ${rows.length} lançamentos`}
          </Button>
        </>
      ) : null}
    </div>
  );
}

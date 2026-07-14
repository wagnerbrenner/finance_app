"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createLaunch } from "@/features/finance/actions";
import { getLaunchLookups, type LaunchLookups } from "@/features/finance/lookups";
import { actionToast } from "@/shared/components/action-toast";
import { FormField } from "@/shared/components/form-field";
import { FormSelect } from "@/shared/components/form-select";
import { LaunchDialog } from "@/shared/components/launch-dialog";
import { Label } from "@/components/ui/label";
import { useUiStore } from "@/shared/stores/ui-store";

type Props = {
  /** Se true, usa o estado global do shell (FAB / topbar). */
  global?: boolean;
  accounts?: LaunchLookups["accounts"];
  categories?: LaunchLookups["categories"];
  cards?: LaunchLookups["cards"];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: string;
};

export function TransactionDialog({
  global = false,
  accounts: accountsProp,
  categories: categoriesProp,
  cards: cardsProp,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  trigger,
}: Props) {
  const launchOpen = useUiStore((s) => s.launchOpen);
  const setLaunchOpen = useUiStore((s) => s.setLaunchOpen);

  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = global ? launchOpen : (openProp ?? internalOpen);
  const setOpen = global
    ? setLaunchOpen
    : (onOpenChangeProp ?? setInternalOpen);

  const [lookups, setLookups] = useState<LaunchLookups | null>(null);
  const [loadingLookups, startLoad] = useTransition();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [incomeOrigin, setIncomeOrigin] = useState<"salary" | "freelance" | "uber">("salary");
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    startLoad(() => {
      void getLaunchLookups()
        .then(setLookups)
        .catch(() => setLookups(null));
    });
  }, [isOpen]);

  useEffect(() => {
    if (!lookups) return;
    if (incomeOrigin === "freelance" && !lookups.hasFreelance) setIncomeOrigin("salary");
    if (incomeOrigin === "uber" && !lookups.hasUber) setIncomeOrigin("salary");
  }, [lookups, incomeOrigin]);

  async function submit(data: FormData) {
    data.set("path", "/app/transacoes");
    data.set("type", type);
    if (type === "income") data.set("incomeOrigin", incomeOrigin);
    if (type === "expense") data.set("isRecurring", isRecurring ? "true" : "false");
    if (await actionToast(() => createLaunch(data), "Lançamento registrado.")) {
      setOpen(false);
      setType("expense");
      setIncomeOrigin("salary");
      setIsRecurring(false);
    }
  }

  const accounts = lookups?.accounts ?? accountsProp ?? [];
  const categories = lookups?.categories ?? categoriesProp ?? [];
  const cards = lookups?.cards ?? cardsProp ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = `${today.slice(0, 8)}01`;

  const showTrigger = !global && openProp === undefined;
  const triggerLabel = trigger ?? "Novo lançamento";

  return (
    <LaunchDialog
      title="Novo lançamento"
      description="Receita, despesa ou conta recorrente."
      open={isOpen}
      onOpenChange={setOpen}
      trigger={showTrigger ? triggerLabel : undefined}
    >
      <form action={submit} className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <FormSelect
            name="typeUi"
            label="Tipo"
            required
            value={type}
            onChange={(e) => setType(e.target.value as "income" | "expense")}
            options={[
              { value: "income", label: "Receita" },
              { value: "expense", label: "Despesa" },
            ]}
          />

          {type === "income" ? (
            <FormSelect
              name="incomeOriginUi"
              label="Origem da receita"
              required
              value={incomeOrigin}
              onChange={(e) =>
                setIncomeOrigin(e.target.value as "salary" | "freelance" | "uber")
              }
              options={[
                { value: "salary", label: "Salário" },
                ...(lookups?.hasFreelance
                  ? [{ value: "freelance", label: "Freelance" }]
                  : []),
                ...(lookups?.hasUber ? [{ value: "uber", label: "Uber" }] : []),
              ]}
            />
          ) : (
            <FormSelect
              name="status"
              label="Situação"
              defaultValue="cleared"
              required
              options={[
                { value: "cleared", label: "Confirmado" },
                { value: "pending", label: "Pendente" },
              ]}
            />
          )}

          <FormField
            name="amount"
            label={type === "income" ? "Valor da receita" : "Valor"}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
          />
          <FormField name="date" label="Data" type="date" defaultValue={today} required />

          <FormField
            name="description"
            label="Descrição"
            className="sm:col-span-2"
            required={type === "expense"}
            placeholder={
              type === "income"
                ? incomeOrigin === "salary"
                  ? "Salário"
                  : incomeOrigin === "freelance"
                    ? "Receita freelance"
                    : "Receita Uber"
                : "Ex.: Conta de luz"
            }
            defaultValue={
              type === "income"
                ? incomeOrigin === "salary"
                  ? "Salário"
                  : incomeOrigin === "freelance"
                    ? "Receita freelance"
                    : "Receita Uber"
                : undefined
            }
            key={`${type}-${incomeOrigin}`}
          />

          {type === "income" && incomeOrigin === "salary" ? (
            <>
              <FormSelect
                name="status"
                label="Situação"
                defaultValue="cleared"
                required
                options={[
                  { value: "cleared", label: "Confirmado" },
                  { value: "pending", label: "Pendente" },
                ]}
              />
              <FormSelect
                name="accountId"
                label="Conta"
                options={accounts.map(({ id, name }) => ({ value: id, label: name }))}
              />
              <FormSelect
                name="categoryId"
                label="Categoria"
                className="sm:col-span-2"
                options={categories.map(({ id, name }) => ({ value: id, label: name }))}
              />
            </>
          ) : null}

          {type === "income" && incomeOrigin === "freelance" ? (
            <>
              <FormField
                name="periodMonth"
                label="Mês de referência"
                type="date"
                defaultValue={monthStart}
                required
              />
              <FormField
                name="hoursWorked"
                label="Horas trabalhadas"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                defaultValue="0"
              />
              <FormField
                name="taxes"
                label="Impostos / custos"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                defaultValue="0"
              />
              <FormField
                name="daysWorked"
                label="Dias trabalhados"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                defaultValue="0"
              />
              <FormSelect
                name="status"
                label="Situação"
                defaultValue="cleared"
                required
                options={[
                  { value: "cleared", label: "Confirmado" },
                  { value: "pending", label: "Pendente" },
                ]}
              />
              <FormSelect
                name="accountId"
                label="Conta"
                options={accounts.map(({ id, name }) => ({ value: id, label: name }))}
              />
            </>
          ) : null}

          {type === "income" && incomeOrigin === "uber" ? (
            <>
              <FormField
                name="periodMonth"
                label="Mês de referência"
                type="date"
                defaultValue={monthStart}
                required
              />
              <FormField
                name="hoursWorked"
                label="Horas trabalhadas"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                defaultValue="0"
              />
              <FormField
                name="kmDriven"
                label="Quilômetros"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                defaultValue="0"
              />
              <FormField
                name="fuelCost"
                label="Combustível"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                defaultValue="0"
              />
              <FormField
                name="daysWorked"
                label="Dias trabalhados"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                defaultValue="0"
              />
              <FormSelect
                name="status"
                label="Situação"
                defaultValue="cleared"
                required
                options={[
                  { value: "cleared", label: "Confirmado" },
                  { value: "pending", label: "Pendente" },
                ]}
              />
              <FormSelect
                name="accountId"
                label="Conta"
                options={accounts.map(({ id, name }) => ({ value: id, label: name }))}
              />
            </>
          ) : null}

          {type === "expense" ? (
            <>
              <FormSelect
                name="accountId"
                label="Conta"
                options={accounts.map(({ id, name }) => ({ value: id, label: name }))}
              />
              <FormSelect
                name="categoryId"
                label="Categoria"
                options={categories.map(({ id, name }) => ({ value: id, label: name }))}
              />
              {!isRecurring ? (
                <FormSelect
                  name="creditCardId"
                  label="Cartão (opcional)"
                  className="sm:col-span-2"
                  options={cards.map(({ id, name }) => ({ value: id, label: name }))}
                />
              ) : (
                <FormField
                  name="dayOfMonth"
                  label="Dia do vencimento"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="31"
                  defaultValue={String(new Date().getDate())}
                  required
                  className="sm:col-span-2"
                />
              )}
              <label className="flex items-center gap-3 rounded-lg border border-border/60 p-3 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="size-5 shrink-0 rounded border-input"
                />
                <span>É recorrente? (ex.: luz, água)</span>
              </label>
            </>
          ) : null}

          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="notes" placeholder="Opcional" rows={2} />
          </div>
        </div>

        {loadingLookups && !lookups ? (
          <p className="text-sm text-muted-foreground">Carregando contas e categorias…</p>
        ) : null}

        <div className="sticky bottom-0 -mx-4 border-t border-border/60 bg-popover px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:pb-0">
          <Button
            type="submit"
            className="h-11 w-full sm:ml-auto sm:w-auto"
            disabled={loadingLookups && accounts.length === 0 && !lookups}
          >
            {type === "expense" && isRecurring ? "Criar conta recorrente" : "Salvar lançamento"}
          </Button>
        </div>
      </form>
    </LaunchDialog>
  );
}

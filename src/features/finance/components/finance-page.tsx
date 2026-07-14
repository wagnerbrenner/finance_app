import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Field = { name: string; label: string; type?: string; defaultValue?: string; required?: boolean; step?: string };
type Row = { id: string; title: string; detail?: string; amount?: string };
type Action = (data: FormData) => void | Promise<void>;

export function FinancePage({
  title, description, path, fields, rows, createAction, deleteAction, children,
}: { title: string; description: string; path: string; fields: Field[]; rows: Row[]; createAction: Action; deleteAction: Action; children?: React.ReactNode }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum registro ainda.</p> : rows.map((row) => (
            <div className="flex items-center justify-between rounded-lg border p-3" key={row.id}>
              <div><p className="font-medium">{row.title}</p>{row.detail && <p className="text-sm text-muted-foreground">{row.detail}</p>}</div>
              <div className="flex items-center gap-3"><span className="font-medium">{row.amount}</span><form action={deleteAction}><input type="hidden" name="id" value={row.id} /><input type="hidden" name="path" value={path} /><Button variant="ghost" type="submit">Excluir</Button></form></div>
            </div>
          ))}
          {children}
        </CardContent>
      </Card>
      <Card className="h-fit">
        <CardHeader><CardTitle>Novo registro</CardTitle></CardHeader>
        <CardContent>
          <form action={createAction} className="grid gap-3">
            <input type="hidden" name="path" value={path} />
            {fields.map((field) => <label className="grid gap-1 text-sm" key={field.name}>{field.label}<Input name={field.name} type={field.type ?? "text"} defaultValue={field.defaultValue} required={field.required ?? true} step={field.step} /></label>)}
            <Button type="submit">Salvar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

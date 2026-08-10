import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listQuery, tbl, type Row } from "@/lib/admin";
import { ImageField, ImageListField } from "@/components/admin/ImageField";

export type Field = {
  key: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "number"
    | "boolean"
    | "select"
    | "color"
    | "date"
    | "list"
    | "image"
    | "imagelist";
  options?: string[];
  placeholder?: string;
  help?: string;
};

export type Column = {
  key: string;
  label: string;
  render?: (row: Row) => React.ReactNode;
};

type Props = {
  table: string;
  title: string;
  description?: string;
  fields: Field[];
  columns: Column[];
  orderBy?: string;
  ascending?: boolean;
  defaults?: Row;
  canDelete?: boolean;
  canCreate?: boolean;
  transform?: (values: Row) => Row;
};

const inputCls =
  "w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold";

export function AdminCrud({
  table,
  title,
  description,
  fields,
  columns,
  orderBy,
  ascending = true,
  defaults = {},
  canDelete = true,
  canCreate = true,
  transform,
}: Props) {
  const qc = useQueryClient();
  const query = listQuery(table, { orderBy, ascending });
  const { data: rows, isLoading, error } = useQuery(query);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", table] });
    qc.invalidateQueries();
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = transform ? transform(form) : form;
      if (editing?.id) {
        const { error: e } = await tbl(table)
          .update(payload)
          .eq("id", editing.id as string);
        if (e) throw new Error(e.message);
      } else {
        const { error: e } = await tbl(table).insert(payload);
        if (e) throw new Error(e.message);
      }
    },
    onSuccess: () => {
      toast.success(editing?.id ? "Updated" : "Created");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error: e } = await tbl(table).delete().eq("id", id);
      if (e) throw new Error(e.message);
    },
    onSuccess: () => {
      toast.success("Deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setForm({ ...defaults });
    setEditing({});
  };
  const openEdit = (row: Row) => {
    const next: Row = {};
    for (const f of fields) {
      const v = row[f.key];
      if (Array.isArray(v) && (f.type === "list" || f.type === "imagelist")) {
        next[f.key] = v
          .map((item) =>
            item && typeof item === "object"
              ? `${(item as { name?: string }).name ?? ""}|${(item as { hex?: string }).hex ?? ""}`
              : String(item),
          )
          .join("\n");
      } else {
        next[f.key] = v ?? "";
      }
    }
    setForm(next);
    setEditing(row);
  };

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl">{title.toUpperCase()}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {canCreate && (
          <button
            onClick={openNew}
            className="heading flex items-center gap-2 bg-primary px-4 py-2.5 text-[11px] tracking-[0.2em] text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> ADD NEW
          </button>
        )}
      </header>

      {error && <p className="mb-4 text-sm text-primary">{(error as Error).message}</p>}

      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface-2">
            <tr className="heading text-[10px] tracking-[0.18em] text-muted-foreground">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3">
                  {c.label.toUpperCase()}
                </th>
              ))}
              <th className="px-4 py-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {rows?.map((row) => (
              <tr key={String(row.id)} className="border-t border-border hover:bg-surface">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 align-top">
                    {c.render ? c.render(row) : renderValue(row[c.key])}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(row)}
                      className="border border-border p-2 hover:border-gold hover:text-gold"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this item? This cannot be undone."))
                            remove.mutate(String(row.id));
                        }}
                        className="border border-border p-2 hover:border-primary hover:text-primary"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && !rows?.length && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-muted-foreground">
                  Nothing here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
          <div className="my-8 w-full max-w-2xl border border-border bg-surface p-6">
            <h2 className="heading mb-6 text-sm tracking-[0.2em] text-gold">
              {editing.id ? "EDIT" : "NEW"} {title.toUpperCase()}
            </h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
            >
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="heading mb-1.5 block text-[10px] tracking-[0.2em] text-muted-foreground">
                    {f.label.toUpperCase()}
                  </label>
                  {f.type === "image" ? (
                    <ImageField
                      value={String(form[f.key] ?? "")}
                      placeholder={f.placeholder}
                      onChange={(v) => set(f.key, v)}
                    />
                  ) : f.type === "imagelist" ? (
                    <ImageListField
                      value={String(form[f.key] ?? "")}
                      onChange={(v) => set(f.key, v)}
                    />
                  ) : f.type === "textarea" || f.type === "list" ? (
                    <textarea
                      rows={f.type === "list" ? 4 : 8}
                      className={inputCls}
                      placeholder={f.placeholder}
                      value={String(form[f.key] ?? "")}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                  ) : f.type === "boolean" ? (
                    <button
                      type="button"
                      onClick={() => set(f.key, !form[f.key])}
                      className={`heading border px-4 py-2 text-[10px] tracking-[0.2em] ${
                        form[f.key] ? "border-success text-success" : "border-border text-muted-foreground"
                      }`}
                    >
                      {form[f.key] ? "ENABLED" : "DISABLED"}
                    </button>
                  ) : f.type === "select" ? (
                    <select
                      className={inputCls}
                      value={String(form[f.key] ?? "")}
                      onChange={(e) => set(f.key, e.target.value)}
                    >
                      <option value="">—</option>
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      className={inputCls}
                      placeholder={f.placeholder}
                      value={String(form[f.key] ?? "")}
                      onChange={(e) =>
                        set(
                          f.key,
                          f.type === "number"
                            ? e.target.value === ""
                              ? null
                              : Number(e.target.value)
                            : e.target.value,
                        )
                      }
                    />
                  )}
                  {f.help && <p className="mt-1 text-xs text-muted-foreground">{f.help}</p>}
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="heading border border-border px-5 py-2.5 text-[11px] tracking-[0.2em]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={save.isPending}
                  className="heading bg-gold px-6 py-2.5 text-[11px] tracking-[0.2em] text-background disabled:opacity-60"
                >
                  {save.isPending ? "SAVING…" : "SAVE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function renderValue(v: unknown) {
  if (v === null || v === undefined || v === "") return <span className="text-muted-foreground">—</span>;
  if (typeof v === "boolean")
    return (
      <span className={v ? "text-success" : "text-muted-foreground"}>{v ? "Yes" : "No"}</span>
    );
  if (typeof v === "object") return <span className="text-muted-foreground">…</span>;
  const s = String(v);
  return s.length > 70 ? s.slice(0, 70) + "…" : s;
}

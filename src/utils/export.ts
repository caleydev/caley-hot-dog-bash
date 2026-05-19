type Row = Record<string, unknown>;

function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return "";
  const s = Array.isArray(val) ? val.join("; ") : String(val);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(rows: Row[], headers?: string[]): string {
  if (rows.length === 0) return (headers ?? []).join(",") + "\n";
  const keys = headers ?? Object.keys(rows[0]);
  const head = keys.join(",");
  const body = rows.map((r) => keys.map((k) => escapeCsv(r[k])).join(",")).join("\n");
  return head + "\n" + body + "\n";
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
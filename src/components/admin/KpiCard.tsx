import type { LucideIcon } from "lucide-react";

/*
 * Flat KPI card. One accent (navy/blue), hairline border, no resting shadow.
 * Elevation appears only on hover. The value is the sole heavy element so the
 * eye lands on the number, not the decoration.
 *
 * `tint` is kept for call-site compatibility but no longer paints the card —
 * the only colored variant is `alert`, used when a metric needs attention.
 */
export function KpiCard({
  label,
  value,
  icon: Icon,
  tint = "blue",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tint?: "blue" | "orange" | "red" | "yellow" | "green" | "alert";
}) {
  const isAlert = tint === "alert";
  return (
    <div className="surface surface-hover rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="font-display mt-1.5 text-3xl font-bold tabular-nums text-caley-navy">
            {value}
          </div>
        </div>
        <Icon
          className={`h-4 w-4 flex-shrink-0 ${isAlert ? "text-hotdog-red" : "text-muted-foreground"}`}
          strokeWidth={2}
        />
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  icon: Icon,
  tint = "blue",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tint?: "blue" | "orange" | "red" | "yellow" | "green";
}) {
  const tints: Record<string, string> = {
    blue: "from-caley-blue/10 to-transparent text-caley-blue",
    orange: "from-warm-orange/12 to-transparent text-warm-orange",
    red: "from-hotdog-red/12 to-transparent text-hotdog-red",
    yellow: "from-mustard/18 to-transparent text-caley-navy",
    green: "from-success/12 to-transparent text-success",
  };
  const topBar: Record<string, string> = {
    blue: "bg-caley-blue",
    orange: "bg-warm-orange",
    red: "bg-hotdog-red",
    yellow: "bg-mustard",
    green: "bg-success",
  };
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-2xl glass-strong p-4"
    >
      <div className={`absolute left-0 right-0 top-0 h-1 ${topBar[tint]}`} />
      <div className={`absolute inset-0 -z-0 bg-gradient-to-br ${tints[tint]}`} />
      <div className="relative flex items-start justify-between pt-1">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
            {label}
          </div>
          <div className="mt-1.5 text-3xl font-black text-caley-navy tabular-nums">{value}</div>
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft ring-1 ring-border">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
}
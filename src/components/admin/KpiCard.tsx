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
    blue: "from-caley-blue/15 to-caley-blue/5 text-caley-blue",
    orange: "from-warm-orange/15 to-warm-orange/5 text-warm-orange",
    red: "from-hotdog-red/15 to-hotdog-red/5 text-hotdog-red",
    yellow: "from-mustard/20 to-mustard/5 text-foreground",
    green: "from-success/15 to-success/5 text-success",
  };
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`relative overflow-hidden rounded-2xl glass p-4`}
    >
      <div className={`absolute inset-0 -z-0 bg-gradient-to-br ${tints[tint]}`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            {label}
          </div>
          <div className="mt-1 text-2xl font-black text-foreground">{value}</div>
        </div>
        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/70`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
}
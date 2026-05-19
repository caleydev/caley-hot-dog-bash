import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function InterestChip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
        selected
          ? "gradient-brand text-white border-transparent shadow-soft"
          : "bg-white/70 text-foreground border-border hover:border-caley-blue",
      )}
      aria-pressed={selected}
    >
      {selected && <Check className="h-3.5 w-3.5" />}
      {label}
    </motion.button>
  );
}
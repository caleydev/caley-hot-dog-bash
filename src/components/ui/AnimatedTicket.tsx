import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function AnimatedTicket({
  ticketNumber,
  name,
}: {
  ticketNumber: string;
  name?: string;
}) {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="ticket-shine relative mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] gradient-brand p-[3px] shadow-glow"
    >
      <div className="relative rounded-[1.75rem] bg-white px-6 py-7 text-center">
        <span className="absolute left-[-10px] top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-[var(--background)] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--caley-navy)_15%,transparent)]" />
        <span className="absolute right-[-10px] top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-[var(--background)] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--caley-navy)_15%,transparent)]" />

        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-caley-blue">
          <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3 text-mustard" /> {t("animTicket.brand")}</span>
          <span className="text-muted-foreground">{t("animTicket.giveaway")}</span>
        </div>

        <div className="mt-3 h-[3px] w-full rounded-full" style={{ background: "linear-gradient(90deg, var(--mustard), var(--hotdog-red))" }} />

        <div className="my-4 border-y border-dashed border-border/70 py-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{t("animTicket.label")}</div>
          <div className="font-display mt-1.5 text-[2.6rem] leading-none font-bold tracking-tight text-caley-navy tabular-nums">
            {ticketNumber}
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">{t("animTicket.keep")}</div>
        </div>

        {name && (
          <div className="text-sm text-foreground">
            <span className="text-muted-foreground">{t("animTicket.participant")} </span>
            <strong className="text-caley-navy">{name}</strong>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-hotdog-red" /> {t("animTicket.eventDay")}</span>
          <span className="text-caley-navy">Caley Insurance</span>
        </div>
      </div>
    </motion.div>
  );
}

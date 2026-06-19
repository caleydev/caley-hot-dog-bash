import { motion } from "framer-motion";
import { Sparkles, Ticket as TicketIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

/**
 * Premium 3D-style hero ticket — visual anchor for the landing page.
 * Pure presentation; no interaction.
 */
export function HeroTicket() {
  const { t } = useLanguage();
  return (
    <div className="relative mx-auto w-full max-w-sm" aria-hidden>
      {/* Floating accent shapes */}
      <motion.div
        className="absolute -left-3 -top-4 inline-flex h-9 w-9 items-center justify-center rounded-2xl gradient-warm text-white shadow-warm"
        animate={{ y: [0, -6, 0], rotate: [-6, 4, -6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-base">🌭</span>
      </motion.div>
      <motion.div
        className="absolute -right-2 -top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-mustard text-caley-navy shadow-soft"
        animate={{ y: [0, -5, 0], rotate: [8, -6, 8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <Sparkles className="h-4 w-4" />
      </motion.div>

      <motion.div
        initial={{ y: 14, opacity: 0, rotate: -2 }}
        animate={{ y: 0, opacity: 1, rotate: -2 }}
        transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.1 }}
        className="relative overflow-hidden rounded-[1.6rem] gradient-brand p-[2px] shadow-glow"
        style={{ transform: "perspective(900px) rotateX(6deg)" }}
      >
        <div className="relative rounded-[1.45rem] bg-white px-5 py-4">
          {/* Edge notches — navy-filled cutouts that match the hero background */}
          <span className="absolute left-[-10px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-caley-navy" />
          <span className="absolute right-[-10px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-caley-navy" />
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-caley-blue">
            <span className="inline-flex items-center gap-1"><TicketIcon className="h-3 w-3" /> {t("hero.admitOne")}</span>
            <span className="text-muted-foreground">Caley Insurance</span>
          </div>
          <div className="mt-2 h-[2px] w-full rounded-full" style={{ background: "linear-gradient(90deg, var(--warm-orange), var(--mustard))" }} />
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="text-left">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("hero.prizeLabel")}</div>
              <div className="font-display text-lg font-bold leading-tight text-caley-navy">{t("hero.prizeTitle")}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{t("hero.ticket")}</div>
              <div className="font-display text-xl font-bold tabular-nums text-caley-blue">CALEY-0042</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
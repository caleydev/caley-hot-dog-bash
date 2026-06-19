import { motion } from "framer-motion";
import { Ticket as TicketIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

// Faux barcode — varied bar widths (px) for an authentic ticket detail.
const BARS = [2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 1, 2, 1, 2, 1, 3, 1];

/**
 * Premium admit-one ticket — visual anchor for the landing page.
 * Main body + a torn stub divided by a dashed perforation through the notches.
 * Pure presentation; no interaction.
 */
export function HeroTicket() {
  const { t } = useLanguage();
  return (
    <div className="relative mx-auto w-full max-w-sm" aria-hidden>
      <motion.div
        initial={{ y: 14, opacity: 0, rotate: -2 }}
        animate={{ y: 0, opacity: 1, rotate: -2 }}
        transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.1 }}
        className="relative flex rounded-[1.4rem] bg-white shadow-[0_30px_70px_-28px_rgba(8,31,61,0.75)] ring-1 ring-black/5"
        style={{ transform: "perspective(900px) rotateX(6deg)" }}
      >
        {/* Main body */}
        <div className="min-w-0 flex-1 px-5 py-4">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em]">
            <span className="inline-flex items-center gap-1.5 text-caley-blue">
              <TicketIcon className="h-3 w-3" /> {t("hero.admitOne")}
            </span>
            <span className="font-semibold text-muted-foreground">Caley Insurance</span>
          </div>

          <div
            className="mt-2.5 h-[2px] w-full rounded-full"
            style={{ background: "linear-gradient(90deg, var(--warm-orange), var(--mustard))" }}
          />

          <div className="mt-3.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("hero.prizeLabel")}
            </div>
            <div className="font-display text-2xl font-bold leading-tight text-caley-navy">
              {t("hero.prizeTitle")}
            </div>
          </div>

          {/* Faux barcode */}
          <div className="mt-4 flex h-6 items-stretch gap-[2px]">
            {BARS.map((w, i) => (
              <span
                key={i}
                style={{ width: `${w}px` }}
                className="rounded-[1px] bg-caley-navy/85"
              />
            ))}
          </div>
        </div>

        {/* Perforation + notches */}
        <div className="relative flex items-stretch">
          <span className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-caley-navy" />
          <span className="absolute bottom-0 left-1/2 h-4 w-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-caley-navy" />
          <div className="border-l-2 border-dashed border-caley-navy/20" />
        </div>

        {/* Torn stub */}
        <div className="flex w-[74px] flex-col items-center justify-center gap-2 px-2 py-4">
          <div className="text-[8px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t("hero.ticket")}
          </div>
          <div className="font-display text-[15px] font-bold tabular-nums tracking-wide text-caley-blue [writing-mode:vertical-rl]">
            CALEY-0042
          </div>
        </div>
      </motion.div>
    </div>
  );
}

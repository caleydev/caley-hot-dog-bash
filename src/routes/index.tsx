import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock3, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LeadForm } from "@/components/forms/LeadForm";
import { HeroTicket } from "@/components/ui/HeroTicket";
import { useLanguage } from "@/lib/i18n";
import sloganAsset from "@/assets/slogan-call-someone-special-neon.png";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t } = useLanguage();
  return (
    <PublicLayout>
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-2 lg:gap-14">
        {/* Left — pitch + ticket */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6 text-center lg:text-left"
        >
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-warm-orange" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
              {t("index.eyebrow")}
            </span>
          </div>

          <div className="relative">
            {/* Soft ambient halo behind the slogan — light, no box */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(60% 70% at 50% 50%, color-mix(in oklab, var(--caley-blue) 38%, transparent) 0%, transparent 70%)",
                filter: "blur(10px)",
              }}
            />
            <h1 className="sr-only">{t("index.slogan")}</h1>
            <img
              src={sloganAsset}
              alt={t("index.sloganAlt")}
              className="relative mx-auto w-full max-w-[460px] select-none lg:mx-0"
              draggable={false}
            />
          </div>

          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-white/85 lg:mx-0">
            {t("index.intro")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
              <Clock3 className="h-3 w-3 text-mustard" /> {t("index.badgeQuick")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-mustard" /> {t("index.badgePrizes")}
            </span>
          </div>

          {/* Decorative — hidden on phones so the sign-up form is reachable
              without a long scroll; users get a real ticket after signing up. */}
          <div className="hidden pt-2 lg:block">
            <HeroTicket />
          </div>
        </motion.div>

        {/* Right — sign-up form */}
        <div className="lg:pl-4">
          <LeadForm />
        </div>
      </div>
    </PublicLayout>
  );
}

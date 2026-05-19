import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock3, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LeadForm } from "@/components/forms/LeadForm";
import { HeroTicket } from "@/components/ui/HeroTicket";
import sloganAsset from "@/assets/slogan-call-someone-special.png";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-xl space-y-5">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-5 pt-2"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-caley-sky animate-pulse" />
            Evento especial • Caley Insurance
          </span>

          <motion.div
            initial={{ y: 22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
            className="relative mx-auto w-full max-w-[520px]"
          >
            {/* Soft ambient halo behind the slogan — no box, just light */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(60% 55% at 50% 55%, color-mix(in oklab, var(--caley-blue) 35%, transparent) 0%, transparent 70%)",
                filter: "blur(8px)",
              }}
            />
            <h1 className="sr-only">Call Someone Special Today — Caley Insurance</h1>
            <img
              src={sloganAsset}
              alt="Call Someone Special Today — slogan de Caley Insurance con letras iluminadas que sugieren CALEY"
              className="slogan-glow relative mx-auto w-full max-w-[460px] select-none"
              draggable={false}
            />
          </motion.div>

          <p className="text-[15px] text-white/85 max-w-md mx-auto leading-relaxed pt-1">
            Regístrate, dinos qué seguro te interesa y participa por premios
            especiales del evento.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
              <Clock3 className="h-3 w-3 text-mustard" /> Toma menos de 1 minuto
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-mustard" /> Premios del evento
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="px-2 pt-2"
        >
          <HeroTicket />
        </motion.div>

        <LeadForm />
      </div>
    </PublicLayout>
  );
}

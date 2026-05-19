import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock3, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LeadForm } from "@/components/forms/LeadForm";
import { EventBadge } from "@/components/ui/EventBadge";
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
          className="text-center space-y-4 pt-1"
        >
          <EventBadge>Evento especial • Caley Insurance</EventBadge>

          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            className="relative mx-auto mt-1 w-full max-w-[560px]"
          >
            {/* Dark navy slogan stage — premium illuminated wall sign */}
            <div
              className="relative overflow-hidden rounded-[1.75rem] border border-caley-blue/25 px-5 py-8 sm:px-10 sm:py-12 shadow-[0_30px_80px_-30px_rgba(8,31,61,0.65),0_0_0_1px_color-mix(in_oklab,var(--caley-blue)_18%,transparent)_inset]"
              style={{
                background:
                  "radial-gradient(120% 80% at 50% 0%, color-mix(in oklab, var(--caley-blue) 28%, transparent) 0%, transparent 55%), radial-gradient(80% 60% at 50% 100%, color-mix(in oklab, var(--caley-blue) 18%, transparent) 0%, transparent 60%), linear-gradient(160deg, #0B2A4A 0%, #081F3D 60%, #061830 100%)",
              }}
            >
              {/* Subtle wall grid texture */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "linear-gradient(color-mix(in oklab, white 60%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, white 60%, transparent) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
              {/* Animated soft glow */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                animate={{ opacity: [0.55, 0.85, 0.55] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background:
                    "radial-gradient(55% 45% at 50% 50%, color-mix(in oklab, var(--caley-blue) 45%, transparent) 0%, transparent 70%)",
                }}
              />

              <h1 className="sr-only">Call Someone Special Today — Caley Insurance</h1>
              <img
                src={sloganAsset}
                alt="Call Someone Special Today — slogan de Caley Insurance con letras iluminadas que sugieren CALEY"
                className="relative mx-auto w-full max-w-[460px] select-none drop-shadow-[0_0_24px_color-mix(in_oklab,var(--caley-blue)_60%,transparent)]"
                draggable={false}
              />
            </div>
          </motion.div>

          <p className="text-[15px] text-caley-navy/85 max-w-md mx-auto leading-relaxed pt-1">
            Regístrate, dinos qué seguro te interesa y participa por premios
            especiales del evento.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <EventBadge tone="warm" icon={<Clock3 className="h-3 w-3 text-hotdog-red" />}>
              Toma menos de 1 minuto
            </EventBadge>
            <EventBadge icon={<Sparkles className="h-3 w-3 text-mustard" />}>
              Premios del evento
            </EventBadge>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="px-2"
        >
          <HeroTicket />
        </motion.div>

        <LeadForm />
      </div>
    </PublicLayout>
  );
}

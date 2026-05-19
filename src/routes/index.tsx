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
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            className="relative mx-auto mt-1 w-full max-w-[520px]"
          >
            {/* Soft blue aura behind slogan */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-70"
              style={{
                background:
                  "radial-gradient(60% 55% at 50% 50%, color-mix(in oklab, var(--caley-blue) 35%, transparent) 0%, transparent 70%)",
              }}
            />
            <motion.div
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <h1 className="sr-only">Call Someone Special Today — Caley Insurance</h1>
              <img
                src={sloganAsset}
                alt="Call Someone Special Today — slogan de Caley Insurance con letras iluminadas que sugieren CALEY"
                className="relative mx-auto w-full select-none drop-shadow-[0_8px_30px_color-mix(in_oklab,var(--caley-blue)_35%,transparent)]"
                draggable={false}
              />
            </motion.div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-caley-blue/80">
              Caley signature message
            </div>
          </motion.div>

          <p className="text-[15px] text-caley-navy/80 max-w-md mx-auto leading-relaxed pt-1">
            Regístrate, dinos qué seguro te interesa y participa por premios
            especiales del evento.
          </p>
          <p className="text-[13px] text-muted-foreground max-w-md mx-auto">
            Hot dogs, premios y una experiencia especial con Caley Insurance.
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

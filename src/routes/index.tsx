import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock3, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LeadForm } from "@/components/forms/LeadForm";
import { EventBadge } from "@/components/ui/EventBadge";
import { HeroTicket } from "@/components/ui/HeroTicket";

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
          className="text-center space-y-3 pt-1"
        >
          <EventBadge>Evento especial • Caley Insurance</EventBadge>
          <h1 className="text-[2.4rem] leading-[1.05] sm:text-5xl font-black tracking-tight text-caley-navy">
            Caley Hot Dog
            <br />
            <span className="text-gradient-warm">Giveaway</span>
          </h1>
          <p className="text-[15px] text-muted-foreground max-w-md mx-auto leading-relaxed">
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

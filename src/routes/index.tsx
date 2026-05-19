import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Ticket } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LeadForm } from "@/components/forms/LeadForm";
import { EventBadge } from "@/components/ui/EventBadge";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-xl space-y-6">
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-3"
        >
          <EventBadge>Evento especial de Caley Insurance</EventBadge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            <span className="text-gradient-brand">Caley Hot Dog</span>
            <br />
            <span className="text-gradient-warm">Giveaway 🌭</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto">
            Regístrate, dinos qué seguro te interesa y participa por premios
            especiales del evento.
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-mustard" />
            Toma menos de 1 minuto.
          </div>
        </motion.div>

        {/* Floating decor */}
        <div aria-hidden className="relative h-0">
          <Ticket className="absolute -top-2 -left-2 h-8 w-8 text-caley-blue/40 animate-float" />
          <span className="absolute -top-4 right-2 text-2xl animate-float" style={{ animationDelay: "-2s" }}>🌭</span>
        </div>

        <LeadForm />
      </div>
    </PublicLayout>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Home } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { AnimatedTicket } from "@/components/ui/AnimatedTicket";
import { eventService } from "@/services/eventService";
import type { Participant } from "@/types/event";
import { bigBurst } from "@/lib/confetti";
import { toast } from "sonner";

export const Route = createFileRoute("/ticket/$ticketNumber")({
  component: TicketPage,
});

function TicketPage() {
  const { ticketNumber } = Route.useParams();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(true);

  useEffect(() => {
    eventService.getTicketByNumber(ticketNumber).then((res) => {
      if (!res) {
        setValid(false);
      } else {
        setParticipant(res.participant);
        setTimeout(() => bigBurst(), 300);
      }
      setLoading(false);
    });
  }, [ticketNumber]);

  if (loading) {
    return <PublicLayout><div className="mx-auto max-w-md glass rounded-3xl p-8 text-center">Cargando…</div></PublicLayout>;
  }
  if (!valid) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md glass rounded-3xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold">No encontramos este ticket</h2>
          <Button asChild><Link to="/"><Home className="h-4 w-4"/> Volver al inicio</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gradient-brand">¡Tu ticket está listo!</h1>
          <p className="text-sm text-muted-foreground">
            Guarda este número. Lo usaremos para anunciar los ganadores durante el evento.
          </p>
        </div>

        <AnimatedTicket ticketNumber={ticketNumber} name={participant?.fullName} />

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={() => {
              navigator.clipboard.writeText(ticketNumber);
              toast.success("Número copiado");
            }}
          >
            <Copy className="h-4 w-4" /> Copiar número
          </Button>
          <Button asChild className="flex-1 h-12 gradient-brand text-white">
            <Link to="/"><Home className="h-4 w-4"/> Volver al inicio</Link>
          </Button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          No purchase required. Insurance purchase does not increase chances of winning.
        </p>
      </div>
    </PublicLayout>
  );
}
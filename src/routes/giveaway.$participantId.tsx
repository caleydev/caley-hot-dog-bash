import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { ReferralForm } from "@/components/forms/ReferralForm";
import { eventService } from "@/services/eventService";
import type { Participant } from "@/types/event";

export const Route = createFileRoute("/giveaway/$participantId")({
  component: GiveawayPage,
});

function GiveawayPage() {
  const { participantId } = Route.useParams();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.getParticipantById(participantId)
      .then((p) => {
        setParticipant(p);
      })
      .catch(() => {
        setParticipant(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [participantId]);

  if (loading) {
    return <PublicLayout><div className="mx-auto max-w-md glass rounded-3xl p-8 text-center">Cargando...</div></PublicLayout>;
  }
  if (!participant) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md glass rounded-3xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold">Enlace invalido</h2>
          <Button asChild><Link to="/">Volver al inicio</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  if (participant.giveawayOptedIn && participant.ticketNumber) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md glass rounded-3xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold">Ya tienes un ticket</h2>
          <p className="text-muted-foreground">Tu numero: <strong>{participant.ticketNumber}</strong></p>
          <Button asChild className="gradient-brand text-white">
            <Link to="/ticket/$ticketNumber" params={{ ticketNumber: participant.ticketNumber }}>Ver mi ticket</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-xl space-y-5">
        <div className="text-center space-y-2">
          <h1
            className="text-3xl sm:text-4xl font-black text-[#F8FBFF]"
            style={{
              textShadow:
                "0 2px 18px rgba(0, 0, 0, 0.35), 0 0 24px rgba(125, 190, 255, 0.22)",
            }}
          >
            Entra al Giveaway
          </h1>
          <p
            className="text-sm text-[rgba(235,247,255,0.82)]"
            style={{ textShadow: "0 1px 10px rgba(0, 0, 0, 0.24)" }}
          >
            Agrega 3 personas que podrían necesitar seguro y recibe tu número de ticket.
          </p>
        </div>
        <ReferralForm participant={participant} />
      </div>
    </PublicLayout>
  );
}

import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Home, Trophy } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { AnimatedTicket } from "@/components/ui/AnimatedTicket";
import { eventService } from "@/services/eventService";
import type { GiveawayStatus, Participant } from "@/types/event";
import { bigBurst } from "@/lib/confetti";
import { useLanguage } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/ticket/$ticketNumber")({
  component: TicketPage,
});

function TicketPage() {
  const { ticketNumber } = Route.useParams();
  const { t } = useLanguage();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(true);
  const [status, setStatus] = useState<GiveawayStatus | null>(null);
  const celebrated = useRef(false);

  useEffect(() => {
    eventService.getTicketByNumber(ticketNumber)
      .then((res) => {
        if (!res) {
          setValid(false);
        } else {
          setParticipant(res.participant);
          setTimeout(() => bigBurst(), 300);
        }
      })
      .catch(() => {
        setValid(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ticketNumber]);

  // Live giveaway results: poll so the participant's phone updates itself when
  // a winner is drawn — celebrating once if this ticket is the one selected.
  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const next = await eventService.getGiveawayStatus(ticketNumber);
        if (!active) return;
        setStatus(next);
        if (next.youWon && !celebrated.current) {
          celebrated.current = true;
          bigBurst();
        }
      } catch {
        // Keep the last known status on transient errors.
      }
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [ticketNumber]);

  if (loading) {
    return <PublicLayout><div className="mx-auto max-w-md glass rounded-3xl p-8 text-center">{t("common.loading")}</div></PublicLayout>;
  }
  if (!valid) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md glass rounded-3xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold">{t("ticket.notFound.title")}</h2>
          <Button asChild><Link to="/"><Home className="h-4 w-4"/> {t("common.backHome")}</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1
            className="text-3xl font-black text-[#F8FBFF]"
            style={{
              textShadow:
                "0 2px 18px rgba(0, 0, 0, 0.35), 0 0 24px rgba(125, 190, 255, 0.22)",
            }}
          >
            {t("ticket.title")}
          </h1>
          <p
            className="text-sm text-[rgba(235,247,255,0.82)]"
            style={{ textShadow: "0 1px 10px rgba(0, 0, 0, 0.24)" }}
          >
            {t("ticket.subtitle")}
          </p>
        </div>

        <AnimatedTicket ticketNumber={ticketNumber} name={participant?.fullName} />

        {status?.youWon ? (
          <div className="glass rounded-2xl p-6 text-center space-y-2 ring-2 ring-success/45">
            <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
              <Trophy className="h-7 w-7" />
            </span>
            <div className="text-2xl font-black text-success">{t("ticket.status.youWon")}</div>
            {status.yourPrize && (
              <div className="text-base font-bold text-caley-navy">
                {t("ticket.status.youWonPrize", { prize: status.yourPrize })}
              </div>
            )}
            <p className="text-sm text-muted-foreground">{t("ticket.status.youWonBody")}</p>
          </div>
        ) : status && status.totalWinners > 0 ? (
          <div className="glass rounded-2xl p-4 text-center space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-caley-blue">
              {t("ticket.status.heading")}
            </div>
            <div className="text-lg font-extrabold tabular-nums text-caley-navy">
              {t("ticket.status.latest", { ticket: status.latestTicket ?? "" })}
            </div>
            {status.latestName && (
              <p className="text-sm text-muted-foreground">
                {t("ticket.status.latestBy", { name: status.latestName })}
              </p>
            )}
            <p className="pt-1 text-xs text-muted-foreground">{t("ticket.status.notYou")}</p>
          </div>
        ) : (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-caley-blue animate-pulse" />
              {t("ticket.status.waiting")}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(ticketNumber);
                toast.success(t("ticket.copied"));
              } catch {
                toast.error(t("ticket.copyError"));
              }
            }}
          >
            <Copy className="h-4 w-4" /> {t("ticket.copy")}
          </Button>
          <Button asChild className="flex-1 h-12 gradient-brand text-white">
            <Link to="/"><Home className="h-4 w-4"/> {t("common.backHome")}</Link>
          </Button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          {t("ticket.disclaimer")}
        </p>
      </div>
    </PublicLayout>
  );
}

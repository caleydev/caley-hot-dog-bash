import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Gift, PartyPopper } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { eventService } from "@/services/eventService";
import type { Participant } from "@/types/event";
import { bigBurst } from "@/lib/confetti";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/thanks/$participantId")({
  component: ThanksPage,
});

function ThanksPage() {
  const { participantId } = Route.useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    eventService.getParticipantById(participantId)
      .then((p) => {
        setParticipant(p);
        if (p) setTimeout(() => bigBurst(), 200);
      })
      .catch(() => {
        setParticipant(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [participantId]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md glass rounded-3xl p-8 text-center">{t("common.loading")}</div>
      </PublicLayout>
    );
  }

  if (!participant) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md glass rounded-3xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold">{t("thanks.notFound.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("thanks.notFound.body")}</p>
          <Button asChild><Link to="/">{t("common.backHome")}</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  if (declined) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md glass rounded-3xl p-8 text-center space-y-3">
          <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-mustard/20 text-warm-orange">
            <PartyPopper className="h-9 w-9" />
          </span>
          <h2 className="text-2xl font-bold">{t("thanks.declined.title")}</h2>
          <p className="text-muted-foreground">{t("thanks.declined.body")}</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-auto max-w-md glass rounded-3xl p-7 text-center space-y-5"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
          className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success"
        >
          <CheckCircle2 className="h-9 w-9" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold text-caley-navy">{t("thanks.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("thanks.subtitle", { name: participant.fullName.split(" ")[0] })}
          </p>
        </div>

        <div className="rounded-2xl gradient-warm p-4 text-white text-sm flex items-center gap-3">
          <Gift className="h-6 w-6 shrink-0" />
          <span
            className="text-left"
            dangerouslySetInnerHTML={{ __html: t("thanks.giveawayCallout") }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={() => navigate({ to: "/giveaway/$participantId", params: { participantId } })}
            className="h-12 gradient-brand text-white shadow-soft"
          >
            {t("thanks.enterGiveaway")}
          </Button>
          <Button variant="ghost" onClick={() => setDeclined(true)}>{t("thanks.notNow")}</Button>
        </div>
      </motion.div>
    </PublicLayout>
  );
}

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, UserPlus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { formatPhone, isValidPhone, normalizePhone } from "@/utils/phone";
import { eventService } from "@/services/eventService";
import { toast } from "sonner";
import { burst } from "@/lib/confetti";
import { useLanguage } from "@/lib/i18n";
import type { Participant } from "@/types/event";

interface RefRow {
  name: string;
  phone: string;
}
const empty: RefRow = { name: "", phone: "" };

export function ReferralForm({ participant }: { participant: Participant }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [rows, setRows] = useState<RefRow[]>([empty, empty, empty]);
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const completion = useMemo(
    () => rows.filter((r) => r.name.trim() && isValidPhone(r.phone)).length,
    [rows],
  );

  const phonesValid = useMemo(() => {
    const normalized = rows
      .map((r) => normalizePhone(r.phone))
      .filter((p) => p.length > 0);
    const uniques = new Set(normalized);
    if (uniques.size !== normalized.length) return false;
    if (participant.phone) {
      return !normalized.includes(normalizePhone(participant.phone));
    }
    return true;
  }, [rows, participant.phone]);

  // Reason the form can't be submitted yet — surfaced inline once attempted.
  const blockReason =
    completion < 3
      ? t("ref.block.incomplete")
      : !phonesValid
        ? t("ref.block.duplicate")
        : !confirm
          ? t("ref.block.confirm")
          : undefined;

  const canSubmit = !blockReason && !submitting;

  const updateRow = (i: number, patch: Partial<RefRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { ticketNumber } = await eventService.createReferralsAndTicket(
        participant.id,
        rows.map((r) => ({ name: r.name.trim(), phone: normalizePhone(r.phone) })),
      );
      burst();
      navigate({ to: "/ticket/$ticketNumber", params: { ticketNumber } });
    } catch (e) {
      console.error(e);
      toast.error(t("ref.toast.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{t("ref.progress", { count: completion })}</span>
          <span className="text-muted-foreground">{t("ref.step")}</span>
        </div>
        <Progress value={(completion / 3) * 100} className="mt-2 h-2" />
      </div>

      {rows.map((row, i) => {
        const done = row.name.trim() && isValidPhone(row.phone);
        return (
          <motion.div
            key={i}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`glass rounded-2xl p-4 transition-shadow ${done ? "shadow-glow ring-1 ring-caley-blue/40" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <UserPlus className="h-4 w-4 text-caley-blue" />
                {t("ref.row", { n: i + 1 })}
              </div>
              {done && (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/20 text-success">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor={`name-${i}`}>{t("ref.name")}</Label>
                <Input
                  id={`name-${i}`}
                  value={row.name}
                  onChange={(e) => updateRow(i, { name: e.target.value })}
                  className="h-11 mt-1"
                  placeholder={t("ref.namePlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor={`phone-${i}`}>{t("ref.phone")}</Label>
                <Input
                  id={`phone-${i}`}
                  inputMode="tel"
                  value={row.phone}
                  onChange={(e) => updateRow(i, { phone: formatPhone(e.target.value) })}
                  className="h-11 mt-1"
                  placeholder={t("ref.phonePlaceholder")}
                />
              </div>
            </div>
          </motion.div>
        );
      })}

      <label className="flex items-start gap-3 glass rounded-2xl p-4 cursor-pointer">
        <Checkbox checked={confirm} onCheckedChange={(v) => setConfirm(v === true)} className="mt-0.5" />
        <span className="text-xs text-foreground/80">
          {t("ref.confirm")}
        </span>
      </label>

      {submitted && blockReason && (
        <p
          role="alert"
          className="text-center text-xs text-destructive"
        >
          {blockReason}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="h-12 w-full text-base gradient-warm text-white shadow-warm hover:opacity-95 disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {t("ref.submitting")}
          </>
        ) : (
          t("ref.submit")
        )}
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        {t("ref.disclaimer")}
      </p>
    </form>
  );
}

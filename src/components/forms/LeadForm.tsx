import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InterestChip } from "@/components/ui/InterestChip";
import { INTEREST_OPTIONS, type Interest } from "@/types/event";
import { formatPhone, isValidPhone, normalizePhone } from "@/utils/phone";
import { isValidEmail } from "@/utils/validation";
import { eventService } from "@/services/eventService";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { burst } from "@/lib/confetti";
import { useLanguage } from "@/lib/i18n";
import { toast } from "sonner";

interface Errors {
  fullName?: string;
  phone?: string;
  email?: string;
  interests?: string;
  consent?: string;
}

type FieldName = keyof Errors;

export function LeadForm() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const toggleInterest = (i: Interest) => {
    setTouched((t) => ({ ...t, interests: true }));
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  };

  const markTouched = (field: FieldName) =>
    setTouched((t) => ({ ...t, [field]: true }));

  const validate = (): Errors => {
    const e: Errors = {};
    if (!fullName.trim()) e.fullName = t("lead.err.name");
    if (!isValidPhone(phone)) e.phone = t("lead.err.phone");
    if (!isValidEmail(email)) e.email = t("lead.err.email");
    if (interests.length === 0) e.interests = t("lead.err.interests");
    if (!consent) e.consent = t("lead.err.consent");
    return e;
  };

  const errors = validate();
  const isValid = Object.keys(errors).length === 0;
  // Show a field's error once the user has touched it or attempted to submit.
  const showError = (field: FieldName) =>
    (submitted || touched[field]) && errors[field] ? errors[field] : undefined;

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    if (!isValid) return;
    setSubmitting(true);
    try {
      if (!isSupabaseConfigured) {
        const existing = await eventService.findParticipantByPhoneOrEmail(
          phone,
          email,
        );
        if (existing) {
          toast.info(t("lead.toast.exists"));
          navigate({
            to: "/thanks/$participantId",
            params: { participantId: existing.id },
          });
          return;
        }
      }

      const p = await eventService.createParticipant({
        fullName: fullName.trim(),
        phone: normalizePhone(phone),
        email: email.trim().toLowerCase(),
        interests,
        consentContact: true,
      });
      if (p.alreadyExists) {
        toast.info(t("lead.toast.exists"));
      }
      burst();
      navigate({ to: "/thanks/$participantId", params: { participantId: p.id } });
    } catch (err) {
      console.error(err);
      toast.error(t("lead.toast.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      onSubmit={onSubmit}
      className="rounded-2xl bg-white p-5 ring-1 ring-black/5 shadow-[0_28px_70px_-28px_rgba(8,31,61,0.55)] sm:p-7"
      noValidate
    >
      <div className="mb-5 flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl gradient-brand text-white shadow-soft">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-[10px] font-bold uppercase tracking-wider text-caley-blue">{t("lead.step")}</div>
            <div className="text-sm font-bold text-caley-navy">{t("lead.stepTitle")}</div>
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("lead.tag")}</span>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName" className="text-caley-navy font-semibold">{t("lead.name")}</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => markTouched("fullName")}
            placeholder={t("lead.namePlaceholder")}
            autoComplete="name"
            className="h-11 mt-1.5"
            aria-invalid={showError("fullName") ? true : undefined}
            aria-describedby={showError("fullName") ? "fullName-error" : undefined}
          />
          {showError("fullName") && (
            <p id="fullName-error" className="mt-1 text-xs text-destructive">{errors.fullName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className="text-caley-navy font-semibold">{t("lead.phone")}</Label>
          <Input
            id="phone"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            onBlur={() => markTouched("phone")}
            placeholder={t("lead.phonePlaceholder")}
            className="h-11 mt-1.5"
            aria-invalid={showError("phone") ? true : undefined}
            aria-describedby={showError("phone") ? "phone-error" : undefined}
          />
          {showError("phone") && (
            <p id="phone-error" className="mt-1 text-xs text-destructive">{errors.phone}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-caley-navy font-semibold">{t("lead.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => markTouched("email")}
            placeholder={t("lead.emailPlaceholder")}
            className="h-11 mt-1.5"
            aria-invalid={showError("email") ? true : undefined}
            aria-describedby={showError("email") ? "email-error" : undefined}
          />
          {showError("email") && (
            <p id="email-error" className="mt-1 text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        <div>
          <Label className="text-caley-navy font-semibold">{t("lead.interests")}</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((i) => (
              <InterestChip
                key={i}
                label={t(`interest.${i}`)}
                selected={interests.includes(i)}
                onToggle={() => toggleInterest(i)}
              />
            ))}
          </div>
          {showError("interests") && (
            <p id="interests-error" className="mt-1 text-xs text-destructive">{errors.interests}</p>
          )}
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-border bg-muted/70 p-3 cursor-pointer hover:border-caley-blue/40 transition-colors">
          <Checkbox
            checked={consent}
            onCheckedChange={(v) => {
              setConsent(v === true);
              markTouched("consent");
            }}
            className="flex-shrink-0"
            aria-describedby={showError("consent") ? "consent-error" : undefined}
          />
          <span className="text-xs text-foreground/85 leading-relaxed">
            {t("lead.consent")}
          </span>
        </label>
        {showError("consent") && (
          <p id="consent-error" className="text-xs text-destructive">{errors.consent}</p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full text-base font-semibold gradient-brand text-white shadow-glow hover:shadow-[0_18px_40px_-12px_var(--caley-blue)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {t("lead.submitting")}
            </>
          ) : (
            <>
              {t("lead.submit")} <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-[11px] text-muted-foreground/80">
          {t("lead.disclaimer")}
        </p>
      </div>
    </motion.form>
  );
}

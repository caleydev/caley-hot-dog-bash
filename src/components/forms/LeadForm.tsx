import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
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
import { burst } from "@/lib/confetti";
import { toast } from "sonner";

interface Errors {
  fullName?: string;
  phone?: string;
  email?: string;
  interests?: string;
  consent?: string;
}

export function LeadForm() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const toggleInterest = (i: Interest) =>
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );

  const validate = (): Errors => {
    const e: Errors = {};
    if (!fullName.trim()) e.fullName = "El nombre es requerido.";
    if (!isValidPhone(phone)) e.phone = "Ingresa un teléfono válido.";
    if (!isValidEmail(email)) e.email = "Ingresa un correo válido.";
    if (interests.length === 0) e.interests = "Selecciona al menos un seguro.";
    if (!consent) e.consent = "Debes aceptar el consentimiento.";
    return e;
  };

  const isValid =
    fullName.trim() &&
    isValidPhone(phone) &&
    isValidEmail(email) &&
    interests.length > 0 &&
    consent;

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSubmitting(true);
    try {
      const existing = await eventService.findParticipantByPhoneOrEmail(
        phone,
        email,
      );
      if (existing) {
        toast.info("Parece que ya te registraste. Te llevamos al siguiente paso.");
        navigate({ to: "/thanks/$participantId", params: { participantId: existing.id } });
        return;
      }
      const p = await eventService.createParticipant({
        fullName: fullName.trim(),
        phone: normalizePhone(phone),
        email: email.trim().toLowerCase(),
        interests,
        consentContact: true,
      });
      burst();
      navigate({ to: "/thanks/$participantId", params: { participantId: p.id } });
    } catch (err) {
      console.error(err);
      toast.error("No pudimos guardar tu registro. Intenta de nuevo.");
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
      className="glass rounded-3xl p-5 sm:p-7 shadow-soft"
      noValidate
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-caley-blue">
          Paso 1 de 2 — Registro
        </span>
        <ShieldCheck className="h-4 w-4 text-caley-blue" />
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
            autoComplete="name"
            className="h-12 mt-1.5"
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(787) 555-1234"
            className="h-12 mt-1.5"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tunombre@correo.com"
            className="h-12 mt-1.5"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        <div>
          <Label>Seguros de interés</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((i) => (
              <InterestChip
                key={i}
                label={i}
                selected={interests.includes(i)}
                onToggle={() => toggleInterest(i)}
              />
            ))}
          </div>
          {errors.interests && (
            <p className="mt-1 text-xs text-destructive">{errors.interests}</p>
          )}
        </div>

        <label className="flex items-start gap-3 rounded-xl bg-white/60 p-3 cursor-pointer">
          <Checkbox
            checked={consent}
            onCheckedChange={(v) => setConsent(v === true)}
            className="mt-0.5"
          />
          <span className="text-xs text-foreground/80">
            Acepto que Caley Insurance me pueda contactar sobre opciones de
            seguro relacionadas con mis intereses.
          </span>
        </label>
        {errors.consent && (
          <p className="text-xs text-destructive">{errors.consent}</p>
        )}

        <Button
          type="submit"
          disabled={!isValid || submitting}
          className="h-12 w-full text-base gradient-brand text-white shadow-soft hover:opacity-95"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Guardando…
            </>
          ) : (
            "Continuar"
          )}
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">
          No purchase required. Insurance purchase does not increase chances of winning.
        </p>
      </div>
    </motion.form>
  );
}
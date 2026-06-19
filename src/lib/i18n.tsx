import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Lang = "es" | "en";

const STORAGE_KEY = "caley_lang";
const DEFAULT_LANG: Lang = "es";

type Messages = Record<string, string>;

// Spanish is the source language for the public flow; English mirrors it.
const es: Messages = {
  // Layout / header
  "header.eventBadge": "Evento Hot Dog",
  "lang.label": "Idioma",
  "lang.es": "ES",
  "lang.en": "EN",

  // Landing (index)
  "index.eyebrow": "Evento especial • Caley Insurance",
  "index.slogan": "Call Someone Special Today",
  "index.sloganAlt":
    "Call Someone Special Today — slogan de Caley Insurance con letras iluminadas que sugieren CALEY",
  "index.intro":
    "Regístrate, dinos qué seguro te interesa y participa por premios especiales del evento.",
  "index.badgeQuick": "Toma menos de 1 minuto",
  "index.badgePrizes": "Premios del evento",

  // Footer
  "footer.rights": "Todos los derechos reservados.",
  "footer.tagline": "Hecho con cariño para el evento Caley Hot Dog.",

  // Interests
  "interest.Carro": "Carro",
  "interest.Casa": "Casa",
  "interest.Comercial": "Comercial",
  "interest.Health": "Salud",
  "interest.Boat": "Bote",

  // Lead form
  "lead.step": "Paso 1 de 2",
  "lead.stepTitle": "Registro",
  "lead.tag": "Seguro · Rápido",
  "lead.name": "Nombre completo",
  "lead.namePlaceholder": "Tu nombre",
  "lead.phone": "Teléfono",
  "lead.phonePlaceholder": "(787) 555-1234",
  "lead.email": "Correo electrónico",
  "lead.emailPlaceholder": "tunombre@correo.com",
  "lead.interests": "Seguros de interés",
  "lead.consent":
    "Acepto que Caley Insurance me pueda contactar sobre opciones de seguro relacionadas con mis intereses.",
  "lead.submit": "Continuar",
  "lead.submitting": "Guardando...",
  "lead.disclaimer":
    "No purchase required. Insurance purchase does not increase chances of winning.",
  "lead.err.name": "El nombre es requerido.",
  "lead.err.phone": "Ingresa un teléfono válido.",
  "lead.err.email": "Ingresa un correo válido.",
  "lead.err.interests": "Selecciona al menos un seguro.",
  "lead.err.consent": "Debes aceptar el consentimiento.",
  "lead.toast.exists":
    "Parece que ya te registraste. Te llevamos al siguiente paso.",
  "lead.toast.error": "No pudimos guardar tu registro. Intenta de nuevo.",

  // Referral form
  "ref.progress": "{count}/3 referidos completados",
  "ref.step": "Paso 2 de 2",
  "ref.row": "Referido {n}",
  "ref.name": "Nombre",
  "ref.namePlaceholder": "Nombre completo",
  "ref.phone": "Teléfono",
  "ref.phonePlaceholder": "(787) 555-1234",
  "ref.confirm":
    "Confirmo que conozco a estas personas y entiendo que Caley Insurance podría contactarlas sobre opciones de seguro.",
  "ref.submit": "Generar mi ticket",
  "ref.submitting": "Generando ticket...",
  "ref.disclaimer":
    "No purchase required. Insurance purchase does not increase chances of winning.",
  "ref.block.incomplete":
    "Completa los 3 referidos con nombre y teléfono válido.",
  "ref.block.duplicate":
    "Los teléfonos no pueden repetirse ni coincidir con el tuyo.",
  "ref.block.confirm": "Confirma la casilla para continuar.",
  "ref.toast.error": "No pudimos generar tu ticket. Intenta de nuevo.",

  // Shared
  "common.loading": "Cargando...",
  "common.backHome": "Volver al inicio",

  // Thanks
  "thanks.notFound.title": "No encontramos tu registro",
  "thanks.notFound.body": "El enlace puede haber expirado.",
  "thanks.declined.title": "¡Gracias por registrarte!",
  "thanks.declined.body": "Disfruta el evento.",
  "thanks.title": "¡Listo, estás registrado!",
  "thanks.subtitle":
    "Gracias por acompañarnos en el evento de Caley Insurance, {name}.",
  "thanks.giveawayCallout":
    "Ahora puedes entrar al <strong>giveaway especial</strong> del evento.",
  "thanks.enterGiveaway": "Participar en el Giveaway",
  "thanks.notNow": "No por ahora",

  // Giveaway
  "giveaway.invalid.title": "Enlace inválido",
  "giveaway.hasTicket.title": "Ya tienes un ticket",
  "giveaway.hasTicket.number": "Tu número:",
  "giveaway.hasTicket.view": "Ver mi ticket",
  "giveaway.title": "Entra al Giveaway",
  "giveaway.subtitle":
    "Agrega 3 personas que podrían necesitar seguro y recibe tu número de ticket.",

  // Ticket
  "ticket.notFound.title": "No encontramos este ticket",
  "ticket.title": "¡Tu ticket está listo!",
  "ticket.subtitle":
    "Guarda este número. Lo usaremos para anunciar los ganadores durante el evento.",
  "ticket.copy": "Copiar número",
  "ticket.copied": "Número copiado",
  "ticket.copyError": "No pudimos copiar el número.",
  "ticket.disclaimer":
    "No purchase required. Insurance purchase does not increase chances of winning.",

  // Animated ticket
  "animTicket.brand": "Caley Hot Dog",
  "animTicket.giveaway": "Giveaway",
  "animTicket.label": "Número de ticket",
  "animTicket.keep": "Guarda este número",
  "animTicket.participant": "Participante:",
  "animTicket.eventDay": "Día del evento",

  // Hero ticket (landing visual)
  "hero.admitOne": "Admit One",
  "hero.prizeLabel": "Premio Especial",
  "hero.prizeTitle": "Giveaway del Evento",
  "hero.ticket": "Ticket",
};

const en: Messages = {
  // Layout / header
  "header.eventBadge": "Hot Dog Event",
  "lang.label": "Language",
  "lang.es": "ES",
  "lang.en": "EN",

  // Landing (index)
  "index.eyebrow": "Special event • Caley Insurance",
  "index.slogan": "Call Someone Special Today",
  "index.sloganAlt":
    "Call Someone Special Today — Caley Insurance slogan with glowing letters spelling CALEY",
  "index.intro":
    "Sign up, tell us which coverage you're interested in, and enter to win special event prizes.",
  "index.badgeQuick": "Takes less than 1 minute",
  "index.badgePrizes": "Event prizes",

  // Footer
  "footer.rights": "All rights reserved.",
  "footer.tagline": "Made with care for the Caley Hot Dog Event.",

  // Interests
  "interest.Carro": "Car",
  "interest.Casa": "Home",
  "interest.Comercial": "Commercial",
  "interest.Health": "Health",
  "interest.Boat": "Boat",

  // Lead form
  "lead.step": "Step 1 of 2",
  "lead.stepTitle": "Sign up",
  "lead.tag": "Secure · Fast",
  "lead.name": "Full name",
  "lead.namePlaceholder": "Your name",
  "lead.phone": "Phone",
  "lead.phonePlaceholder": "(787) 555-1234",
  "lead.email": "Email",
  "lead.emailPlaceholder": "you@email.com",
  "lead.interests": "Coverage of interest",
  "lead.consent":
    "I agree that Caley Insurance may contact me about insurance options related to my interests.",
  "lead.submit": "Continue",
  "lead.submitting": "Saving...",
  "lead.disclaimer":
    "No purchase required. Insurance purchase does not increase chances of winning.",
  "lead.err.name": "Name is required.",
  "lead.err.phone": "Enter a valid phone number.",
  "lead.err.email": "Enter a valid email.",
  "lead.err.interests": "Select at least one coverage.",
  "lead.err.consent": "You must accept the consent.",
  "lead.toast.exists": "Looks like you already registered. Taking you to the next step.",
  "lead.toast.error": "We couldn't save your registration. Please try again.",

  // Referral form
  "ref.progress": "{count}/3 referrals completed",
  "ref.step": "Step 2 of 2",
  "ref.row": "Referral {n}",
  "ref.name": "Name",
  "ref.namePlaceholder": "Full name",
  "ref.phone": "Phone",
  "ref.phonePlaceholder": "(787) 555-1234",
  "ref.confirm":
    "I confirm that I know these people and understand that Caley Insurance may contact them about insurance options.",
  "ref.submit": "Generate my ticket",
  "ref.submitting": "Generating ticket...",
  "ref.disclaimer":
    "No purchase required. Insurance purchase does not increase chances of winning.",
  "ref.block.incomplete": "Complete all 3 referrals with a name and valid phone.",
  "ref.block.duplicate": "Phone numbers can't repeat or match your own.",
  "ref.block.confirm": "Check the box to continue.",
  "ref.toast.error": "We couldn't generate your ticket. Please try again.",

  // Shared
  "common.loading": "Loading...",
  "common.backHome": "Back to home",

  // Thanks
  "thanks.notFound.title": "We couldn't find your registration",
  "thanks.notFound.body": "The link may have expired.",
  "thanks.declined.title": "Thanks for registering!",
  "thanks.declined.body": "Enjoy the event.",
  "thanks.title": "You're all set!",
  "thanks.subtitle": "Thanks for joining us at the Caley Insurance event, {name}.",
  "thanks.giveawayCallout":
    "You can now enter the event's <strong>special giveaway</strong>.",
  "thanks.enterGiveaway": "Enter the Giveaway",
  "thanks.notNow": "Not now",

  // Giveaway
  "giveaway.invalid.title": "Invalid link",
  "giveaway.hasTicket.title": "You already have a ticket",
  "giveaway.hasTicket.number": "Your number:",
  "giveaway.hasTicket.view": "View my ticket",
  "giveaway.title": "Enter the Giveaway",
  "giveaway.subtitle":
    "Add 3 people who might need insurance and get your ticket number.",

  // Ticket
  "ticket.notFound.title": "We couldn't find this ticket",
  "ticket.title": "Your ticket is ready!",
  "ticket.subtitle":
    "Save this number. We'll use it to announce the winners during the event.",
  "ticket.copy": "Copy number",
  "ticket.copied": "Number copied",
  "ticket.copyError": "We couldn't copy the number.",
  "ticket.disclaimer":
    "No purchase required. Insurance purchase does not increase chances of winning.",

  // Animated ticket
  "animTicket.brand": "Caley Hot Dog",
  "animTicket.giveaway": "Giveaway",
  "animTicket.label": "Ticket number",
  "animTicket.keep": "Save this number",
  "animTicket.participant": "Participant:",
  "animTicket.eventDay": "Event day",

  // Hero ticket (landing visual)
  "hero.admitOne": "Admit One",
  "hero.prizeLabel": "Special Prize",
  "hero.prizeTitle": "Event Giveaway",
  "hero.ticket": "Ticket",
};

const dictionaries: Record<Lang, Messages> = { es, en };

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match,
  );
}

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  t: TranslateFn;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "es" || stored === "en" ? stored : DEFAULT_LANG;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Initialize deterministically for SSR/first paint, then hydrate from storage.
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    setLangState(readStoredLang());
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "es" ? "en" : "es");
  }, [lang, setLang]);

  const t = useCallback<TranslateFn>(
    (key, vars) => {
      const table = dictionaries[lang];
      const template = table[key] ?? dictionaries.es[key] ?? key;
      return interpolate(template, vars);
    },
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, toggle, t }),
    [lang, setLang, toggle, t],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

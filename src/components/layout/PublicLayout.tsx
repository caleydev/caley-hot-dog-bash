import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Instagram, Ticket } from "lucide-react";
import logo from "@/assets/caley-logo.webp";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { FloatingHotdogs } from "@/components/ui/FloatingHotdogs";
import { useLanguage } from "@/lib/i18n";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      {/* Continuous hero atmosphere — slow drifting glows + top-fading grid */}
      <div aria-hidden className="hero-atmos" />
      <div aria-hidden className="hero-grid-fade" />
      <FloatingHotdogs />

      <header className="sticky top-0 z-20 px-4 pt-3">
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl pl-3 pr-3 py-1.5 border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]"
        >
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Caley Insurance" className="h-7 w-auto brightness-0 invert" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-md">
              <Ticket className="h-3 w-3 text-warm-orange" />
              {t("header.eventBadge")}
            </span>
            <LanguageToggle />
          </div>
        </motion.div>
      </header>

      <main className="flex-1 px-4 pb-16 pt-4">{children}</main>

      <footer className="relative z-10 border-t border-white/10 px-4 py-7">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="Caley Insurance"
              className="h-6 w-auto opacity-80 brightness-0 invert"
            />
            <span className="text-xs text-white/55">
              © {new Date().getFullYear()} Caley Insurance. {t("footer.rights")}
            </span>
          </div>
          <a
            href="https://www.instagram.com/caleyinsurance/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Caley Insurance on Instagram"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/85 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
          >
            <Instagram className="h-4 w-4 text-warm-orange" />
            @caleyinsurance
          </a>
        </div>
        <p className="mt-5 text-center text-[11px] text-white/35">
          {t("footer.tagline")}
        </p>
      </footer>
    </div>
  );
}
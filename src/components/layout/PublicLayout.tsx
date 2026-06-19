import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Ticket } from "lucide-react";
import logo from "@/assets/caley-logo.webp";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { FloatingHotdogs } from "@/components/ui/FloatingHotdogs";
import { useLanguage } from "@/lib/i18n";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="relative min-h-screen overflow-x-hidden">
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

      <main className="px-4 pb-16 pt-4">{children}</main>
    </div>
  );
}
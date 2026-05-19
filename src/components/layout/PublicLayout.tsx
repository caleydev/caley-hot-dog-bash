import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Ticket } from "lucide-react";
import logo from "@/assets/caley-logo.webp";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Continuous hero atmosphere — slow drifting glows + top-fading grid */}
      <div aria-hidden className="hero-atmos" />
      <div aria-hidden className="hero-grid-fade" />

      <header className="sticky top-0 z-20 px-4 pt-3">
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-auto flex max-w-md items-center justify-between rounded-full pl-2 pr-3 py-1.5 border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]"
        >
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Caley Insurance" className="h-7 w-auto brightness-0 invert" />
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
            <Ticket className="h-3 w-3 text-mustard" />
            Hot Dog Event
          </span>
        </motion.div>
      </header>

      <main className="px-4 pb-16 pt-4">{children}</main>
    </div>
  );
}
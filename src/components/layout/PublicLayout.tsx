import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Ticket } from "lucide-react";
import logo from "@/assets/caley-logo.webp";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Layered background — subtle navy depth + warm cream near form */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-caley-navy/15 blur-3xl animate-blob" />
        <div className="absolute top-1/4 -right-40 h-[26rem] w-[26rem] rounded-full bg-caley-sky/30 blur-3xl animate-blob" style={{ animationDelay: "-5s" }} />
        <div className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-mustard/15 blur-3xl animate-blob" style={{ animationDelay: "-9s" }} />
        {/* Faint grid */}
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: "linear-gradient(var(--caley-navy) 1px, transparent 1px), linear-gradient(90deg, var(--caley-navy) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }} />
      </div>

      <header className="sticky top-0 z-20 px-4 pt-3">
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-auto flex max-w-md items-center justify-between glass-strong rounded-full pl-2 pr-3 py-1.5"
        >
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Caley Insurance" className="h-7 w-auto" />
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-caley-navy/5 px-2.5 py-1 text-[11px] font-semibold text-caley-navy">
            <Ticket className="h-3 w-3 text-hotdog-red" />
            Hot Dog Event
          </span>
        </motion.div>
      </header>

      <main className="px-4 pb-16 pt-4">{children}</main>
    </div>
  );
}
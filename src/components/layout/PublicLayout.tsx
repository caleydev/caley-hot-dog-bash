import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import logo from "@/assets/caley-logo.webp";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Animated background blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-caley-blue/25 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-warm-orange/20 blur-3xl animate-blob" style={{ animationDelay: "-4s" }} />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-mustard/20 blur-3xl animate-blob" style={{ animationDelay: "-8s" }} />
      </div>

      <header className="sticky top-0 z-20 px-4 pt-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-auto flex max-w-3xl items-center justify-between glass rounded-full px-4 py-2"
        >
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Caley Insurance" className="h-8 w-auto" />
          </Link>
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
            Hot Dog Giveaway 🌭
          </span>
        </motion.div>
      </header>

      <main className="px-4 pb-16 pt-6">{children}</main>
    </div>
  );
}
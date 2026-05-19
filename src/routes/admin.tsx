import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAdmin, loginAdmin } from "@/lib/adminAuth";
import logo from "@/assets/caley-logo.webp";

export const Route = createFileRoute("/admin")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdmin()) navigate({ to: "/admin/dashboard" });
  }, [navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(code)) {
      navigate({ to: "/admin/dashboard" });
    } else {
      setError("Código incorrecto. Intenta de nuevo.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-caley-blue/25 blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-warm-orange/20 blur-3xl animate-blob" style={{ animationDelay: "-5s" }} />
      </div>
      <motion.form
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={submit}
        className="glass w-full max-w-sm rounded-3xl p-7 space-y-5"
      >
        <div className="text-center space-y-2">
          <img src={logo} alt="Caley Insurance" className="mx-auto h-10 w-auto" />
          <h1 className="text-xl font-bold">Caley Event Dashboard</h1>
          <p className="text-xs text-muted-foreground">Private access for Caley team.</p>
        </div>
        <div>
          <Label htmlFor="code">Access code</Label>
          <div className="mt-1.5 relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="code"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(""); }}
              placeholder="CALEY-HOTDOG-2026"
              className="h-11 pl-9"
              autoFocus
            />
          </div>
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
        <Button type="submit" className="h-11 w-full gradient-brand text-white">Enter Dashboard</Button>
        <p className="text-[10px] text-muted-foreground text-center">
          Demo mode. Replace with Supabase Auth before public deployment.
        </p>
      </motion.form>
    </div>
  );
}
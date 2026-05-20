import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  isAdmin,
  loginAdmin,
  loginAdminWithPassword,
} from "@/lib/adminAuth";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import logo from "@/assets/caley-logo.webp";

export const Route = createFileRoute("/admin")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isAdmin().then((allowed) => {
      if (allowed) navigate({ to: "/admin/dashboard" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isSupabaseConfigured) {
      const result = await loginAdminWithPassword(email, password);
      setLoading(false);
      if (result.ok) {
        navigate({ to: "/admin/dashboard" });
      } else {
        setError(result.error ?? "Unable to sign in.");
      }
      return;
    }

    const ok = await loginAdmin(code);
    setLoading(false);
    if (ok) {
      navigate({ to: "/admin/dashboard" });
    } else {
      setError("Incorrect access code. Try again.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-caley-blue/25 blur-3xl animate-blob" />
        <div
          className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-warm-orange/20 blur-3xl animate-blob"
          style={{ animationDelay: "-5s" }}
        />
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
          <p className="text-xs text-muted-foreground">
            Private access for Caley team.
          </p>
        </div>

        {isSupabaseConfigured ? (
          <>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="mt-1.5 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="admin@caley.com"
                  className="h-11 pl-9"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Your password"
                  className="h-11 pl-9"
                  autoComplete="current-password"
                />
              </div>
            </div>
          </>
        ) : (
          <div>
            <Label htmlFor="code">Access code</Label>
            <div className="mt-1.5 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                placeholder="CALEY-HOTDOG-2026"
                className="h-11 pl-9"
                autoFocus
              />
            </div>
          </div>
        )}

        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full gradient-brand text-white"
        >
          {loading ? "Signing in..." : "Enter Dashboard"}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          {isSupabaseConfigured
            ? "Secure Supabase Auth access for Caley HQ."
            : "Demo mode. Replace with Supabase Auth before public deployment."}
        </p>
      </motion.form>
    </div>
  );
}

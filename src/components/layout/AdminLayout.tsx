import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAdmin } from "@/lib/adminAuth";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import logo from "@/assets/caley-logo.webp";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-admin relative">
      <header className="sticky top-0 z-20 bg-card border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src={logo} alt="Caley Insurance" className="h-7 sm:h-9 w-auto flex-shrink-0" />
            <div className="border-l border-border pl-2 sm:pl-3 min-w-0">
              <div className="font-display text-[15px] font-bold text-caley-navy leading-tight tracking-tight">
                Hot Dog Event Dashboard
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                <span>Private access • Caley HQ</span>
                {isSupabaseConfigured && (
                  <span className="rounded-full border border-caley-blue/20 bg-caley-blue/8 px-2 py-0.5 text-[10px] text-caley-blue">
                    Live data
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-caley-navy/20 text-caley-navy hover:bg-caley-navy hover:text-white hover:border-caley-navy transition-colors flex-shrink-0 px-2 sm:px-3"
            onClick={async () => {
              await logoutAdmin();
              navigate({ to: "/admin" });
            }}
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

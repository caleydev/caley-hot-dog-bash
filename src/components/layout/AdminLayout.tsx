import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAdmin } from "@/lib/adminAuth";
import logo from "@/assets/caley-logo.webp";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-admin relative">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-caley-sky/25 blur-3xl" />
        <div className="absolute bottom-0 -left-32 h-[24rem] w-[24rem] rounded-full bg-caley-navy/10 blur-3xl" />
      </div>
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-xl border-b border-caley-navy/10 shadow-[0_1px_0_0_color-mix(in_oklab,var(--caley-navy)_6%,transparent)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Caley Insurance" className="h-9 w-auto" />
            <div className="hidden sm:block border-l border-border pl-3">
              <div className="text-[15px] font-bold text-caley-navy leading-tight">Hot Dog Event Dashboard</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Private access • Caley HQ</div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-caley-navy/20 text-caley-navy hover:bg-caley-navy hover:text-white hover:border-caley-navy transition-colors"
            onClick={() => {
              logoutAdmin();
              navigate({ to: "/admin" });
            }}
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
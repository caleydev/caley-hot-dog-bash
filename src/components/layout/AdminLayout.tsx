import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAdmin } from "@/lib/adminAuth";
import logo from "@/assets/caley-logo.webp";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 glass border-b border-white/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Caley Insurance" className="h-8 w-auto" />
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-foreground">Hot Dog Event Dashboard</div>
              <div className="text-xs text-muted-foreground">Private access · Caley HQ</div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
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
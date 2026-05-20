import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export const DEMO_ADMIN_CODE = "CALEY-HOTDOG-2026";
const KEY = "caley_admin_session";
const ADMIN_ROLES = new Set(["owner", "hq", "admin"]);

function setLocalAdminSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, "1");
}

function clearLocalAdminSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}

async function hasActiveAdminProfile(userId: string): Promise<boolean> {
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("role, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return false;
  return Boolean(data.is_active && ADMIN_ROLES.has(data.role));
}

export async function loginAdmin(code: string): Promise<boolean> {
  if (isSupabaseConfigured) return false;
  if (code.trim().toUpperCase() === DEMO_ADMIN_CODE) {
    setLocalAdminSession();
    return true;
  }
  return false;
}

export async function loginAdminWithPassword(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session?.user) {
    return { ok: false, error: error?.message || "Unable to sign in." };
  }

  const allowed = await hasActiveAdminProfile(data.session.user.id);
  if (!allowed) {
    await supabase.auth.signOut();
    return { ok: false, error: "You do not have admin access." };
  }

  clearLocalAdminSession();
  return { ok: true };
}

export async function isAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured) {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(KEY) === "1";
  }

  if (!supabase) return false;
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return false;

  const allowed = await hasActiveAdminProfile(session.user.id);
  if (!allowed) {
    await supabase.auth.signOut();
    return false;
  }

  return true;
}

export async function logoutAdmin(): Promise<void> {
  clearLocalAdminSession();
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
}

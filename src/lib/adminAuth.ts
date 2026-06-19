import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

// Demo access code — ONLY used in local/dev when Supabase is not configured.
// At the live event, Supabase is configured, so this code is inactive.
export const DEMO_ADMIN_CODE = "CALEY-HOTDOG-2026";
const KEY = "caley_admin_session";

function setLocalAdminSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, "1");
}

function clearLocalAdminSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
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

  // Any account that can sign in to this project's Supabase Auth is an admin.
  // Keep the project's user list limited to Caley staff.
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

  return Boolean(session?.user);
}

export async function logoutAdmin(): Promise<void> {
  clearLocalAdminSession();
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
}

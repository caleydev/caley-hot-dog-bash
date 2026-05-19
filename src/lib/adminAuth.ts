// DEMO ONLY admin gate. Replace with Supabase Auth or a server-side
// verification endpoint before deploying for a real event.
export const DEMO_ADMIN_CODE = "CALEY-HOTDOG-2026";
const KEY = "caley_admin_session";

export function loginAdmin(code: string): boolean {
  if (code.trim().toUpperCase() === DEMO_ADMIN_CODE) {
    sessionStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}
export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(KEY) === "1";
}
export function logoutAdmin(): void {
  sessionStorage.removeItem(KEY);
}
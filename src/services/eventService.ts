import { hasSupabase } from "@/lib/supabaseClient";
import { localEventAdapter } from "./adapters/localEventAdapter";
// import { supabaseEventAdapter } from "./adapters/supabaseEventAdapter";

// When Supabase is enabled, swap adapters here. The shape is identical.
export const eventService = hasSupabase ? localEventAdapter : localEventAdapter;
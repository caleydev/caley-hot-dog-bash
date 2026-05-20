import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { localEventAdapter } from "./adapters/localEventAdapter";
import { supabaseEventAdapter } from "./adapters/supabaseEventAdapter";

export const eventService = isSupabaseConfigured
  ? supabaseEventAdapter
  : localEventAdapter;

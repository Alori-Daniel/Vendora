import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

import { appEnv, getMissingSupabaseConfigMessage, hasSupabaseConfig } from "@/lib/env";
import type { Database } from "@/types/supabase";

let supabaseClient: SupabaseClient<Database> | null = null;

if (hasSupabaseConfig) {
  supabaseClient = createClient<Database>(
    appEnv.supabaseUrl,
    appEnv.supabaseAnonKey,
    {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    },
  );
}

export const supabase = supabaseClient;

export function getSupabaseClient() {
  if (!supabaseClient) {
    throw new Error(getMissingSupabaseConfigMessage());
  }

  return supabaseClient;
}

const trim = (value: string | undefined) => value?.trim() ?? "";

export const appEnv = {
  supabaseUrl: trim(process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: trim(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  revenueCatIosApiKey: trim(process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY),
  revenueCatAndroidApiKey: trim(
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
  ),
  revenueCatEntitlementId: trim(
    process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID,
  ),
  revenueCatOfferingId: trim(process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID),
};

export const hasSupabaseConfig = Boolean(
  appEnv.supabaseUrl && appEnv.supabaseAnonKey,
);

export const hasRevenueCatConfig = Boolean(
  appEnv.revenueCatEntitlementId &&
    (appEnv.revenueCatIosApiKey || appEnv.revenueCatAndroidApiKey),
);

export function getMissingSupabaseConfigMessage() {
  return "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.";
}

export function getMissingRevenueCatConfigMessage() {
  return "Missing RevenueCat API keys or entitlement id in .env.";
}

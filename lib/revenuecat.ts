import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";
import Purchases, {
  type CustomerInfo,
  type PurchasesOfferings,
  type PurchasesPackage,
} from "react-native-purchases";

import {
  appEnv,
  getMissingRevenueCatConfigMessage,
  hasRevenueCatConfig,
} from "@/lib/env";

type RevenueCatSupport = {
  supported: boolean;
  reason?: string;
};

let isConfigured = false;

function getPlatformApiKey() {
  if (Platform.OS === "ios") {
    return appEnv.revenueCatIosApiKey;
  }

  if (Platform.OS === "android") {
    return appEnv.revenueCatAndroidApiKey;
  }

  return "";
}

export function getRevenueCatSupport() {
  if (Platform.OS === "web") {
    return {
      supported: false,
      reason: "RevenueCat is not available on web builds.",
    } satisfies RevenueCatSupport;
  }

  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return {
      supported: false,
      reason: "RevenueCat requires an Expo development build or a store build, not Expo Go.",
    } satisfies RevenueCatSupport;
  }

  if (!hasRevenueCatConfig || !getPlatformApiKey()) {
    return {
      supported: false,
      reason: getMissingRevenueCatConfigMessage(),
    } satisfies RevenueCatSupport;
  }

  return { supported: true } satisfies RevenueCatSupport;
}

async function ensureConfigured(appUserId?: string) {
  const support = getRevenueCatSupport();

  if (!support.supported) {
    return support;
  }

  if (!isConfigured) {
    await Purchases.setLogLevel(
      __DEV__ ? Purchases.LOG_LEVEL.DEBUG : Purchases.LOG_LEVEL.INFO,
    );
    Purchases.configure({
      apiKey: getPlatformApiKey(),
      appUserID: appUserId,
    });
    isConfigured = true;
  }

  return support;
}

export async function syncRevenueCatIdentity(appUserId?: string | null) {
  const support = await ensureConfigured(appUserId ?? undefined);

  if (!support.supported) {
    return support;
  }

  if (!appUserId) {
    if (isConfigured) {
      await Purchases.logOut();
    }

    return support;
  }

  await Purchases.logIn(appUserId);
  return support;
}

export async function getRevenueCatOfferings() {
  const support = await ensureConfigured();

  if (!support.supported) {
    return null;
  }

  return Purchases.getOfferings();
}

export async function getRevenueCatCustomerInfo() {
  const support = await ensureConfigured();

  if (!support.supported) {
    return null;
  }

  return Purchases.getCustomerInfo();
}

export async function purchaseRevenueCatPackage(aPackage: PurchasesPackage) {
  const support = await ensureConfigured();

  if (!support.supported) {
    throw new Error(support.reason);
  }

  return Purchases.purchasePackage(aPackage);
}

export async function restoreRevenueCatPurchases() {
  const support = await ensureConfigured();

  if (!support.supported) {
    throw new Error(support.reason);
  }

  return Purchases.restorePurchases();
}

export function hasActiveRevenueCatEntitlement(customerInfo?: CustomerInfo | null) {
  if (!customerInfo) {
    return false;
  }

  if (appEnv.revenueCatEntitlementId) {
    return Boolean(
      customerInfo.entitlements.active[appEnv.revenueCatEntitlementId],
    );
  }

  return Object.keys(customerInfo.entitlements.active).length > 0;
}

export type { CustomerInfo, PurchasesOfferings, PurchasesPackage };

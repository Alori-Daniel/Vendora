export const recommendedBusinessCategories = [
  "Fashion vendor",
  "Cake and food vendor",
  "Beauty and perfume vendor",
  "Thrift seller",
  "Phone accessory seller",
] as const;

export type RecommendedBusinessCategory =
  (typeof recommendedBusinessCategories)[number];

export const idealFirstNicheLabel = "Instagram + WhatsApp product sellers";

export const subscriptionUpgradePoints = [
  "Branded invoice templates",
  "Monthly reports and exports",
  "Payment reminders for unpaid orders",
  "RevenueCat-managed subscription access",
] as const;

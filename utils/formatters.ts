const defaultLocale = "en-NG";

export function formatCurrency(amount: number, currency = "NGN") {
  return new Intl.NumberFormat(defaultLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat(defaultLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat(defaultLocale, {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export function humanizeLabel(value: string) {
  return value.replace(/_/g, " ");
}

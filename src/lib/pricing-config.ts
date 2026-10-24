/**
 * Registration pricing. Change fees, GST rate, or the early-bird cut-off here.
 * Amounts are placeholders pending final approval from the organising
 * committee — this file is the only place they need to be updated.
 */
export const REGISTRATION_PRICING = {
  currency: "INR",
  gstRate: 0.18,
  earlyBirdDeadline: "2026-10-31T23:59:59+05:30",
  categories: [
    {
      value: "scientist-faculty",
      label: "Scientist / Faculty",
      earlyBirdFee: 4000,
      regularFee: 5000,
    },
    {
      value: "phd-scholar",
      label: "PhD Scholar",
      earlyBirdFee: 2500,
      regularFee: 3000,
    },
    {
      value: "mtech-student",
      label: "MTech Student",
      earlyBirdFee: 2000,
      regularFee: 2500,
    },
    {
      value: "ug-student",
      label: "UG Student",
      earlyBirdFee: 1500,
      regularFee: 2000,
    },
  ],
} as const;

export type PricingCategory =
  (typeof REGISTRATION_PRICING.categories)[number];

export const findPricingCategory = (
  value: string,
): PricingCategory | undefined =>
  REGISTRATION_PRICING.categories.find((category) => category.value === value);

export const isEarlyBird = (now: Date = new Date()): boolean =>
  now.getTime() <= new Date(REGISTRATION_PRICING.earlyBirdDeadline).getTime();

export const calculateFees = (
  category: PricingCategory,
  earlyBird: boolean,
): { base: number; gst: number; total: number } => {
  const base = earlyBird ? category.earlyBirdFee : category.regularFee;
  const gst = Math.round(base * REGISTRATION_PRICING.gstRate);

  return { base, gst, total: base + gst };
};

export const formatInr = (amount: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: REGISTRATION_PRICING.currency,
    maximumFractionDigits: 0,
  }).format(amount);

export const formatEarlyBirdDeadline = (): string =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(REGISTRATION_PRICING.earlyBirdDeadline));

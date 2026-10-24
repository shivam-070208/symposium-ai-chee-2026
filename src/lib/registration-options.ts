import { REGISTRATION_PRICING } from "./pricing-config";

/**
 * Categories shown in the registration form. They mirror the pricing config so
 * a fee change never leaves the category list out of sync. Values are stored
 * as-is in participants.category.
 */
export const REGISTRATION_CATEGORIES = REGISTRATION_PRICING.categories.map(
  (category) => ({
    value: category.value,
    label: category.label,
  }),
);

export type RegistrationCategoryValue =
  (typeof REGISTRATION_PRICING.categories)[number]["value"];

export const findRegistrationCategory = (value: string) =>
  REGISTRATION_CATEGORIES.find((category) => category.value === value);

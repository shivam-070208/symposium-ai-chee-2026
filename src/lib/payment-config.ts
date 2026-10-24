/**
 * Manual bank-transfer details shown in the "Review Before Payment" section.
 *
 * These are placeholder values for development. Replace every field with the
 * organiser-confirmed account before launch — nothing here is a real account.
 */
export const PAYMENT_CONFIG = {
  enabled: true,
  currency: "INR",
  bankName: "State Bank of India",
  accountName: "AI-CHHE 2026 — NIT Patna",
  accountNumber: "0000000000000000",
  address: "NIT Patna — 800005, Bihar",
  branchCode: "0000",
  ifsc: "SBIN0000000",
  micr: "000000000",
  swift: "SBININBB000",
  contactPhone: "(0000) 000000",
  contactEmail: "registration@example.com",
  referenceNote: "Use your registration reference as the payment reference.",
  // Optional instruction sheet the delegate can download (PDF in /public).
  instructionPdfPath: "",
} as const;

export type PaymentConfig = typeof PAYMENT_CONFIG;

export const hasPaymentDetails = (config: PaymentConfig): boolean =>
  config.enabled &&
  Boolean(config.accountName && config.bankName && config.accountNumber);

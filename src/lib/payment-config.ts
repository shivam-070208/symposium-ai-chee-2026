/**
 * Manual bank-transfer details shown in the "Review Before Payment" section.
 *
 * These are placeholder values for development. Replace every field with the
 * organiser-confirmed account before launch — nothing here is a real account.
 */
export const PAYMENT_CONFIG = {
  enabled: true,
  currency: "INR",
  bankName: "Indian Bank",
  accountName: "NIT Patna CFD Account",
  accountNumber: "50433562364",
  address: "NIT Patna — 800005, Bihar",
  branchCode: "810",
  ifsc: "IDIB000B810",
  micr: "000000000",
  swift: "IDIBINBB000",
  contactPhone: "+91-7978848747",
  contactEmail: "bsd.ce@nitp.ac.in",
  referenceNote: "Use your registration reference as the payment reference.",
  instructionPdfPath: "",
} as const;

export type PaymentConfig = typeof PAYMENT_CONFIG;

export const hasPaymentDetails = (config: PaymentConfig): boolean =>
  config.enabled &&
  Boolean(config.accountName && config.bankName && config.accountNumber);

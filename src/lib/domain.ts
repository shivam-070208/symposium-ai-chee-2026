// Provisional status sets: stored as VARCHAR, so expanding them needs no
// migration. Final values require organizer approval (spec §17).

export const REGISTRATION_STATUSES = ["pending_payment", "confirmed", "cancelled"] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const PAYMENT_STATUSES = ["submitted", "verified", "rejected"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const ABSTRACT_STATUSES = [
  "submitted",
  "under_review",
  "revision_requested",
  "accepted",
  "rejected",
] as const;
export type AbstractStatus = (typeof ABSTRACT_STATUSES)[number];

export const ABSTRACT_DECISIONS = ["revision_requested", "accepted", "rejected"] as const;
export type AbstractDecision = (typeof ABSTRACT_DECISIONS)[number];

export const EMAIL_OUTBOX_STATUSES = ["pending", "sent", "failed"] as const;
export type EmailOutboxStatus = (typeof EMAIL_OUTBOX_STATUSES)[number];

export const AUDIT_ACTOR_TYPES = ["env_admin"] as const;
export type AuditActorType = (typeof AUDIT_ACTOR_TYPES)[number];

export const MAX_PAGE_SIZE = 100;

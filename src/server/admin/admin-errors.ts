export type AdminActionFailure =
  | "not_found"
  | "invalid_state"
  | "configuration";

export class AdminActionError extends Error {
  readonly reason: AdminActionFailure;

  constructor(reason: AdminActionFailure, message: string) {
    super(message);
    this.name = "AdminActionError";
    this.reason = reason;
  }
}

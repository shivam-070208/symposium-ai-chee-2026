export type AttendeeActionFailure = "not_found" | "locked" | "configuration";

export class AttendeeActionError extends Error {
  readonly reason: AttendeeActionFailure;

  constructor(reason: AttendeeActionFailure, message: string) {
    super(message);
    this.name = "AttendeeActionError";
    this.reason = reason;
  }
}

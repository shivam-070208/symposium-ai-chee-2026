// Provisional designation options for registration step 1. Stored as free text
// in participants.designation, so expanding this list needs no migration.
// Final options require organizer approval (spec §17).
export const DESIGNATION_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "research-scholar", label: "Research scholar" },
  { value: "faculty", label: "Faculty" },
  { value: "industry", label: "Industry professional" },
  { value: "government", label: "Government / public sector" },
  { value: "other", label: "Other" },
] as const;

export type DesignationOptionValue =
  (typeof DESIGNATION_OPTIONS)[number]["value"];

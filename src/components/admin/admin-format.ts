import { cn } from "cn";
import { findPricingCategory } from "@/lib/pricing-config";

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export const formatAdminDateTime = (value?: Date | string | null): string =>
  value ? `${dateTimeFormatter.format(new Date(value))} UTC` : "—";

export const formatAdminDate = (value?: Date | string | null): string =>
  value ? dateFormatter.format(new Date(value)) : "—";

export const formatAdminCategory = (category: string): string =>
  findPricingCategory(category)?.label ??
  category.replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const formatAdminIntent = (wants: boolean): string =>
  wants ? "Yes" : "No";

export const adminStatusClasses = (status: string): string => {
  const styles: Record<string, string> = {
    confirmed: "border-success/20 bg-success/10 text-success",
    verified: "border-success/20 bg-success/10 text-success",
    accepted: "border-success/20 bg-success/10 text-success",
    sent: "border-success/20 bg-success/10 text-success",
    pending_payment: "border-royal/20 bg-ice text-royal",
    submitted: "border-royal/20 bg-ice text-royal",
    revision_requested: "border-royal/20 bg-ice text-royal",
    pending: "border-royal/20 bg-ice text-royal",
    cancelled: "border-errorred/20 bg-errorred/10 text-errorred",
    rejected: "border-errorred/20 bg-errorred/10 text-errorred",
    failed: "border-errorred/20 bg-errorred/10 text-errorred",
  };

  return cn(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-medium capitalize",
    styles[status] ?? "border-line bg-canvas text-mist",
  );
};

export const adminStatusLabel = (status: string): string =>
  status.replaceAll("_", " ");

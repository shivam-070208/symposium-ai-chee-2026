"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatInr } from "@/lib/pricing-config";
import { trpc } from "@/lib/trpc";
import { AdminEmpty } from "./admin-empty";
import {
  formatAdminCategory,
  formatAdminDateTime,
  formatAdminIntent,
} from "./admin-format";
import { AdminStatusBadge } from "./admin-status-badge";
import { AdminStatusUpdateForm } from "./admin-status-update-form";

type AdminRegistrationDetailProps = {
  readonly registrationId: number;
};

const money = (value: string | null): string =>
  value ? formatInr(Number(value)) : "—";

const DetailRow = ({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) => (
  <div className="flex items-baseline justify-between gap-4">
    <dt className="shrink-0 text-mist">{label}</dt>
    <dd className="break-words text-right font-medium text-navy">{value}</dd>
  </div>
);

export const AdminRegistrationDetail = ({
  registrationId,
}: AdminRegistrationDetailProps) => {
  const detail = trpc.admin.registrations.byId.useQuery({ registrationId });

  if (detail.isLoading) {
    return (
      <div className="rounded-xl border border-line bg-white px-5 py-10 text-center text-[13px] text-mist">
        Loading registration…
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <div className="rounded-xl border border-errorred/20 bg-errorred/5 px-5 py-4 text-[13px] text-errorred">
        Could not load this registration.
      </div>
    );
  }

  const { registration, participant, payments, abstracts, emails } = detail.data;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/registrations"
        className="inline-flex items-center gap-2 text-[13px] font-medium text-royal hover:text-navy"
      >
        <ArrowLeft className="size-4" />
        All registrations
      </Link>

      <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-royal">
            Registration
          </p>
          <h1 className="mt-2 text-[28px] font-bold tracking-[-0.03em] tabular-nums text-navy">
            {registration.reference}
          </h1>
          <p className="mt-1.5 text-[13px] text-mist">
            Submitted {formatAdminDateTime(registration.submittedAt)}
          </p>
        </div>
        <AdminStatusBadge status={registration.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[15px] font-semibold text-navy">Participant</h2>
          <dl className="mt-3 space-y-2 text-[13px]">
            <DetailRow label="Name" value={participant.fullName} />
            <DetailRow label="Email" value={participant.email} />
            <DetailRow label="Phone" value={participant.phone ?? "—"} />
            <DetailRow label="Institution" value={participant.institution ?? "—"} />
            <DetailRow label="Department" value={participant.department ?? "—"} />
            <DetailRow label="Designation" value={participant.designation ?? "—"} />
          </dl>
        </section>

        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[15px] font-semibold text-navy">Registration</h2>
          <dl className="mt-3 space-y-2 text-[13px]">
            <DetailRow label="Category" value={formatAdminCategory(registration.category)} />
            <DetailRow
              label="Abstract intent"
              value={formatAdminIntent(registration.wantsAbstractSubmission)}
            />
            <DetailRow label="Base fee" value={money(registration.baseAmount)} />
            <DetailRow label="GST" value={money(registration.taxAmount)} />
            <DetailRow label="Total" value={money(registration.totalAmount)} />
          </dl>
        </section>
      </div>

      <AdminStatusUpdateForm
        registrationId={registrationId}
        currentStatus={registration.status}
      />

      <section className="rounded-xl border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold text-navy">Payments</h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-5">
            <AdminEmpty
              message="No payment recorded"
              detail="Payment proof is verified manually. Confirm the registration once the bank transfer is checked."
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-col gap-1 px-5 py-3.5 text-[13px] sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-bodytext">
                  #{payment.id} · {money(payment.expectedAmount)}
                  {payment.transactionReference
                    ? ` · ${payment.transactionReference}`
                    : ""}
                </span>
                <AdminStatusBadge status={payment.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold text-navy">Emails</h2>
        </div>
        {emails.length === 0 ? (
          <div className="p-5">
            <AdminEmpty message="No emails yet" />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {emails.map((email) => (
              <li
                key={email.id}
                className="flex flex-col gap-1 px-5 py-3.5 text-[13px] sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-bodytext">
                  {email.templateKey} · {formatAdminDateTime(email.createdAt)} ·{" "}
                  {email.attempts} attempt{email.attempts === 1 ? "" : "s"}
                </span>
                <AdminStatusBadge status={email.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {abstracts.length > 0 ? (
        <section className="rounded-xl border border-line bg-white">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[15px] font-semibold text-navy">Abstracts</h2>
          </div>
          <ul className="divide-y divide-line">
            {abstracts.map((abstract) => (
              <li
                key={abstract.id}
                className="flex flex-col gap-1 px-5 py-3.5 text-[13px] sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-bodytext">
                  {abstract.title}
                  {abstract.themeName ? ` · ${abstract.themeName}` : ""}
                </span>
                <AdminStatusBadge status={abstract.status} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};

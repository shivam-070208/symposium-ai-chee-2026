"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Lock,
  Pencil,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { findPricingCategory, formatInr } from "@/lib/pricing-config";
import { trpc } from "@/lib/trpc";
import {
  attendeePaymentFormSchema,
  attendeeProfileFormSchema,
  type AttendeePaymentFormValues,
  type AttendeeProfileFormValues,
} from "@/server/validation/attendee.schema";

type StatusMeta = {
  readonly label: string;
  readonly classes: string;
};

const REGISTRATION_STATUS: Record<string, StatusMeta> = {
  pending_payment: {
    label: "Pending payment",
    classes: "border-royal/20 bg-ice text-royal",
  },
  confirmed: {
    label: "Confirmed",
    classes: "border-success/20 bg-success/10 text-success",
  },
  cancelled: {
    label: "Cancelled",
    classes: "border-errorred/20 bg-errorred/10 text-errorred",
  },
};

const PAYMENT_STATUS: Record<string, StatusMeta> = {
  submitted: {
    label: "Submitted",
    classes: "border-royal/20 bg-ice text-royal",
  },
  verified: {
    label: "Verified",
    classes: "border-success/20 bg-success/10 text-success",
  },
  rejected: {
    label: "Needs attention",
    classes: "border-errorred/20 bg-errorred/10 text-errorred",
  },
};

const ABSTRACT_STATUS: Record<string, StatusMeta> = {
  submitted: {
    label: "Submitted",
    classes: "border-royal/20 bg-ice text-royal",
  },
  under_review: {
    label: "Under review",
    classes: "border-royal/20 bg-ice text-royal",
  },
  revision_requested: {
    label: "Revision requested",
    classes: "border-royal/20 bg-ice text-royal",
  },
  accepted: {
    label: "Accepted",
    classes: "border-success/20 bg-success/10 text-success",
  },
  rejected: {
    label: "Not accepted",
    classes: "border-errorred/20 bg-errorred/10 text-errorred",
  },
};

const STATUS_FALLBACK: StatusMeta = {
  label: "—",
  classes: "border-line bg-canvas text-mist",
};

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const timelineFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

const formatDay = (value: Date | string): string =>
  dayFormat.format(new Date(value));

const formatTimelineMoment = (value: Date | string): string =>
  timelineFormat.format(new Date(value));

const toDateInputValue = (value: Date): string =>
  value.toISOString().slice(0, 10);

const INPUT_CLASS =
  "mt-2 h-[44px] w-full rounded-lg border border-line bg-white px-3 text-[14px] text-navy outline-none transition-colors placeholder:text-mist focus:border-royal focus:ring-2 focus:ring-royal/15 aria-[invalid=true]:border-errorred";

const LABEL_CLASS = "text-[14px] font-medium text-navy";

const CARD_CLASS = "rounded-2xl border border-line bg-white p-5 sm:p-6";

const CARD_TITLE_CLASS = "text-[15px] font-semibold text-navy";

const EM_DASH = "—";

const EMPTY_PROFILE: AttendeeProfileFormValues = {
  fullName: "",
  phone: "",
  institution: "",
  department: "",
  designation: "",
};

const EMPTY_PAYMENT: AttendeePaymentFormValues = {
  transactionReference: "",
  reportedPaymentDate: "",
};

type StatusBadgeProps = {
  readonly meta: StatusMeta;
};

const StatusBadge = ({ meta }: StatusBadgeProps) => (
  <span
    className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${meta.classes}`}
  >
    {meta.label}
  </span>
);

type DetailRowProps = {
  readonly label: string;
  readonly value: string;
};

const DetailRow = ({ label, value }: DetailRowProps) => (
  <div className="flex items-baseline justify-between gap-4">
    <dt className="shrink-0 text-mist">{label}</dt>
    <dd className="break-words text-right font-medium text-navy">{value}</dd>
  </div>
);

type FormFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly optional?: boolean;
  readonly error?: string | undefined;
  readonly children: ReactNode;
};

const FormField = ({
  id,
  label,
  optional = false,
  error,
  children,
}: FormFieldProps) => (
  <div>
    <label htmlFor={id} className={LABEL_CLASS}>
      {label}
      {optional ? (
        <span className="text-[12px] font-normal text-mist"> (Optional)</span>
      ) : null}
    </label>
    {children}
    {error ? (
      <p role="alert" className="mt-1.5 text-[12px] text-errorred">
        {error}
      </p>
    ) : null}
  </div>
);

type AccessPageProps = {
  readonly token: string;
};

export const AccessPage = ({ token }: AccessPageProps) => {
  const dashboard = trpc.attendee.dashboard.useQuery({ token });
  const utils = trpc.useUtils();

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [paymentSaved, setPaymentSaved] = useState(false);

  const updateProfile = trpc.attendee.updateProfile.useMutation({
    onSuccess: () => {
      setEditingProfile(false);
      setProfileSaved(true);
      void utils.attendee.dashboard.invalidate({ token });
    },
  });

  const updatePayment = trpc.attendee.updatePayment.useMutation({
    onSuccess: () => {
      setEditingPayment(false);
      setPaymentSaved(true);
      void utils.attendee.dashboard.invalidate({ token });
    },
  });

  const profileForm = useForm<AttendeeProfileFormValues>({
    resolver: zodResolver(attendeeProfileFormSchema),
    defaultValues: EMPTY_PROFILE,
    mode: "onTouched",
  });

  const paymentForm = useForm<AttendeePaymentFormValues>({
    resolver: zodResolver(attendeePaymentFormSchema),
    defaultValues: EMPTY_PAYMENT,
    mode: "onTouched",
  });

  const startProfileEdit = () => {
    const profile = dashboard.data?.profile;

    if (!profile) {
      return;
    }

    profileForm.reset({
      fullName: profile.fullName,
      phone: profile.phone ?? "",
      institution: profile.institution ?? "",
      department: profile.department ?? "",
      designation: profile.designation ?? "",
    });
    updateProfile.reset();
    setProfileSaved(false);
    setEditingProfile(true);
  };

  const startPaymentEdit = () => {
    const payment = dashboard.data?.payment;

    paymentForm.reset({
      transactionReference: payment?.transactionReference ?? "",
      reportedPaymentDate: payment?.reportedPaymentDate
        ? toDateInputValue(payment.reportedPaymentDate)
        : "",
    });
    updatePayment.reset();
    setPaymentSaved(false);
    setEditingPayment(true);
  };

  const cancelProfileEdit = () => {
    updateProfile.reset();
    setEditingProfile(false);
  };

  const cancelPaymentEdit = () => {
    updatePayment.reset();
    setEditingPayment(false);
  };

  const submitProfile = profileForm.handleSubmit((values) => {
    updateProfile.mutate({ token, ...values });
  });

  const submitPayment = paymentForm.handleSubmit((values) => {
    updatePayment.mutate({ token, ...values });
  });

  if (dashboard.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="rounded-2xl border border-line bg-white px-5 py-12 text-center text-[13px] text-mist">
          Opening your registration view…
        </div>
      </div>
    );
  }

  if (dashboard.isError || !dashboard.data) {
    return (
      <div className="mx-auto w-full max-w-[640px] px-5 py-12 sm:py-16">
        <div className="rounded-2xl border border-line bg-white p-8 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-ice text-royal">
            <Lock className="size-5" />
          </span>
          <h1 className="mt-4 text-[22px] font-bold tracking-[-0.02em] text-navy">
            This link is no longer valid
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-bodytext">
            Access links are refreshed whenever your registration status
            changes. Open the link in your most recent email, or contact the
            organisers if you need help.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">
              Back to the symposium site
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { profile, registration, payment, abstract, timeline, canEdit } =
    dashboard.data;

  const registrationMeta =
    REGISTRATION_STATUS[registration.status] ?? STATUS_FALLBACK;
  const categoryLabel =
    findPricingCategory(profile.category)?.label ?? profile.category;

  const noticeClasses = canEdit
    ? "border-royal/20 bg-ice text-royal"
    : registration.status === "confirmed"
      ? "border-success/20 bg-success/10 text-success"
      : "border-errorred/20 bg-errorred/10 text-errorred";

  const noticeText = canEdit
    ? "Your registration is still open — you can update your personal details and payment information below. These details lock as soon as the registration is confirmed."
    : registration.status === "confirmed"
      ? "This registration is confirmed, so personal details and payment information are locked. Contact the organisers for any change."
      : "This registration was cancelled, so its details are locked. Contact the organisers if you need help.";

  const verificationText =
    payment?.status === "verified"
      ? payment.verifiedAt
        ? `Verified on ${formatDay(payment.verifiedAt)}`
        : "Verified"
      : payment?.status === "rejected"
        ? "Not verified — please resubmit"
        : "Awaiting verification";

  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-6 px-5 py-10 sm:px-8 sm:py-14">
      <section className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-royal">
              Private registration view
            </p>
            <h1 className="mt-2 text-[30px] font-bold tracking-[-0.03em] tabular-nums text-navy">
              {registration.reference}
            </h1>
            <p className="mt-1.5 text-[13px] text-mist">
              {profile.fullName} · {profile.email}
            </p>
          </div>
          <StatusBadge meta={registrationMeta} />
        </div>

        <div
          className={`mt-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px] leading-relaxed ${noticeClasses}`}
        >
          {canEdit ? (
            <Pencil className="mt-0.5 size-4 shrink-0" />
          ) : (
            <Lock className="mt-0.5 size-4 shrink-0" />
          )}
          <p>{noticeText}</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className={`${CARD_CLASS} lg:col-span-2`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className={CARD_TITLE_CLASS}>Personal details</h2>
            {canEdit && !editingProfile ? (
              <Button variant="outline" size="sm" onClick={startProfileEdit}>
                <Pencil className="size-3.5" />
                Edit
              </Button>
            ) : null}
          </div>

          {profileSaved && !editingProfile ? (
            <p className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-success">
              <CheckCircle2 className="size-4" />
              Personal details updated.
            </p>
          ) : null}

          {editingProfile ? (
            <form onSubmit={submitProfile} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField
                    id="access-full-name"
                    label="Full Name"
                    error={profileForm.formState.errors.fullName?.message}
                  >
                    <input
                      id="access-full-name"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      aria-invalid={Boolean(
                        profileForm.formState.errors.fullName,
                      )}
                      className={INPUT_CLASS}
                      {...profileForm.register("fullName")}
                    />
                  </FormField>
                </div>
                <FormField
                  id="access-phone"
                  label="Phone Number"
                  optional
                  error={profileForm.formState.errors.phone?.message}
                >
                  <input
                    id="access-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Enter your phone number"
                    aria-invalid={Boolean(profileForm.formState.errors.phone)}
                    className={INPUT_CLASS}
                    {...profileForm.register("phone")}
                  />
                </FormField>
                <FormField
                  id="access-institution"
                  label="Institution / Organisation"
                  optional
                  error={profileForm.formState.errors.institution?.message}
                >
                  <input
                    id="access-institution"
                    autoComplete="organization"
                    placeholder="Enter your institution"
                    aria-invalid={Boolean(
                      profileForm.formState.errors.institution,
                    )}
                    className={INPUT_CLASS}
                    {...profileForm.register("institution")}
                  />
                </FormField>
                <FormField
                  id="access-department"
                  label="Department"
                  optional
                  error={profileForm.formState.errors.department?.message}
                >
                  <input
                    id="access-department"
                    placeholder="Enter your department"
                    aria-invalid={Boolean(
                      profileForm.formState.errors.department,
                    )}
                    className={INPUT_CLASS}
                    {...profileForm.register("department")}
                  />
                </FormField>
                <FormField
                  id="access-designation"
                  label="Designation"
                  optional
                  error={profileForm.formState.errors.designation?.message}
                >
                  <input
                    id="access-designation"
                    placeholder="Enter your designation"
                    aria-invalid={Boolean(
                      profileForm.formState.errors.designation,
                    )}
                    className={INPUT_CLASS}
                    {...profileForm.register("designation")}
                  />
                </FormField>
              </div>

              {updateProfile.isError ? (
                <p role="alert" className="text-[13px] text-errorred">
                  {updateProfile.error.message}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save details
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelProfileEdit}
                  disabled={updateProfile.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <dl className="mt-4 grid gap-x-8 gap-y-2.5 text-[13px] sm:grid-cols-2">
              <DetailRow label="Full name" value={profile.fullName} />
              <DetailRow label="Email" value={profile.email} />
              <DetailRow label="Phone" value={profile.phone ?? EM_DASH} />
              <DetailRow
                label="Institution"
                value={profile.institution ?? EM_DASH}
              />
              <DetailRow
                label="Department"
                value={profile.department ?? EM_DASH}
              />
              <DetailRow
                label="Designation"
                value={profile.designation ?? EM_DASH}
              />
            </dl>
          )}
        </section>

        <section className={CARD_CLASS}>
          <h2 className={CARD_TITLE_CLASS}>Registration</h2>
          <dl className="mt-4 space-y-2.5 text-[13px]">
            <DetailRow label="Status" value={registrationMeta.label} />
            <DetailRow label="Category" value={categoryLabel} />
            <DetailRow
              label="Submitted"
              value={formatDay(registration.createdAt)}
            />
            <DetailRow
              label="Abstract intent"
              value={registration.wantsAbstractSubmission ? "Yes" : "No"}
            />
          </dl>
        </section>
      </div>

      <section className={CARD_CLASS}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className={CARD_TITLE_CLASS}>Payment</h2>
            {payment ? (
              <StatusBadge
                meta={PAYMENT_STATUS[payment.status] ?? STATUS_FALLBACK}
              />
            ) : null}
          </div>
          {canEdit && !editingPayment ? (
            <Button variant="outline" size="sm" onClick={startPaymentEdit}>
              <Pencil className="size-3.5" />
              {payment ? "Update" : "Add details"}
            </Button>
          ) : null}
        </div>

        {paymentSaved && !editingPayment ? (
          <p className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-success">
            <CheckCircle2 className="size-4" />
            Payment details submitted — the team will verify them shortly.
          </p>
        ) : null}

        {editingPayment ? (
          <form onSubmit={submitPayment} className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField
              id="access-transaction-reference"
              label="Transaction Reference"
              error={paymentForm.formState.errors.transactionReference?.message}
            >
              <input
                id="access-transaction-reference"
                placeholder="UTR / bank reference number"
                aria-invalid={Boolean(
                  paymentForm.formState.errors.transactionReference,
                )}
                className={INPUT_CLASS}
                {...paymentForm.register("transactionReference")}
              />
            </FormField>
            <FormField
              id="access-payment-date"
              label="Payment Date"
              error={paymentForm.formState.errors.reportedPaymentDate?.message}
            >
              <input
                id="access-payment-date"
                type="date"
                aria-invalid={Boolean(
                  paymentForm.formState.errors.reportedPaymentDate,
                )}
                className={INPUT_CLASS}
                {...paymentForm.register("reportedPaymentDate")}
              />
            </FormField>

            {updatePayment.isError ? (
              <p role="alert" className="text-[13px] text-errorred sm:col-span-2">
                {updatePayment.error.message}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <Button type="submit" disabled={updatePayment.isPending}>
                {updatePayment.isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Submit payment details
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={cancelPaymentEdit}
                disabled={updatePayment.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : payment ? (
          <div>
            <div className="mt-4 grid gap-x-8 gap-y-2.5 text-[13px] sm:grid-cols-2">
              <dl className="space-y-2.5">
                <DetailRow
                  label="Amount expected"
                  value={formatInr(payment.expectedAmount)}
                />
                <DetailRow
                  label="Transaction reference"
                  value={payment.transactionReference ?? EM_DASH}
                />
                <DetailRow
                  label="Payment date"
                  value={
                    payment.reportedPaymentDate
                      ? formatDay(payment.reportedPaymentDate)
                      : EM_DASH
                  }
                />
              </dl>
              <dl className="space-y-2.5">
                <DetailRow
                  label="Submitted on"
                  value={formatDay(payment.submittedAt)}
                />
                <DetailRow label="Verification" value={verificationText} />
              </dl>
            </div>

            {payment.rejectionReason ? (
              <p className="mt-4 rounded-xl border border-errorred/20 bg-errorred/5 px-4 py-3 text-[13px] leading-relaxed text-errorred">
                <span className="font-semibold">Note from the organisers: </span>
                {payment.rejectionReason}
              </p>
            ) : null}

            <p className="mt-4 text-[12px] text-mist">
              Payments are verified manually by the organising team.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-line bg-canvas px-4 py-8 text-center text-[13px] leading-relaxed text-mist">
            {canEdit
              ? "No payment details submitted yet. Add your transaction reference and payment date so the team can verify your payment."
              : "No payment details on file for this registration."}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={CARD_CLASS}>
          <h2 className={CARD_TITLE_CLASS}>Abstract &amp; documents</h2>
          {abstract ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-medium text-navy">
                    {abstract.title}
                  </p>
                  {abstract.themeName ? (
                    <p className="mt-0.5 text-[12px] text-mist">
                      {abstract.themeName}
                    </p>
                  ) : null}
                </div>
                <StatusBadge
                  meta={ABSTRACT_STATUS[abstract.status] ?? STATUS_FALLBACK}
                />
              </div>

              <dl className="grid gap-x-8 gap-y-2.5 text-[13px] sm:grid-cols-2">
                <DetailRow
                  label="Submitted"
                  value={formatDay(abstract.submittedAt)}
                />
                <DetailRow
                  label="Document"
                  value={abstract.fileName ?? "Text submission"}
                />
              </dl>

              {abstract.participantComment ? (
                <div className="rounded-xl border-l-2 border-royal bg-ice/60 px-4 py-3">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-royal">
                    Note from the organisers
                  </p>
                  <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-bodytext">
                    {abstract.participantComment}
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-line bg-canvas px-4 py-8 text-center text-[13px] text-mist">
              No abstract or document submitted for this registration.
            </div>
          )}
        </section>

        <section className={CARD_CLASS}>
          <h2 className={CARD_TITLE_CLASS}>Status updates</h2>
          {timeline.length > 0 ? (
            <ol className="mt-4">
              {timeline.map((entry, index) => (
                <li
                  key={`${entry.at.getTime()}-${index}`}
                  className="relative flex gap-4 pb-5 last:pb-0"
                >
                  {index < timeline.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-[5.5px] top-4 h-full w-px bg-line"
                    />
                  ) : null}
                  <span
                    aria-hidden="true"
                    className="relative mt-1.5 size-3 shrink-0 rounded-full border-2 border-royal bg-white"
                  />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[13px] font-medium text-navy">
                      {entry.label}
                    </p>
                    {entry.detail ? (
                      <p className="text-[12px] leading-relaxed text-bodytext">
                        {entry.detail}
                      </p>
                    ) : null}
                    <p className="text-[12px] text-mist">
                      {formatTimelineMoment(entry.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-line bg-canvas px-4 py-8 text-center text-[13px] text-mist">
              No status updates yet.
            </div>
          )}
        </section>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-[12px] leading-relaxed text-mist sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-px size-4 shrink-0 text-royal" />
          This is a private link meant only for you — please don&rsquo;t share
          it. If your status changed recently, use the link in your most recent
          email.
        </p>
        <Link
          href="/"
          className="shrink-0 font-medium text-royal hover:text-navy"
        >
          Back to the main site
        </Link>
      </div>
    </div>
  );
};

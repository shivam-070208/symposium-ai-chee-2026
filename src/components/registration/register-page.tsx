"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";
import { DESIGNATION_OPTIONS } from "@/lib/designation-options";
import { hasPaymentDetails, PAYMENT_CONFIG } from "@/lib/payment-config";
import {
  calculateFees,
  findPricingCategory,
  formatEarlyBirdDeadline,
  formatInr,
  isEarlyBird,
  REGISTRATION_PRICING,
} from "@/lib/pricing-config";
import { REGISTRATION_CATEGORIES } from "@/lib/registration-options";
import { trpc } from "@/lib/trpc";
import {
  registrationFormSchema,
  type RegistrationFormValues,
} from "@/server/validation/registration.schema";

const MAX_PROOF_BYTES = 8 * 1024 * 1024;

const INPUT_CLASS =
  "mt-2 h-[44px] w-full rounded-lg border border-line bg-white px-3 text-[14px] text-navy outline-none transition-colors placeholder:text-mist focus:border-royal focus:ring-2 focus:ring-royal/15 aria-[invalid=true]:border-errorred";

const LABEL_CLASS = "text-[14px] font-medium text-navy";

const DEFAULT_VALUES: RegistrationFormValues = {
  fullName: "",
  email: "",
  phone: "",
  institution: "",
  department: "",
  designation: "",
  category: "",
  wantsAbstractSubmission: false,
  privacyAcknowledged: false,
};

export const RegisterPage = () => {
  // Read the clock only on the client: during prerender the early-bird window
  // is open, and this avoids Next.js flagging `new Date()` as unstable.
  const [earlyBird] = useState(
    () => typeof window === "undefined" || isEarlyBird(),
  );
  const [proof, setProof] = useState<File | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    reference: string;
    email: string;
  } | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });
  const createRegistration = trpc.registration.create.useMutation();

  const {
    register,
    formState: { errors },
  } = form;

  const selectedCategory = useWatch({
    control: form.control,
    name: "category",
  });
  const pricingCategory = findPricingCategory(selectedCategory);
  const fees = useMemo(
    () =>
      pricingCategory ? calculateFees(pricingCategory, earlyBird) : null,
    [pricingCategory, earlyBird],
  );

  const acceptProof = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    event.target.value = "";

    if (!nextFile) {
      return;
    }
    if (nextFile.type !== "application/pdf") {
      setProofError("Upload the transaction receipt as a PDF.");
      return;
    }
    if (nextFile.size > MAX_PROOF_BYTES) {
      setProofError("The PDF must be smaller than 8 MB.");
      return;
    }

    setProofError(null);
    setProof(nextFile);
  };

  const submitRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!proof) {
      setProofError("Upload the transaction receipt PDF before submitting.");
      return;
    }

    await form.handleSubmit(async (values) => {
      idempotencyKeyRef.current ??= crypto.randomUUID();

      try {
        const result = await createRegistration.mutateAsync({
          ...values,
          idempotencyKey: idempotencyKeyRef.current,
        });

        setReceipt({ reference: result.reference, email: values.email });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        // The mutation error state is rendered next to the submit button.
      }
    })(event);
  };

  if (receipt) {
    return (
      <main className="bg-canvas">
        <div className="mx-auto w-full max-w-[720px] px-4 py-14 sm:px-6">
          <section className="rounded-xl border border-line bg-white p-7 text-center shadow-[0_1px_2px_rgba(11,31,68,0.04)] sm:p-10">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-ice">
              <CheckCircle2 className="size-6 text-success" strokeWidth={1.8} />
            </span>
            <h1 className="mt-5 text-[28px] font-bold tracking-[-0.02em] text-navy">
              Registration submitted
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-bodytext">
              Your reference is{" "}
              <span className="font-semibold tabular-nums text-navy">
                {receipt.reference}
              </span>
              . We are sending your private access link to{" "}
              <span className="font-medium text-navy">{receipt.email}</span>.
            </p>
            <p className="mt-4 rounded-lg border border-line bg-canvas px-4 py-3 text-[13px] leading-relaxed text-bodytext">
              Payment is verified manually. Keep your transaction receipt and
              reference handy — the organising committee will contact you if
              anything is missing.
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-canvas">
      <div className="mx-auto w-full max-w-[960px] px-4 py-10 sm:px-6 lg:py-14">
        <header className="border-b border-line pb-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-royal">
            AI-CHHE 2026 · NIT Patna
          </p>
          <h1 className="mt-3 text-[32px] font-bold leading-tight tracking-[-0.03em] text-navy sm:text-[38px]">
            Registration Form for AI-CHHE 2026
          </h1>
          <p className="mt-3 max-w-[75ch] text-[15px] leading-relaxed text-bodytext">
            Early bird registration is open until{" "}
            {formatEarlyBirdDeadline()}. Fields marked with{" "}
            <span aria-hidden="true" className="text-errorred">
              *
            </span>{" "}
            are required.
          </p>
        </header>

        <section className="mt-6 rounded-xl border border-line bg-white p-6 sm:p-8">
          <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-navy">
            How to complete your registration
          </h2>
          <ol className="mt-4 space-y-3 text-[14px] leading-relaxed text-bodytext">
            <li>
              <strong className="font-semibold text-navy">Step 1:</strong>{" "}
              Carefully fill in all fields (marked with *) and select suitable
              options (such as Registration Category). Depending on the selected
              option, you may be required to enter or upload additional
              information or documentary proof.
            </li>
            <li>
              <strong className="font-semibold text-navy">Step 2:</strong> After
              filling in all fields and ticking the “I confirm that the
              information provided above is correct…” checkbox, carefully note
              the amount mentioned against the “Payable (inclusive of GST)”
              header of the Review Before Payment section. This is the Net Fee
              to be paid by you towards Early Bird Registration.
            </li>
            <li>
              <strong className="font-semibold text-navy">Step 3:</strong> Pay
              the Net Fee by electronic transfer to the bank account listed
              under Review Before Payment. This registration is verified
              manually; there is no payment gateway.
            </li>
            <li>
              <strong className="font-semibold text-navy">Step 4:</strong> Save
              a copy (PDF) of the transaction receipt after successful payment
              of the Net Fee.
            </li>
            <li>
              <strong className="font-semibold text-navy">Step 5:</strong> Return
              to this page and, under Review Before Payment, upload the PDF of
              the transaction receipt. It is mandatory to do so. Finally, click
              Submit Registration to submit your registration form.
            </li>
          </ol>
          <p className="mt-4 border-t border-line pt-4 text-[13px] leading-relaxed text-mist">
            If you face any difficulty in completing the registration, please
            contact the organising committee.
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-line bg-white p-6 sm:p-8">
          <form onSubmit={submitRegistration} noValidate>
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-navy">
              Participant Details
            </h2>
            <p className="mt-1.5 text-[14px] text-mist">
              Enter your details exactly as they should appear on the
              registration record.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className={LABEL_CLASS}>
                  Full Name{" "}
                  <span aria-hidden="true" className="text-errorred">
                    *
                  </span>
                </label>
                <input
                  id="fullName"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  aria-invalid={Boolean(errors.fullName)}
                  className={INPUT_CLASS}
                  {...register("fullName")}
                />
                {errors.fullName ? (
                  <p role="alert" className="mt-1.5 text-[12px] text-errorred">
                    {errors.fullName.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="email" className={LABEL_CLASS}>
                  Email Address{" "}
                  <span aria-hidden="true" className="text-errorred">
                    *
                  </span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  aria-invalid={Boolean(errors.email)}
                  className={INPUT_CLASS}
                  {...register("email")}
                />
                {errors.email ? (
                  <p role="alert" className="mt-1.5 text-[12px] text-errorred">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="phone" className={LABEL_CLASS}>
                  Phone Number{" "}
                  <span className="text-[12px] font-normal text-mist">
                    (Optional)
                  </span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Enter your phone number"
                  aria-invalid={Boolean(errors.phone)}
                  className={INPUT_CLASS}
                  {...register("phone")}
                />
                {errors.phone ? (
                  <p role="alert" className="mt-1.5 text-[12px] text-errorred">
                    {errors.phone.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="institution" className={LABEL_CLASS}>
                  Institution / Organisation{" "}
                  <span className="text-[12px] font-normal text-mist">
                    (Optional)
                  </span>
                </label>
                <input
                  id="institution"
                  autoComplete="organization"
                  placeholder="Enter your institution"
                  aria-invalid={Boolean(errors.institution)}
                  className={INPUT_CLASS}
                  {...register("institution")}
                />
                {errors.institution ? (
                  <p role="alert" className="mt-1.5 text-[12px] text-errorred">
                    {errors.institution.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="department" className={LABEL_CLASS}>
                  Department{" "}
                  <span className="text-[12px] font-normal text-mist">
                    (Optional)
                  </span>
                </label>
                <input
                  id="department"
                  placeholder="Enter your department"
                  aria-invalid={Boolean(errors.department)}
                  className={INPUT_CLASS}
                  {...register("department")}
                />
                {errors.department ? (
                  <p role="alert" className="mt-1.5 text-[12px] text-errorred">
                    {errors.department.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="designation" className={LABEL_CLASS}>
                  Designation{" "}
                  <span className="text-[12px] font-normal text-mist">
                    (Optional)
                  </span>
                </label>
                <select
                  id="designation"
                  aria-invalid={Boolean(errors.designation)}
                  className={INPUT_CLASS}
                  {...register("designation")}
                >
                  <option value="">Select designation</option>
                  {DESIGNATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.designation ? (
                  <p role="alert" className="mt-1.5 text-[12px] text-errorred">
                    {errors.designation.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="category" className={LABEL_CLASS}>
                  Registration Category{" "}
                  <span aria-hidden="true" className="text-errorred">
                    *
                  </span>
                </label>
                <select
                  id="category"
                  aria-invalid={Boolean(errors.category)}
                  className={INPUT_CLASS}
                  {...register("category")}
                >
                  <option value="">Select registration category</option>
                  {REGISTRATION_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category ? (
                  <p role="alert" className="mt-1.5 text-[12px] text-errorred">
                    {errors.category.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-10 border-t border-line pt-8">
              <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-navy">
                Review Before Payment
              </h2>
              <p className="mt-1.5 text-[14px] text-mist">
                {earlyBird
                  ? `Early bird fee applies for registrations completed by ${formatEarlyBirdDeadline()}.`
                  : "Early bird pricing has closed; the regular fee applies."}
              </p>

              <dl className="mt-4 overflow-hidden rounded-lg border border-line">
                <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
                  <dt className="text-[14px] text-bodytext">
                    Registration category
                  </dt>
                  <dd className="text-[14px] font-medium text-navy">
                    {pricingCategory?.label ?? "Not selected"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
                  <dt className="text-[14px] text-bodytext">
                    Base fee{earlyBird ? " (early bird)" : ""}
                  </dt>
                  <dd className="text-[14px] font-medium tabular-nums text-navy">
                    {fees ? formatInr(fees.base) : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
                  <dt className="text-[14px] text-bodytext">
                    GST @ {Math.round(REGISTRATION_PRICING.gstRate * 100)}%
                  </dt>
                  <dd className="text-[14px] font-medium tabular-nums text-navy">
                    {fees ? formatInr(fees.gst) : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 bg-ice px-4 py-3">
                  <dt className="text-[14px] font-semibold text-navy">
                    Payable (inclusive of GST)
                  </dt>
                  <dd className="text-[16px] font-bold tabular-nums text-royal">
                    {fees ? formatInr(fees.total) : "—"}
                  </dd>
                </div>
              </dl>

              {hasPaymentDetails(PAYMENT_CONFIG) ? (
                <div className="mt-6">
                  <p className="text-[14px] leading-relaxed text-bodytext">
                    The payable fee (inclusive of GST) can alternatively be paid
                    via electronic transfer to the following bank account (QR
                    code is also appended below):
                  </p>
                  <dl className="mt-3 grid gap-x-6 gap-y-2 rounded-lg border border-line bg-canvas p-4 text-[13px] sm:grid-cols-[200px_1fr]">
                    <dt className="font-medium text-mist">Bank Name</dt>
                    <dd className="text-navy">{PAYMENT_CONFIG.bankName}</dd>
                    <dt className="font-medium text-mist">
                      Name of the Account
                    </dt>
                    <dd className="text-navy">{PAYMENT_CONFIG.accountName}</dd>
                    <dt className="font-medium text-mist">Account Number</dt>
                    <dd className="tabular-nums text-navy">
                      {PAYMENT_CONFIG.accountNumber}
                    </dd>
                    <dt className="font-medium text-mist">Address</dt>
                    <dd className="text-navy">{PAYMENT_CONFIG.address}</dd>
                    <dt className="font-medium text-mist">Branch Code</dt>
                    <dd className="tabular-nums text-navy">
                      {PAYMENT_CONFIG.branchCode}
                    </dd>
                    <dt className="font-medium text-mist">IFSC Code</dt>
                    <dd className="tabular-nums text-navy">
                      {PAYMENT_CONFIG.ifsc}
                    </dd>
                    <dt className="font-medium text-mist">MICR Code</dt>
                    <dd className="tabular-nums text-navy">
                      {PAYMENT_CONFIG.micr}
                    </dd>
                    <dt className="font-medium text-mist">Swift Code</dt>
                    <dd className="tabular-nums text-navy">
                      {PAYMENT_CONFIG.swift}
                    </dd>
                    <dt className="font-medium text-mist">Contact</dt>
                    <dd className="text-navy">
                      Phone: {PAYMENT_CONFIG.contactPhone}, E-mail:{" "}
                      {PAYMENT_CONFIG.contactEmail}
                    </dd>
                  </dl>
                  <p className="mt-2 text-[12px] text-mist">
                    {PAYMENT_CONFIG.referenceNote}
                  </p>
                  {/*
                    QR code placeholder — uncomment once the organiser supplies
                    the payment QR image in public/.

                    <Image
                      src="/payment-qr.png"
                      alt="Payment QR code"
                      width={144}
                      height={144}
                    />
                  */}
                </div>
              ) : null}

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                  <span className={LABEL_CLASS}>
                    Transaction Receipt (PDF){" "}
                    <span aria-hidden="true" className="text-errorred">
                      *
                    </span>
                  </span>
                  <span className="text-[12px] text-mist">PDF · max 8 MB</span>
                </div>
                <label className="mt-2 flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-line bg-canvas px-4 py-7 text-center transition-colors hover:border-royal/60 hover:bg-ice">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={acceptProof}
                  />
                  <Upload className="size-5 text-royal" strokeWidth={1.8} />
                  <span className="text-[13px] text-bodytext">
                    Upload the transaction receipt (PDF)
                  </span>
                  <span className="text-[12px] text-mist">
                    We verify every payment manually
                  </span>
                </label>
                {proofError ? (
                  <p role="alert" className="mt-2 text-[12px] text-errorred">
                    {proofError}
                  </p>
                ) : null}
                {proof ? (
                  <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-line bg-white px-3 py-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText
                        className="size-4 shrink-0 text-royal"
                        strokeWidth={1.8}
                      />
                      <span className="truncate text-[13px] text-bodytext">
                        {proof.name}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setProofError(null);
                        setProof(null);
                      }}
                      aria-label="Remove transaction receipt"
                      className="shrink-0 text-mist transition-colors hover:text-errorred"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : null}
              </div>

              <label className="mt-6 flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-bodytext">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 shrink-0 rounded-[3px] border border-line accent-royal"
                  {...register("privacyAcknowledged")}
                />
                <span>
                  I confirm that the information provided above is correct to
                  the best of my knowledge. I understand that registration
                  details are subject to verification.{" "}
                  <span aria-hidden="true" className="text-errorred">
                    *
                  </span>
                </span>
              </label>
              {errors.privacyAcknowledged ? (
                <p role="alert" className="mt-1.5 text-[12px] text-errorred">
                  {errors.privacyAcknowledged.message}
                </p>
              ) : null}

              {createRegistration.isError ? (
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-errorred/20 bg-errorred/5 px-4 py-3 text-[13px] text-errorred"
                >
                  We could not submit your registration. Please check your
                  details and try again.
                </p>
              ) : null}

              <button
                type="submit"
                disabled={createRegistration.isPending}
                className="mt-6 inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-royal px-5 text-[14px] font-semibold text-white transition-colors hover:bg-navy disabled:opacity-60 sm:w-auto"
              >
                {createRegistration.isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : null}
                Submit Registration
                <ArrowRight className="size-4" />
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

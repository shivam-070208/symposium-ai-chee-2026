"use client";

import type { ChangeEvent, FormEvent } from "react";
import { Suspense, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { EVENT_CONFIG } from "@/lib/event-config";
import { trpc } from "@/lib/trpc";
import {
  abstractFormSchema,
  type AbstractFormValues,
} from "@/server/validation/abstract.schema";

const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;

const MAX_AUTHORS = 50;

const DOCUMENT_EXTENSION = /\.(pdf|doc|docx)$/i;

const DOCUMENT_ACCEPT = [
  ".pdf",
  ".doc",
  ".docx",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
].join(",");

const GUIDELINES = [
  {
    id: "01",
    title: "Register first",
    body: "Submitting needs the registration reference and email address from your registration confirmation.",
    linkLabel: "Register for AI-CHHE 2026",
    linkHref: "/register",
  },
  {
    id: "02",
    title: "Every author",
    body: "List every author of the abstract and mark exactly one of them as the corresponding author.",
  },
  {
    id: "03",
    title: "Text or document",
    body: "Paste your abstract or attach a PDF, DOC, or DOCX document up to 8 MB — at least one is required.",
  },
  {
    id: "04",
    title: "Deadline to be announced",
    body: "The abstract submission deadline will be announced by the organisers.",
    linkLabel: "See important dates",
    linkHref: "/#important-dates",
  },
  {
    id: "05",
    title: "Track your status",
    body: "Follow review updates from your private access link — submitted, under review, revision requested, accepted, or rejected.",
  },
  {
    id: "06",
    title: "Need help?",
    body: "Reach the organising committee with any question about your submission.",
    linkLabel: "Contact us",
    linkHref: "/#contact",
  },
];

const INPUT_CLASS =
  "mt-2 h-[44px] w-full rounded-lg border border-line bg-white px-3 text-[14px] text-navy outline-none transition-colors placeholder:text-mist focus:border-royal focus:ring-2 focus:ring-royal/15 aria-[invalid=true]:border-errorred";

const TEXTAREA_CLASS =
  "mt-2 min-h-[180px] w-full resize-y rounded-lg border border-line bg-white px-3 py-2.5 text-[14px] leading-relaxed text-navy outline-none transition-colors placeholder:text-mist focus:border-royal focus:ring-2 focus:ring-royal/15 aria-[invalid=true]:border-errorred";

const LABEL_CLASS = "text-[14px] font-medium text-navy";

const SECTION_TITLE_CLASS =
  "text-[22px] font-semibold tracking-[-0.01em] text-navy";

const FIELD_ERROR_CLASS = "mt-1.5 text-[12px] text-errorred";

const ALERT_CLASS =
  "mt-4 rounded-lg border border-errorred/20 bg-errorred/5 px-4 py-3 text-[13px] text-errorred";

const CARD_SECTION_CLASS =
  "mt-6 rounded-xl border border-line bg-white p-6 sm:p-8";

const DEFAULT_VALUES: AbstractFormValues = {
  registrationReference: "",
  registrationEmail: "",
  title: "",
  abstractText: "",
  correspondingIndex: "0",
  authors: [{ fullName: "", email: "", affiliation: "" }],
};

type UploadedFileMetadata = {
  s3ObjectKey: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
};

type SubmissionFormProps = {
  readonly onSubmitted: (title: string) => void;
};

const FormFallback = () => (
  <div className="animate-pulse" aria-hidden="true">
    <div className="h-5 w-52 rounded bg-ice" />
    <div className="mt-3 h-4 w-72 rounded bg-ice" />
    <div className="mt-8 grid gap-5 sm:grid-cols-2">
      <div className="h-[44px] rounded-lg bg-ice" />
      <div className="h-[44px] rounded-lg bg-ice" />
    </div>
    <div className="mt-5 h-[44px] rounded-lg bg-ice" />
    <div className="mt-8 h-px w-full bg-line" />
    <div className="mt-7 h-[180px] rounded-lg bg-ice" />
    <div className="mt-6 h-[46px] w-44 rounded-lg bg-ice" />
  </div>
);

const SubmissionForm = ({ onSubmitted }: SubmissionFormProps) => {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AbstractFormValues>({
    resolver: zodResolver(abstractFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const authorFields = useFieldArray({
    control,
    name: "authors",
  });

  const submitAbstract = trpc.abstract.submit.useMutation();

  const acceptDocument = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    event.target.value = "";

    if (!nextFile) {
      return;
    }

    if (!DOCUMENT_EXTENSION.test(nextFile.name)) {
      setDocumentError("Upload a PDF, DOC, or DOCX document.");
      return;
    }

    if (nextFile.size > MAX_DOCUMENT_BYTES) {
      setDocumentError("The document must be smaller than 8 MB.");
      return;
    }

    setDocumentError(null);
    setUploadError(null);
    setDocumentFile(nextFile);
  };

  const onSubmitForm = async (values: AbstractFormValues) => {
    if (isSubmitting) {
      return;
    }

    setDocumentError(null);
    setUploadError(null);

    if (!documentFile && !values.abstractText) {
      setDocumentError("Add your abstract as text or attach a document.");
      return;
    }

    setIsSubmitting(true);

    let file: UploadedFileMetadata | undefined;

    if (documentFile) {
      const uploadForm = new FormData();
      uploadForm.append("file", documentFile);
      uploadForm.append(
        "registrationReference",
        values.registrationReference.toUpperCase(),
      );
      uploadForm.append("registrationEmail", values.registrationEmail);

      try {
        const response = await fetch("/api/abstract-upload", {
          method: "POST",
          body: uploadForm,
        });

        const body = (await response.json().catch(() => null)) as {
          error?: string;
          s3ObjectKey?: string;
          originalFilename?: string;
          contentType?: string;
          sizeBytes?: number;
        } | null;

        if (
          !response.ok ||
          !body?.s3ObjectKey ||
          !body.originalFilename ||
          !body.contentType ||
          !body.sizeBytes
        ) {
          setUploadError(
            body?.error ?? "The document could not be uploaded. Try again.",
          );
          setIsSubmitting(false);
          return;
        }

        file = {
          s3ObjectKey: body.s3ObjectKey,
          originalFilename: body.originalFilename,
          contentType: body.contentType,
          sizeBytes: body.sizeBytes,
        };
      } catch {
        setUploadError(
          "The document could not be uploaded. Check your connection and try again.",
        );
        setIsSubmitting(false);
        return;
      }
    }

    const result = await submitAbstract
      .mutateAsync({
        registrationReference: values.registrationReference.toUpperCase(),
        registrationEmail: values.registrationEmail,
        title: values.title,
        abstractText: values.abstractText || undefined,
        file,
        authors: values.authors.map((author, index) => ({
          fullName: author.fullName,
          email: author.email || undefined,
          affiliation: author.affiliation || undefined,
          isCorresponding: index === Number(values.correspondingIndex),
        })),
      })
      .catch(() => null);

    if (!result) {
      setIsSubmitting(false);
      return;
    }

    onSubmitted(values.title);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitAbstractForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit(onSubmitForm)(event);
  };

  return (
    <section className={CARD_SECTION_CLASS}>
      <form onSubmit={submitAbstractForm} noValidate>
        <h2 className={SECTION_TITLE_CLASS}>Submission form</h2>
        <p className="mt-1.5 text-[14px] text-mist">
          Fields marked with{" "}
          <span aria-hidden="true" className="text-errorred">
            *
          </span>{" "}
          are required.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="registrationReference" className={LABEL_CLASS}>
              Registration reference{" "}
              <span aria-hidden="true" className="text-errorred">
                *
              </span>
            </label>
            <input
              id="registrationReference"
              autoComplete="off"
              placeholder="Your registration reference"
              aria-invalid={Boolean(errors.registrationReference)}
              className={INPUT_CLASS}
              {...register("registrationReference")}
            />
            {errors.registrationReference ? (
              <p role="alert" className={FIELD_ERROR_CLASS}>
                {errors.registrationReference.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="registrationEmail" className={LABEL_CLASS}>
              Registration email{" "}
              <span aria-hidden="true" className="text-errorred">
                *
              </span>
            </label>
            <input
              id="registrationEmail"
              type="email"
              autoComplete="email"
              placeholder="The email you registered with"
              aria-invalid={Boolean(errors.registrationEmail)}
              className={INPUT_CLASS}
              {...register("registrationEmail")}
            />
            {errors.registrationEmail ? (
              <p role="alert" className={FIELD_ERROR_CLASS}>
                {errors.registrationEmail.message}
              </p>
            ) : null}
          </div>

          <p className="-mt-2 text-[12px] text-mist sm:col-span-2">
            Your reference appears in the registration confirmation email. New
            here?{" "}
            <Link
              href="/register"
              className="font-medium text-royal transition-colors hover:text-navy"
            >
              Register first
            </Link>
          </p>
        </div>

        <div className="mt-8 border-t border-line pt-7">
          <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-navy">
            Abstract details
          </h3>

          <div className="mt-5 grid gap-5">
            <div>
              <label htmlFor="title" className={LABEL_CLASS}>
                Abstract title{" "}
                <span aria-hidden="true" className="text-errorred">
                  *
                </span>
              </label>
              <input
                id="title"
                placeholder="Enter the title of your abstract"
                aria-invalid={Boolean(errors.title)}
                className={INPUT_CLASS}
                {...register("title")}
              />
              {errors.title ? (
                <p role="alert" className={FIELD_ERROR_CLASS}>
                  {errors.title.message}
                </p>
              ) : null}
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <span className={LABEL_CLASS}>
                  Authors{" "}
                  <span aria-hidden="true" className="text-errorred">
                    *
                  </span>
                </span>
                <button
                  type="button"
                  disabled={authorFields.fields.length >= MAX_AUTHORS}
                  onClick={() =>
                    authorFields.append({
                      fullName: "",
                      email: "",
                      affiliation: "",
                    })
                  }
                  className="inline-flex items-center gap-1.5 border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-navy transition-colors hover:border-royal hover:text-royal disabled:opacity-50"
                >
                  <Plus className="size-3.5" />
                  Add author
                </button>
              </div>

              <div className="mt-3 space-y-4">
                {authorFields.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border border-line bg-canvas p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist">
                        Author {index + 1}
                      </span>
                      {authorFields.fields.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => authorFields.remove(index)}
                          aria-label={`Remove author ${index + 1}`}
                          className="text-mist transition-colors hover:text-errorred"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`authors.${index}.fullName`}
                          className={LABEL_CLASS}
                        >
                          Full name{" "}
                          <span aria-hidden="true" className="text-errorred">
                            *
                          </span>
                        </label>
                        <input
                          id={`authors.${index}.fullName`}
                          placeholder="Author full name"
                          aria-invalid={Boolean(
                            errors.authors?.[index]?.fullName,
                          )}
                          className={INPUT_CLASS}
                          {...register(`authors.${index}.fullName`)}
                        />
                        {errors.authors?.[index]?.fullName ? (
                          <p role="alert" className={FIELD_ERROR_CLASS}>
                            {errors.authors[index]?.fullName?.message}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label
                          htmlFor={`authors.${index}.email`}
                          className={LABEL_CLASS}
                        >
                          Email
                        </label>
                        <input
                          id={`authors.${index}.email`}
                          type="email"
                          placeholder="Optional"
                          aria-invalid={Boolean(errors.authors?.[index]?.email)}
                          className={INPUT_CLASS}
                          {...register(`authors.${index}.email`)}
                        />
                        {errors.authors?.[index]?.email ? (
                          <p role="alert" className={FIELD_ERROR_CLASS}>
                            {errors.authors[index]?.email?.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor={`authors.${index}.affiliation`}
                          className={LABEL_CLASS}
                        >
                          Affiliation
                        </label>
                        <input
                          id={`authors.${index}.affiliation`}
                          placeholder="Institute or organisation"
                          aria-invalid={Boolean(
                            errors.authors?.[index]?.affiliation,
                          )}
                          className={INPUT_CLASS}
                          {...register(`authors.${index}.affiliation`)}
                        />
                        {errors.authors?.[index]?.affiliation ? (
                          <p role="alert" className={FIELD_ERROR_CLASS}>
                            {errors.authors[index]?.affiliation?.message}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-navy">
                      <input
                        type="radio"
                        className="size-4 accent-royal"
                        value={String(index)}
                        {...register("correspondingIndex")}
                      />
                      Corresponding author
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-7">
          <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-navy">
            Abstract content
          </h3>
          <p className="mt-1.5 text-[14px] text-mist">
            Provide your abstract as text, as an attached document, or both.
          </p>

          <div className="mt-5">
            <label htmlFor="abstractText" className={LABEL_CLASS}>
              Abstract text
            </label>
            <textarea
              id="abstractText"
              rows={8}
              placeholder="Paste your abstract here..."
              aria-invalid={Boolean(errors.abstractText)}
              className={TEXTAREA_CLASS}
              {...register("abstractText")}
            />
            {errors.abstractText ? (
              <p role="alert" className={FIELD_ERROR_CLASS}>
                {errors.abstractText.message}
              </p>
            ) : null}
          </div>

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist">
              or attach a document
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className={LABEL_CLASS}>Abstract document</span>
            <span className="text-[12px] text-mist">
              PDF, DOC, DOCX · max 8 MB
            </span>
          </div>

          <label className="mt-2 flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-line bg-canvas px-4 py-7 text-center transition-colors hover:border-royal/60 hover:bg-ice">
            <input
              type="file"
              accept={DOCUMENT_ACCEPT}
              className="sr-only"
              onChange={acceptDocument}
            />
            <Upload className="size-5 text-royal" strokeWidth={1.8} />
            <span className="text-[13px] text-bodytext">
              Attach your abstract document
            </span>
            <span className="text-[12px] text-mist">
              PDF, DOC, or DOCX up to 8 MB
            </span>
          </label>

          {documentError ? (
            <p role="alert" className={FIELD_ERROR_CLASS}>
              {documentError}
            </p>
          ) : null}

          {documentFile ? (
            <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-line bg-white px-3 py-2">
              <span className="flex min-w-0 items-center gap-2">
                <FileText
                  className="size-4 shrink-0 text-royal"
                  strokeWidth={1.8}
                />
                <span className="truncate text-[13px] text-bodytext">
                  {documentFile.name}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setDocumentError(null);
                  setUploadError(null);
                  setDocumentFile(null);
                }}
                aria-label="Remove abstract document"
                className="shrink-0 text-mist transition-colors hover:text-errorred"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : null}
        </div>

        {uploadError ? (
          <p role="alert" className={ALERT_CLASS}>
            {uploadError}
          </p>
        ) : null}

        {submitAbstract.isError ? (
          <p role="alert" className={ALERT_CLASS}>
            {submitAbstract.error?.data?.code === "BAD_REQUEST"
              ? "Some details are missing or invalid. Review the form and try again."
              : (submitAbstract.error?.message ??
                "Your abstract could not be submitted. Please try again.")}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitAbstract.isPending || isSubmitting}
          className="mt-7 inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-royal px-5 text-[14px] font-semibold text-white transition-colors hover:bg-navy disabled:opacity-60 sm:w-auto"
        >
          {submitAbstract.isPending || isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : null}
          {isSubmitting
            ? "Uploading document…"
            : submitAbstract.isPending
              ? "Submitting…"
              : "Submit abstract"}
        </button>
      </form>
    </section>
  );
};

export const AbstractsPage = () => {
  const [submittedTitle, setSubmittedTitle] = useState<string | null>(null);

  if (submittedTitle !== null) {
    return (
      <main className="bg-canvas">
        <div className="mx-auto w-full max-w-[720px] px-4 py-14 sm:px-6">
          <section className="rounded-xl border border-line bg-white p-7 text-center shadow-[0_1px_2px_rgba(11,31,68,0.04)] sm:p-10">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-ice">
              <CheckCircle2 className="size-6 text-success" strokeWidth={1.8} />
            </span>
            <h1 className="mt-5 text-[28px] font-bold tracking-[-0.02em] text-navy">
              Abstract submitted
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-bodytext">
              We received{" "}
              <span className="font-semibold text-navy">
                &ldquo;{submittedTitle}&rdquo;
              </span>
              . Keep your registration reference handy.
            </p>
            <p className="mt-4 rounded-lg border border-line bg-canvas px-4 py-3 text-[13px] leading-relaxed text-bodytext">
              Review status appears on the private access link from your
              registration email.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="inline-flex h-[46px] items-center justify-center gap-2 rounded-lg bg-royal px-5 text-[14px] font-semibold text-white transition-colors hover:bg-navy"
              >
                Back to homepage
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/#important-dates"
                className="inline-flex h-[46px] items-center justify-center gap-2 rounded-lg border border-line bg-white px-5 text-[14px] font-semibold text-navy transition-colors hover:border-royal hover:text-royal"
              >
                Important dates
              </Link>
            </div>
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
            Call for Abstracts
          </h1>
          <p className="mt-3 max-w-[75ch] text-[15px] leading-relaxed text-bodytext">
            Share your work at AI-CHHE 2026 under the symposium theme{" "}
            <span className="font-semibold text-navy">
              &ldquo;{EVENT_CONFIG.theme}&rdquo;
            </span>
            . Abstracts are welcome across the symposium focus areas:
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {EVENT_CONFIG.focusAreas.map((area) => (
              <li
                key={area}
                className="border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-royal"
              >
                {area}
              </li>
            ))}
          </ul>
        </header>

        <section className="mt-6 rounded-xl border border-line bg-white p-6 sm:p-8">
          <h2 className={SECTION_TITLE_CLASS}>Before you submit</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDELINES.map((item) => (
              <article
                key={item.id}
                className="flex flex-col rounded-lg border border-line bg-canvas p-5"
              >
                <span className="text-[11px] font-semibold tracking-[0.18em] text-royal">
                  {item.id}
                </span>
                <h3 className="mt-2 text-[15px] font-semibold text-navy">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-bodytext">
                  {item.body}
                </p>
                {item.linkLabel && item.linkHref ? (
                  <Link
                    href={item.linkHref}
                    className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-royal transition-colors hover:text-navy"
                  >
                    {item.linkLabel}
                    <ArrowRight className="size-3.5" />
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <Suspense
          fallback={
            <section className={CARD_SECTION_CLASS}>
              <FormFallback />
            </section>
          }
        >
          <SubmissionForm onSubmitted={setSubmittedTitle} />
        </Suspense>
      </div>
    </main>
  );
};

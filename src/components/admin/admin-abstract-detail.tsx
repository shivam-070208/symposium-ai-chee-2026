"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { AdminEmpty } from "./admin-empty";
import { formatAdminCategory, formatAdminDateTime, formatAdminIntent } from "./admin-format";
import { AdminStatusBadge } from "./admin-status-badge";
import { AdminAbstractDecisionForm } from "./admin-abstract-decision-form";

type AdminAbstractDetailProps = {
  readonly abstractId: number;
};

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

const formatFileSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export const AdminAbstractDetail = ({
  abstractId,
}: AdminAbstractDetailProps) => {
  const detail = trpc.admin.abstracts.byId.useQuery({ abstractId });

  if (detail.isLoading) {
    return (
      <div className="rounded-xl border border-line bg-white px-5 py-10 text-center text-[13px] text-mist">
        Loading abstract…
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <div className="rounded-xl border border-errorred/20 bg-errorred/5 px-5 py-4 text-[13px] text-errorred">
        Could not load this abstract.
      </div>
    );
  }

  const data = detail.data;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/abstracts"
        className="inline-flex items-center gap-2 text-[13px] font-medium text-royal hover:text-navy"
      >
        <ArrowLeft className="size-4" />
        All abstracts
      </Link>

      <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-royal">
            Abstract
          </p>
          <h1 className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-navy">
            {data.title}
          </h1>
          <p className="mt-1.5 text-[13px] text-mist">
            Submitted {formatAdminDateTime(data.submittedAt)}
            {data.themeName ? ` · ${data.themeName}` : ""}
          </p>
        </div>
        <AdminStatusBadge status={data.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[15px] font-semibold text-navy">Registration</h2>
          <dl className="mt-3 space-y-2 text-[13px]">
            <DetailRow
              label="Reference"
              value={data.registration.reference}
            />
            <DetailRow
              label="Participant"
              value={data.registration.participantName}
            />
            <DetailRow label="Email" value={data.registration.email} />
            <DetailRow
              label="Institution"
              value={data.registration.institution ?? "—"}
            />
            <DetailRow
              label="Category"
              value={formatAdminCategory(data.registration.category)}
            />
            <DetailRow
              label="Abstract intent"
              value={formatAdminIntent(data.registration.wantsAbstractSubmission)}
            />
          </dl>
          <Link
            href={`/admin/registrations/${data.registration.id}`}
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-royal hover:text-navy"
          >
            Open registration
            <ArrowUpRight className="size-3.5" />
          </Link>
        </section>

        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[15px] font-semibold text-navy">Submission</h2>
          <dl className="mt-3 space-y-2 text-[13px]">
            <DetailRow label="Status" value={data.status.replaceAll("_", " ")} />
            <DetailRow label="Theme" value={data.themeName ?? "—"} />
            <DetailRow
              label="Content"
              value={
                data.abstractText && data.document
                  ? "Text + document"
                  : data.document
                    ? "Document"
                    : "Text"
              }
            />
            <DetailRow
              label="Created"
              value={formatAdminDateTime(data.createdAt)}
            />
          </dl>
          <div className="mt-4 flex items-center gap-2">
            <AdminStatusBadge status={data.status} />
            <span className="text-[12px] text-mist">
              {data.authors.length}{" "}
              {data.authors.length === 1 ? "author" : "authors"}
            </span>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold text-navy">Authors</h2>
        </div>
        <ul className="divide-y divide-line">
          {data.authors.map((author) => (
            <li
              key={author.id}
              className="flex flex-col gap-1 px-5 py-3.5 text-[13px] sm:flex-row sm:items-center sm:justify-between"
            >
              <span>
                <span className="font-medium text-navy">
                  {author.authorOrder}. {author.fullName}
                </span>
                <span className="mt-0.5 block text-[12px] text-mist">
                  {author.email ?? "No email"}
                  {author.affiliation ? ` · ${author.affiliation}` : ""}
                </span>
              </span>
              {author.isCorresponding ? (
                <span className="shrink-0 rounded-full border border-royal/20 bg-ice px-2.5 py-0.5 text-[12px] font-medium text-royal">
                  Corresponding author
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-line bg-white p-5">
        <h2 className="text-[15px] font-semibold text-navy">
          Abstract content
        </h2>
        {data.abstractText ? (
          <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-bodytext">
            {data.abstractText}
          </p>
        ) : (
          <div className="mt-3">
            <AdminEmpty
              message="No abstract text"
              detail="This submission used an attached document instead."
            />
          </div>
        )}
      </section>

      {data.document ? (
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[15px] font-semibold text-navy">Document</h2>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex min-w-0 items-center gap-2">
              <FileText className="size-4 shrink-0 text-royal" strokeWidth={1.8} />
              <span className="truncate text-[13px] text-bodytext">
                {data.document.originalFilename}
              </span>
              <span className="shrink-0 text-[12px] text-mist">
                {data.document.contentType.split("/").pop()?.toUpperCase()} ·{" "}
                {formatFileSize(data.document.sizeBytes)}
              </span>
            </span>
            <a
              href={data.document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[38px] shrink-0 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-[13px] font-semibold text-navy transition-colors hover:border-royal hover:text-royal"
            >
              Open document
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </section>
      ) : null}

      <AdminAbstractDecisionForm abstractId={abstractId} />

      <section className="rounded-xl border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold text-navy">
            Review history
          </h2>
        </div>
        {data.reviewHistory.length === 0 ? (
          <div className="p-5">
            <AdminEmpty
              message="No review history yet"
              detail="Decisions recorded here appear in this list."
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {data.reviewHistory.map((review) => (
              <li key={review.id} className="px-5 py-4 text-[13px]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium capitalize text-navy">
                    {review.decision.replaceAll("_", " ")}
                  </span>
                  <span className="text-[12px] text-mist">
                    {review.reviewerIdentifier} ·{" "}
                    {formatAdminDateTime(review.createdAt)}
                  </span>
                </div>
                {review.participantComment ? (
                  <p className="mt-2 rounded-lg border border-line bg-canvas px-3 py-2 text-[13px] text-bodytext">
                    <span className="text-[12px] font-medium text-mist">
                      Note to authors:{" "}
                    </span>
                    {review.participantComment}
                  </p>
                ) : null}
                {review.internalComment ? (
                  <p className="mt-2 rounded-lg border border-line bg-canvas px-3 py-2 text-[13px] text-bodytext">
                    <span className="text-[12px] font-medium text-mist">
                      Internal note:{" "}
                    </span>
                    {review.internalComment}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

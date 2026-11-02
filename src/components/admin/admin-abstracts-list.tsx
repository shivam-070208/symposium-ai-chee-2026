"use client";

import { useState } from "react";
import Link from "next/link";
import { ABSTRACT_STATUSES } from "@/lib/domain";
import { trpc } from "@/lib/trpc";
import { AdminEmpty } from "./admin-empty";
import { formatAdminDate } from "./admin-format";
import { AdminPageHeader } from "./admin-page-header";
import { AdminPagination } from "./admin-pagination";
import { AdminStatusBadge } from "./admin-status-badge";

const PAGE_SIZE = 20;

const SELECT_CLASS =
  "h-[44px] rounded-lg border border-line bg-white px-3 text-[14px] text-navy outline-none focus:border-royal focus:ring-2 focus:ring-royal/15";

export const AdminAbstractsList = () => {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const query = trpc.admin.abstracts.list.useQuery({
    page,
    pageSize: PAGE_SIZE,
    ...(status
      ? { status: status as (typeof ABSTRACT_STATUSES)[number] }
      : {}),
  });

  const totalPages = Math.max(
    1,
    Math.ceil((query.data?.total ?? 0) / PAGE_SIZE),
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Review"
        title="Abstracts"
        description="Read submissions, review authors and documents, and record decisions."
      />

      <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-4">
        <label
          htmlFor="abstract-status"
          className="text-[13px] font-medium text-navy"
        >
          Status
        </label>
        <select
          id="abstract-status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className={SELECT_CLASS}
        >
          <option value="">All statuses</option>
          {ABSTRACT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {query.isLoading ? (
        <div className="rounded-xl border border-line bg-white px-5 py-10 text-center text-[13px] text-mist">
          Loading abstracts…
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-errorred/20 bg-errorred/5 px-5 py-4 text-[13px] text-errorred">
          Could not load abstracts. Please refresh and try again.
        </div>
      ) : query.data && query.data.items.length === 0 ? (
        <AdminEmpty
          message="No abstracts match"
          detail="Submissions from the abstract page appear here."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-line bg-canvas text-[12px] font-medium text-mist">
                  <th className="px-4 py-3">Abstract</th>
                  <th className="px-4 py-3">Registration</th>
                  <th className="px-4 py-3">Authors</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {query.data?.items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-canvas">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/abstracts/${item.id}`}
                        className="text-[14px] font-medium text-royal hover:text-navy"
                      >
                        {item.title}
                      </Link>
                      {item.themeName ? (
                        <span className="mt-0.5 block text-[12px] text-mist">
                          {item.themeName}
                        </span>
                      ) : null}
                      <span className="mt-0.5 block text-[12px] text-mist">
                        {item.hasDocument && item.hasText
                          ? "Document + text"
                          : item.hasDocument
                            ? "Document"
                            : "Text"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/registrations/${item.registrationId}`}
                        className="block text-[13px] font-medium tabular-nums text-royal hover:text-navy"
                      >
                        {item.reference}
                      </Link>
                      <span className="mt-0.5 block text-[12px] text-mist">
                        {item.participantName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-bodytext">
                      {item.authorCount}{" "}
                      {item.authorCount === 1 ? "author" : "authors"}
                      {item.correspondingAuthor ? (
                        <span className="mt-0.5 block text-[12px] text-mist">
                          Corr: {item.correspondingAuthor}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-[13px] tabular-nums text-mist">
                      {formatAdminDate(item.submittedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <AdminStatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={query.data?.total ?? 0}
            itemLabel="abstracts"
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

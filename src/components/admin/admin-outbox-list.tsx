"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EMAIL_OUTBOX_STATUSES } from "@/lib/domain";
import { trpc } from "@/lib/trpc";
import { AdminEmpty } from "./admin-empty";
import { formatAdminDateTime } from "./admin-format";
import { AdminPageHeader } from "./admin-page-header";
import { AdminPagination } from "./admin-pagination";
import { AdminStatusBadge } from "./admin-status-badge";

const PAGE_SIZE = 20;

const SELECT_CLASS =
  "h-[44px] rounded-lg border border-line bg-white px-3 text-[14px] text-navy outline-none focus:border-royal focus:ring-2 focus:ring-royal/15";

export const AdminOutboxList = () => {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const utils = trpc.useUtils();

  const query = trpc.admin.emails.list.useQuery({
    page,
    pageSize: PAGE_SIZE,
    ...(status
      ? { status: status as (typeof EMAIL_OUTBOX_STATUSES)[number] }
      : {}),
  });

  const retry = trpc.admin.emails.retry.useMutation({
    onSuccess: () => {
      void utils.admin.emails.list.invalidate();
      void utils.admin.overview.invalidate();
    },
  });

  const totalPages = Math.max(
    1,
    Math.ceil((query.data?.total ?? 0) / PAGE_SIZE),
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Delivery"
        title="Email outbox"
        description="Every acknowledgement and status email is recorded here. Failed emails can be retried."
      />

      <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-4">
        <label htmlFor="email-status" className="text-[13px] font-medium text-navy">
          Status
        </label>
        <select
          id="email-status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className={SELECT_CLASS}
        >
          <option value="">All statuses</option>
          {EMAIL_OUTBOX_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {query.isLoading ? (
        <div className="rounded-xl border border-line bg-white px-5 py-10 text-center text-[13px] text-mist">
          Loading emails…
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-errorred/20 bg-errorred/5 px-5 py-4 text-[13px] text-errorred">
          Could not load the outbox. Please refresh and try again.
        </div>
      ) : query.data && query.data.items.length === 0 ? (
        <AdminEmpty
          message="No emails in the outbox"
          detail="Acknowledgement emails appear here after a registration is submitted."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-line bg-canvas text-[12px] font-medium text-mist">
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Attempts</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {query.data?.items.map((email) => (
                  <tr key={email.id} className="transition-colors hover:bg-canvas">
                    <td className="px-4 py-3">
                      <span className="block text-[13px] font-medium text-navy">
                        {email.recipient}
                      </span>
                      {email.lastErrorSafe ? (
                        <span className="mt-0.5 block text-[12px] text-errorred">
                          {email.lastErrorSafe}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-bodytext">
                      {email.templateKey}
                    </td>
                    <td className="px-4 py-3 text-[13px] tabular-nums text-mist">
                      {formatAdminDateTime(email.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-[13px] tabular-nums text-bodytext">
                      {email.attempts}
                    </td>
                    <td className="px-4 py-3">
                      <AdminStatusBadge status={email.status} />
                    </td>
                    <td className="px-4 py-3">
                      {email.status === "failed" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={retry.isPending}
                          onClick={() => retry.mutate({ outboxId: email.id })}
                        >
                          Retry
                        </Button>
                      ) : (
                        <span className="text-[13px] text-mist">—</span>
                      )}
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
            itemLabel="emails"
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

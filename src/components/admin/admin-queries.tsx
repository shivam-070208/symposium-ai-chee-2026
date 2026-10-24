"use client";

import type { FormEvent } from "react";
import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, Search, Send } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  CONTACT_QUERY_STATUSES,
  type ContactQueryStatus,
} from "@/lib/domain";
import { trpc } from "@/lib/trpc";
import { formatAdminDateTime } from "./admin-format";

const PAGE_SIZE = 20;

const STATUS_META: Record<
  ContactQueryStatus,
  { readonly label: string; readonly classes: string }
> = {
  queried: { label: "Queried", classes: "border-royal/20 bg-ice text-royal" },
  pending: { label: "Pending", classes: "border-brass/30 bg-brass/10 text-brass" },
  resolved: {
    label: "Resolved",
    classes: "border-success/20 bg-success/10 text-success",
  },
  "non-important": {
    label: "Non-important",
    classes: "border-line bg-canvas text-mist",
  },
};

const SELECT_CLASS =
  "h-[44px] rounded-lg border border-line bg-white px-3 text-[14px] text-navy outline-none focus:border-royal focus:ring-2 focus:ring-royal/15";

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-white px-3 text-[14px] text-navy outline-none transition-colors placeholder:text-mist focus:border-royal focus:ring-2 focus:ring-royal/15";

const PANEL_CLASS =
  "rounded-xl border border-line bg-white p-5";

const statusBadgeClasses = (status: ContactQueryStatus): string =>
  cn(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-medium",
    STATUS_META[status]?.classes ?? "border-line bg-canvas text-mist",
  );

export const AdminQueries = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusChoice, setStatusChoice] = useState<ContactQueryStatus>("queried");
  const [replyText, setReplyText] = useState("");
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [replyFeedback, setReplyFeedback] = useState<string | null>(null);

  const listQuery = trpc.admin.queries.list.useQuery({
    page,
    pageSize: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(status ? { status: status as ContactQueryStatus } : {}),
  });

  const detailQuery = trpc.admin.queries.byId.useQuery(
    { queryId: expandedId ?? 0 },
    { enabled: expandedId !== null },
  );

  const utils = trpc.useUtils();

  const updateStatus = trpc.admin.queries.updateStatus.useMutation({
    onSuccess: (result) => {
      setStatusFeedback(
        result.changed
          ? `Status updated to ${result.status}.`
          : "No change — this query already has that status.",
      );
      void utils.admin.queries.list.invalidate();
      if (expandedId !== null) {
        void utils.admin.queries.byId.invalidate({ queryId: expandedId });
      }
    },
    onError: (error) => {
      setStatusFeedback(error.message);
    },
  });

  const reply = trpc.admin.queries.reply.useMutation({
    onSuccess: () => {
      setReplyFeedback(
        "Reply queued. It will be emailed to the sender shortly.",
      );
      setReplyText("");
      void utils.admin.queries.list.invalidate();
      if (expandedId !== null) {
        void utils.admin.queries.byId.invalidate({ queryId: expandedId });
      }
    },
    onError: (error) => {
      setReplyFeedback(error.message);
    },
  });

  const totalPages = Math.max(
    1,
    Math.ceil((listQuery.data?.total ?? 0) / PAGE_SIZE),
  );

  const applySearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const toggleRow = (queryId: number, nextStatus: ContactQueryStatus) => {
    setReplyFeedback(null);
    setStatusFeedback(null);
    setReplyText("");
    setStatusChoice(nextStatus);

    if (expandedId === queryId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(queryId);
  };

  const submitStatus = () => {
    if (expandedId === null) {
      return;
    }
    setStatusFeedback(null);
    updateStatus.mutate({ queryId: expandedId, status: statusChoice });
  };

  const submitReply = () => {
    if (expandedId === null) {
      return;
    }
    setReplyFeedback(null);
    reply.mutate({ queryId: expandedId, message: replyText.trim() });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-royal">
            Inbox
          </p>
          <h1 className="mt-2 text-[30px] font-bold leading-tight tracking-[-0.03em] text-navy">
            Queries
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-bodytext">
            Messages sent through the landing page contact form. Mark each
            query, then reply to the sender by email.
          </p>
        </div>
        <p className="text-[13px] tabular-nums text-mist">
          {listQuery.data?.total ?? 0} total
        </p>
      </div>

      <form
        onSubmit={applySearch}
        className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center"
      >
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name, email, subject or message"
            aria-label="Search queries"
            className="h-[44px] w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[14px] text-navy outline-none placeholder:text-mist focus:border-royal focus:ring-2 focus:ring-royal/15"
          />
        </div>
        <select
          value={status}
          aria-label="Filter by status"
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className={SELECT_CLASS}
        >
          <option value="">All statuses</option>
          {CONTACT_QUERY_STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_META[value].label}
            </option>
          ))}
        </select>
        <Button type="submit" className="h-[44px]">
          Search
        </Button>
      </form>

      {listQuery.isLoading ? (
        <div className="rounded-xl border border-line bg-white px-5 py-10 text-center text-[13px] text-mist">
          Loading queries…
        </div>
      ) : listQuery.isError ? (
        <div className="rounded-xl border border-errorred/20 bg-errorred/5 px-5 py-4 text-[13px] text-errorred">
          Could not load queries. Please refresh and try again.
        </div>
      ) : listQuery.data && listQuery.data.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-white px-5 py-10 text-center">
          <p className="text-[14px] font-medium text-navy">No queries yet</p>
          <p className="mt-1.5 text-[13px] text-mist">
            Submitted contact forms appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-line bg-canvas text-[12px] font-medium text-mist">
                  <th className="px-4 py-3">Sender</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" aria-label="Details" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {listQuery.data?.items.map((item) => {
                  const isExpanded = expandedId === item.id;

                  return (
                    <Fragment key={item.id}>
                      <tr
                        onClick={() => toggleRow(item.id, item.status)}
                        className="cursor-pointer transition-colors hover:bg-canvas"
                      >
                        <td className="px-4 py-3">
                          <span className="block text-[14px] font-medium text-navy">
                            {item.name}
                          </span>
                          <span className="mt-0.5 block text-[12px] text-mist">
                            {item.email}
                          </span>
                        </td>
                        <td className="max-w-[320px] px-4 py-3">
                          <span className="block truncate text-[13px] font-medium text-navy">
                            {item.subject}
                          </span>
                          <span className="mt-0.5 block truncate text-[12px] text-mist">
                            {item.snippet}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] tabular-nums text-mist">
                          {formatAdminDateTime(item.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={statusBadgeClasses(item.status)}>
                            {STATUS_META[item.status].label}
                          </span>
                          {item.repliedAt ? (
                            <span className="mt-1 block text-[11px] text-mist">
                              Replied
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-mist">
                          {isExpanded ? (
                            <ChevronDown className="size-4" aria-hidden="true" />
                          ) : (
                            <ChevronRight className="size-4" aria-hidden="true" />
                          )}
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr>
                          <td colSpan={5} className="bg-canvas px-4 py-5">
                          {detailQuery.isLoading ? (
                            <p className="text-[13px] text-mist">Loading…</p>
                          ) : detailQuery.isError || !detailQuery.data ? (
                            <p className="text-[13px] text-errorred">
                              Could not load this query.
                            </p>
                          ) : (
                            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                              <div className="space-y-4">
                                <section className={PANEL_CLASS}>
                                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-mist">
                                    Message
                                  </p>
                                  <p className="mt-3 whitespace-pre-wrap text-[14px] leading-7 text-navy">
                                    {detailQuery.data.query.message}
                                  </p>
                                  <dl className="mt-4 grid gap-2 border-t border-line pt-4 text-[13px] sm:grid-cols-2">
                                    <div>
                                      <dt className="text-mist">From</dt>
                                      <dd className="mt-0.5 text-navy">
                                        {detailQuery.data.query.name} ·{" "}
                                        {detailQuery.data.query.email}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="text-mist">Received</dt>
                                      <dd className="mt-0.5 tabular-nums text-navy">
                                        {formatAdminDateTime(
                                          detailQuery.data.query.createdAt,
                                        )}
                                      </dd>
                                    </div>
                                  </dl>
                                </section>

                                <section className={PANEL_CLASS}>
                                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-mist">
                                    Reply by email
                                  </p>
                                  <p className="mt-1 text-[13px] leading-relaxed text-mist">
                                    Sent from the symposium address to{" "}
                                    {detailQuery.data.query.email}.
                                  </p>
                                  <textarea
                                    value={replyText}
                                    onChange={(event) =>
                                      setReplyText(event.target.value)
                                    }
                                    rows={6}
                                    placeholder="Draft your reply to this sender…"
                                    className={`${FIELD_CLASS} mt-3 min-h-[140px] px-3 py-2.5 leading-6`}
                                  />
                                  <div className="mt-3 flex items-center justify-between gap-3">
                                    <Button
                                      type="button"
                                      size="sm"
                                      disabled={
                                        reply.isPending ||
                                        replyText.trim().length < 10
                                      }
                                      onClick={submitReply}
                                    >
                                      <Send className="size-4" aria-hidden="true" />
                                      {reply.isPending
                                        ? "Queuing…"
                                        : "Send reply"}
                                    </Button>
                                    <span className="text-[12px] tabular-nums text-mist">
                                      {replyText.trim().length}/4000
                                    </span>
                                  </div>
                                  {replyFeedback ? (
                                    <p
                                      role="status"
                                      className="mt-3 rounded-lg border border-line bg-canvas px-3 py-2 text-[13px] text-bodytext"
                                    >
                                      {replyFeedback}
                                    </p>
                                  ) : null}
                                </section>
                              </div>

                              <div className="space-y-4">
                                <section className={PANEL_CLASS}>
                                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-mist">
                                    Query status
                                  </p>
                                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                                    <div className="flex-1">
                                      <label
                                        htmlFor={`status-${item.id}`}
                                        className="text-[13px] font-medium text-navy"
                                      >
                                        Mark as
                                      </label>
                                      <select
                                        id={`status-${item.id}`}
                                        value={statusChoice}
                                        onChange={(event) =>
                                          setStatusChoice(
                                            event.target
                                              .value as ContactQueryStatus,
                                          )
                                        }
                                        className={`${SELECT_CLASS} mt-1.5 w-full`}
                                      >
                                        {CONTACT_QUERY_STATUSES.map((value) => (
                                          <option key={value} value={value}>
                                            {STATUS_META[value].label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <Button
                                      type="button"
                                      className="h-[44px]"
                                      disabled={updateStatus.isPending}
                                      onClick={submitStatus}
                                    >
                                      {updateStatus.isPending
                                        ? "Updating…"
                                        : "Update"}
                                    </Button>
                                  </div>
                                  {statusFeedback ? (
                                    <p
                                      role="status"
                                      className="mt-3 rounded-lg border border-line bg-canvas px-3 py-2 text-[13px] text-bodytext"
                                    >
                                      {statusFeedback}
                                    </p>
                                  ) : null}
                                </section>

                                <section className={PANEL_CLASS}>
                                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-mist">
                                    Emails for this query
                                  </p>
                                  {detailQuery.data.emails.length === 0 ? (
                                    <p className="mt-3 text-[13px] text-mist">
                                      No emails yet.
                                    </p>
                                  ) : (
                                    <ul className="mt-3 divide-y divide-line">
                                      {detailQuery.data.emails.map((email) => (
                                        <li
                                          key={email.id}
                                          className="flex items-center justify-between gap-3 py-2.5 text-[13px]"
                                        >
                                          <span className="min-w-0 truncate text-navy">
                                            {email.templateKey}
                                          </span>
                                          <span className="shrink-0 tabular-nums text-mist">
                                            {email.status} ·{" "}
                                            {formatAdminDateTime(email.createdAt)}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </section>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 text-[13px] text-mist sm:flex-row">
            <p>{listQuery.data?.total ?? 0} queries</p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="tabular-nums">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

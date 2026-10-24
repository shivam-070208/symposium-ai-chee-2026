"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REGISTRATION_STATUSES } from "@/lib/domain";
import { REGISTRATION_CATEGORIES } from "@/lib/registration-options";
import { trpc } from "@/lib/trpc";
import { AdminEmpty } from "./admin-empty";
import { formatAdminCategory, formatAdminDate } from "./admin-format";
import { AdminPageHeader } from "./admin-page-header";
import { AdminPagination } from "./admin-pagination";
import { AdminStatusBadge } from "./admin-status-badge";

const PAGE_SIZE = 20;

const SELECT_CLASS =
  "h-[44px] rounded-lg border border-line bg-white px-3 text-[14px] text-navy outline-none focus:border-royal focus:ring-2 focus:ring-royal/15";

export const AdminRegistrationsList = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const query = trpc.admin.registrations.list.useQuery({
    page,
    pageSize: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(status
      ? { status: status as (typeof REGISTRATION_STATUSES)[number] }
      : {}),
    ...(category ? { category } : {}),
  });

  const totalPages = Math.max(
    1,
    Math.ceil((query.data?.total ?? 0) / PAGE_SIZE),
  );

  const applySearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Delegates"
        title="Registrations"
        description="Search delegates, review their details, and confirm or cancel registration."
      />

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
            placeholder="Search name, email or reference"
            aria-label="Search registrations"
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
          {REGISTRATION_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select
          value={category}
          aria-label="Filter by category"
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
          className={SELECT_CLASS}
        >
          <option value="">All categories</option>
          {REGISTRATION_CATEGORIES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button type="submit" className="h-[44px]">
          Search
        </Button>
      </form>

      {query.isLoading ? (
        <div className="rounded-xl border border-line bg-white px-5 py-10 text-center text-[13px] text-mist">
          Loading registrations…
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-errorred/20 bg-errorred/5 px-5 py-4 text-[13px] text-errorred">
          Could not load registrations. Please refresh and try again.
        </div>
      ) : query.data && query.data.items.length === 0 ? (
        <AdminEmpty
          message="No registrations match"
          detail="Try a different search, or clear the filters."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-line bg-canvas text-[12px] font-medium text-mist">
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Participant</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {query.data?.items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-canvas">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/registrations/${item.id}`}
                        className="text-[13px] font-medium tabular-nums text-royal hover:text-navy"
                      >
                        {item.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block text-[14px] font-medium text-navy">
                        {item.participantName}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-mist">
                        {item.email}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-bodytext">
                      {formatAdminCategory(item.category)}
                    </td>
                    <td className="px-4 py-3">
                      {item.latestPaymentStatus ? (
                        <AdminStatusBadge status={item.latestPaymentStatus} />
                      ) : (
                        <span className="text-[13px] text-mist">—</span>
                      )}
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
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

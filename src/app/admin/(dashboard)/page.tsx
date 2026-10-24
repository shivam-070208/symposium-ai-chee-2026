"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminEmpty } from "@/components/admin/admin-empty";
import {
  formatAdminCategory,
  formatAdminDate,
} from "@/components/admin/admin-format";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { trpc } from "@/lib/trpc";

const AdminOverviewPage = () => {
  const overview = trpc.admin.overview.useQuery();
  const recent = trpc.admin.registrations.list.useQuery({
    page: 1,
    pageSize: 5,
  });
  const counts = overview.data?.registrationCounts;

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="AI-CHHE 2026"
        title="Overview"
        description="Registrations, payments and email delivery at a glance."
      >
        <Link
          href="/admin/registrations"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-royal px-5 text-[14px] font-semibold text-white transition-colors hover:bg-navy"
        >
          View registrations
          <ArrowRight className="size-4" />
        </Link>
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Total registrations"
          value={overview.data?.totalRegistrations ?? "—"}
        />
        <AdminMetricCard
          label="Pending payment"
          value={counts?.pending_payment ?? "—"}
        />
        <AdminMetricCard
          label="Confirmed"
          value={counts?.confirmed ?? "—"}
        />
        <AdminMetricCard
          label="Failed emails"
          value={overview.data?.failedEmails ?? "—"}
          tone={overview.data?.failedEmails ? "warning" : "default"}
          note={
            overview.data?.failedEmails ? "Retry from the outbox" : undefined
          }
        />
      </div>

      <section className="rounded-xl border border-line bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="text-[16px] font-semibold text-navy">
            Recent registrations
          </h2>
          <Link
            href="/admin/registrations"
            className="text-[13px] font-medium text-royal transition-colors hover:text-navy"
          >
            View all
          </Link>
        </div>
        {recent.data && recent.data.items.length === 0 ? (
          <div className="p-5">
            <AdminEmpty
              message="No registrations yet"
              detail="New delegate registrations will appear here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {recent.data?.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/admin/registrations/${item.id}`}
                  className="flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-canvas sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="min-w-0">
                    <span className="block text-[14px] font-medium text-navy">
                      {item.participantName}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-mist">
                      {item.reference} · {formatAdminCategory(item.category)} ·{" "}
                      {formatAdminDate(item.submittedAt)}
                    </span>
                  </span>
                  <AdminStatusBadge status={item.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminOverviewPage;

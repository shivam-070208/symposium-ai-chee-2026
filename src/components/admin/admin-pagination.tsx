"use client";

import { Button } from "@/components/ui/button";

type AdminPaginationProps = {
  readonly page: number;
  readonly totalPages: number;
  readonly total: number;
  readonly itemLabel?: string;
  readonly onPageChange: (page: number) => void;
};

export const AdminPagination = ({
  page,
  totalPages,
  total,
  itemLabel = "registrations",
  onPageChange,
}: AdminPaginationProps) => (
  <div className="flex flex-col items-center justify-between gap-3 text-[13px] text-mist sm:flex-row">
    <p>
      {total} {itemLabel}
    </p>
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
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
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  </div>
);

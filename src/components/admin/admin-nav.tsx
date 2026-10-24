"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { ADMIN_NAV_ITEMS } from "./admin-navigation";

type AdminNavProps = {
  readonly orientation: "vertical" | "horizontal";
};

export const AdminNav = ({ orientation }: AdminNavProps) => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin sections"
      className={
        orientation === "vertical"
          ? "flex flex-col gap-1"
          : "flex items-center gap-1 overflow-x-auto"
      }
    >
      {ADMIN_NAV_ITEMS.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
              active
                ? "bg-ice text-royal"
                : "text-bodytext hover:bg-canvas hover:text-navy",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

// Pages beyond Home and Registration are planned but not yet routed, so they
// render as non-navigating labels rather than dead links.
const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: null },
  { label: "Themes", href: null },
  { label: "Speakers", href: null },
  { label: "Registration", href: "/register" },
  { label: "Important Dates", href: null },
  { label: "Contact", href: null },
] as const;

export const SiteNav = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="hidden items-center gap-7 lg:flex"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.href !== null && pathname === item.href;

        if (item.href === null) {
          return (
            <span
              key={item.label}
              aria-disabled="true"
              className="cursor-default text-[14px] font-medium text-mist"
            >
              {item.label}
            </span>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative py-1 text-[14px] font-medium transition-colors",
              isActive ? "text-royal" : "text-navy hover:text-royal",
            )}
          >
            {item.label}
            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-royal"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
};

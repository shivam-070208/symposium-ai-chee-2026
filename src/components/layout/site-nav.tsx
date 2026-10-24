"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Themes", href: "/#themes" },
  { label: "Speakers", href: "/#speakers" },
  { label: "Registration", href: "/register" },
  { label: "Important Dates", href: "/#important-dates" },
  { label: "Contact", href: "/#contact" },
] as const;

export const SiteNav = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="hidden items-center gap-7 lg:flex"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

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

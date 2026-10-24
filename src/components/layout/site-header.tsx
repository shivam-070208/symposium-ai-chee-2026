
"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { SiteNav } from "./site-nav";

export const SiteHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ease-in-out ${
        isScrolled
          ? "border-line bg-white/95 shadow-sm backdrop-blur-md"
          : "border-transparent bg-transparent shadow-none"
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-[1240px] items-center justify-between gap-6 px-5 sm:px-6">
        <Link
          href="/"
          aria-label="AI-CHHE 2026 home"
          className="flex shrink-0 items-center gap-3 text-navy transition-opacity hover:opacity-80"
        >
          <BrandMark markClassName="size-[52px]" />

          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-[17px] font-semibold tracking-[-0.01em]">
              NIT Patna
            </span>

            <span className="text-[11px] font-normal text-mist">
              National Institute of Technology Patna
            </span>
          </span>
        </Link>

        <SiteNav />

        <Link
          href="/register"
          className="hidden h-12 shrink-0 items-center gap-2 rounded-full bg-[#0B4AA2] px-6 text-[14px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#083B85] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:inline-flex"
        >
          Register Now
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </header>
  );
};

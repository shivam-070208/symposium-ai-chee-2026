"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, CalendarDays, Mail, MapPin } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { EVENT_CONFIG } from "@/lib/event-config";

const exploreLinks = [
  { label: "About", href: "#about" },
  { label: "Themes", href: "#themes" },
  { label: "Programme", href: "#programme" },
  { label: "Important Dates", href: "#important-dates" },
  { label: "Venue & Contact", href: "#venue" },
  { label: "Places to Visit", href: "#places" },
];

const symposiumDetails = [
  {
    id: "dates",
    icon: CalendarDays,
    label: "SYMPOSIUM DATES",
    value: "21–22 November 2026",
    href: "#important-dates",
  },
  {
    id: "venue",
    icon: MapPin,
    label: "VENUE",
    value: "National Institute of Technology Patna",
    href: "#venue",
  },
  {
    id: "enquiries",
    icon: Mail,
    label: "ENQUIRIES",
    value: "Send us a query",
    href: "#contact",
  },
];

export const SiteFooter = () => (
  <motion.footer
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.55, ease: "easeOut" }}
    className="border-t border-line bg-white px-5 pt-14 pb-8 text-navy sm:px-8 sm:pt-16 lg:px-12"
  >
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_0.7fr_1fr]">
        <div>
          <BrandMark />

          <p className="mt-6 max-w-sm text-sm leading-7 text-bodytext">
            {EVENT_CONFIG.department}
            <br />
            {EVENT_CONFIG.institution}
          </p>

          <p className="mt-5 max-w-md font-serif text-lg leading-8 text-royal italic">
            {EVENT_CONFIG.theme}
          </p>

          <Link
            href="/register"
            className="mt-7 inline-flex items-center justify-center gap-3 border border-royal bg-royal px-6 py-3.5 text-sm font-medium text-white transition-colors duration-300 hover:border-navy hover:bg-navy"
          >
            Register now
            <ArrowRight size={17} />
          </Link>
        </div>

        <nav aria-label="Footer">
          <p className="text-xs font-semibold tracking-[0.18em] text-mist">
            EXPLORE
          </p>

          <ul className="mt-5 space-y-3">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-bodytext transition-colors duration-300 hover:text-royal"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-mist">
            SYMPOSIUM
          </p>

          <dl className="mt-5 space-y-4">
            {symposiumDetails.map((detail) => {
              const Icon = detail.icon;

              const content = (
                <span className="flex items-start gap-3">
                  <Icon
                    size={17}
                    strokeWidth={1.7}
                    className="mt-0.5 shrink-0 text-royal"
                  />

                  <span className="min-w-0">
                    <span className="block text-[10px] font-semibold tracking-[0.16em] text-mist">
                      {detail.label}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-bodytext">
                      {detail.value}
                    </span>
                  </span>
                </span>
              );

              return (
                <dd key={detail.id}>
                  <Link
                    href={detail.href}
                    className="block transition-colors duration-300 hover:text-royal"
                  >
                    {content}
                  </Link>
                </dd>
              );
            })}
          </dl>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-6 text-mist">
          © 2026 {EVENT_CONFIG.name} · {EVENT_CONFIG.institution}
        </p>
        <p className="text-[13px] leading-6 text-mist">
          {EVENT_CONFIG.department} · Patna, Bihar, India
        </p>
      </div>
    </div>
  </motion.footer>
);

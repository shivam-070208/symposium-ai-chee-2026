
"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  UserRound,
} from "lucide-react";

const importantDates = [
  {
    id: "01",
    label: "SYMPOSIUM DAY ONE",
    date: "21 November 2026",
    description: "First day of AI-CHHE 2026.",
    icon: CalendarDays,
    status: "CONFIRMED",
  },
  {
    id: "02",
    label: "SYMPOSIUM DAY TWO",
    date: "22 November 2026",
    description: "Second day of AI-CHHE 2026.",
    icon: CalendarDays,
    status: "CONFIRMED",
  },
  {
    id: "03",
    label: "ABSTRACT SUBMISSION",
    date: "To be announced",
    description: "Submission deadline will be announced by the organisers.",
    icon: FileText,
    status: "COMING SOON",
  },
  {
    id: "04",
    label: "REGISTRATION DEADLINE",
    date: "To be announced",
    description: "Registration deadline will be announced by the organisers.",
    icon: UserRound,
    status: "COMING SOON",
  },
];

export const ImportantDatesSection = () => {
  return (
    <section
      id="important-dates"
      className="relative overflow-hidden bg-paper px-5 py-20 text-navy sm:px-8 sm:py-24 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-12 max-w-3xl sm:mb-16"
        >
          <div className="mb-5 inline-flex items-center gap-2 border border-line bg-white px-4 py-2 text-[10px] font-semibold tracking-[0.2em] text-royal sm:text-xs">
            <CalendarDays size={15} strokeWidth={1.8} />
            <span>IMPORTANT DATES</span>
          </div>

          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl lg:text-6xl">
            Mark your calendar.
            <span className="mt-1 block font-serif font-normal italic text-royal">
              Be part of the conversation.
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-bodytext sm:text-base sm:leading-8">
            Keep track of the symposium dates and upcoming submission and
            registration deadlines for AI-CHHE 2026.
          </p>
        </motion.div>

        {/* Important dates grid */}
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
          {importantDates.map((item, index) => {
            const Icon = item.icon;
            const isConfirmed = item.status === "CONFIRMED";

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.07,
                  ease: "easeOut",
                }}
                className="group border-b border-line py-7 sm:px-7 sm:py-8 [&:nth-child(odd)]:sm:border-r [&:nth-child(odd)]:sm:pl-0 [&:nth-child(even)]:sm:pr-0 [&:nth-child(n+3)]:sm:border-b-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-line text-royal transition-colors duration-300 group-hover:border-royal group-hover:bg-royal group-hover:text-white">
                      <Icon size={20} strokeWidth={1.6} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold tracking-[0.16em] text-mist sm:text-xs">
                        {item.label}
                      </p>

                      <h3 className="mt-3 text-xl font-semibold tracking-tight text-navy sm:text-2xl">
                        {item.date}
                      </h3>

                      <p className="mt-2 max-w-sm text-sm leading-6 text-bodytext">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 pt-0.5 text-[9px] font-semibold tracking-wider sm:text-[10px] ${
                      isConfirmed ? "text-royal" : "text-mist"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Registration CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mt-16 flex flex-col justify-between gap-7 border-y border-line py-8 sm:mt-20 sm:flex-row sm:items-center sm:py-10"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-royal">
              AI-CHHE 2026 · NIT PATNA
            </p>

            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
              Ready to participate?
            </h3>

            <p className="mt-3 text-sm leading-7 text-bodytext sm:text-base">
              Explore registration and abstract submission details for the
              symposium.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:w-auto sm:min-w-[190px]">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-3 border border-royal bg-royal px-6 py-3.5 text-sm font-medium text-white transition-colors duration-300 hover:border-navy hover:bg-navy"
            >
              Register now
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/abstracts"
              className="inline-flex items-center justify-center gap-3 border border-line bg-transparent px-6 py-3.5 text-sm font-medium text-navy transition-colors duration-300 hover:border-royal hover:text-royal"
            >
              Submit an abstract
              <ArrowRight size={17} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

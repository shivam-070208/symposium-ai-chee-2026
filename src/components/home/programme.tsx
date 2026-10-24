
"use client";

import { motion } from "motion/react";
import {
  CalendarDays,
  Clock3,
  ArrowUpRight,
  CalendarClock,
} from "lucide-react";

const programmeDays = [
  {
    number: "01",
    label: "DAY ONE",
    date: "21 November 2026",
    weekday: "Saturday",
  },
  {
    number: "02",
    label: "DAY TWO",
    date: "22 November 2026",
    weekday: "Sunday",
  },
];

export const ProgrammeSection = () => {
  return (
    <section
      id="programme"
      className="relative overflow-hidden bg-paper px-5 py-20 text-navy sm:px-8 sm:py-24 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-14 max-w-3xl sm:mb-16"
        >
          <div className="mb-5 inline-flex items-center gap-2 border border-line bg-white px-4 py-2 text-[10px] font-semibold tracking-[0.2em] text-royal sm:text-xs">
            <CalendarDays size={15} strokeWidth={1.8} />
            <span>EVENT PROGRAMME</span>
          </div>

          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl lg:text-6xl">
            Two days of ideas,
            <span className="mt-1 block font-serif font-normal italic text-royal">
              research &amp; discovery.
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-bodytext sm:text-base sm:leading-8">
            Explore the two-day AI-CHHE 2026 symposium. The detailed session
            schedule and timings will be published once officially confirmed.
          </p>
        </motion.div>

        {/* Programme overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {programmeDays.map((day, index) => (
            <motion.article
              key={day.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className="group border border-line bg-white transition-colors duration-300 hover:border-royal"
            >
              {/* Day heading */}
              <div className="flex items-start justify-between gap-4 border-b border-line p-6 sm:p-8">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-royal">
                    {day.label}
                  </p>

                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
                    {day.date}
                  </h3>

                  <p className="mt-2 text-sm text-mist">{day.weekday}</p>
                </div>

                <span className="font-serif text-5xl font-light tracking-tight text-[#dfe7ef] transition-colors duration-300 group-hover:text-royal sm:text-6xl">
                  {day.number}
                </span>
              </div>

              {/* Schedule status */}
              <div className="flex items-start gap-4 p-6 sm:p-8">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-line text-royal">
                  <CalendarClock size={20} strokeWidth={1.6} />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-medium text-navy">
                    Detailed programme
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-bodytext">
                    Session details and timings will be announced soon.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-xs font-medium tracking-wide text-royal">
                    <Clock3 size={14} />
                    <span>TIME SCHEDULE TO BE ANNOUNCED</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Programme announcement */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-6"
        >
          <p className="max-w-xl text-sm leading-6 text-bodytext">
            The complete symposium schedule will be available here after
            confirmation by the organising committee.
          </p>

          <ArrowUpRight
            size={20}
            strokeWidth={1.5}
            className="shrink-0 text-royal"
            aria-hidden="true"
          />
        </motion.div>
      </div>
    </section>
  );
};

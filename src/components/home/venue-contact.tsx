
"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  MapPin,
  CalendarDays,
  ArrowUpRight,
  Mail,
  Navigation,
} from "lucide-react";

export const VenueContactSection = () => {
  return (
    <section
      id="venue"
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
            <MapPin size={15} strokeWidth={1.8} />
            <span>VENUE & CONTACT</span>
          </div>

          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl lg:text-6xl">
            Join us in
            <span className="mt-1 block font-serif font-normal italic text-royal">
              Patna, India.
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-bodytext sm:text-base sm:leading-8">
            Connect with researchers, academicians, and professionals at
            AI-CHHE 2026, hosted by the Department of Civil Engineering
            at the National Institute of Technology Patna.
          </p>
        </motion.div>

        {/* Venue and contact panels */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Venue panel */}
          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="border border-line bg-white"
          >
            <div className="border-b border-line p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <MapPin size={20} strokeWidth={1.7} className="text-royal" />
                <p className="text-xs font-semibold tracking-[0.18em] text-mist">
                  THE VENUE
                </p>
              </div>

              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
                National Institute of Technology Patna
              </h3>

              <p className="mt-3 text-sm leading-7 text-bodytext">
                Department of Civil Engineering
                <br />
                Patna, Bihar, India
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <CalendarDays
                  size={20}
                  strokeWidth={1.7}
                  className="mt-0.5 shrink-0 text-royal"
                />

                <div>
                  <h4 className="text-sm font-semibold text-navy">
                    Symposium dates
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-bodytext">
                    21–22 November 2026
                  </p>
                </div>
              </div>

              <div className="mt-7 border-t border-line pt-6">
                <p className="text-sm leading-6 text-bodytext">
                  The specific venue, building, and room details will be
                  published once confirmed by the organising committee.
                </p>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=National+Institute+of+Technology+Patna"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-3 border border-line px-5 py-3 text-sm font-medium text-navy transition-colors duration-300 hover:border-royal hover:text-royal"
                >
                  <Navigation size={16} />
                  View campus map
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </motion.article>

          {/* Contact panel */}
          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: "easeOut",
            }}
            className="flex flex-col border border-line bg-white p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <Mail size={20} strokeWidth={1.7} className="text-royal" />
              <p className="text-xs font-semibold tracking-[0.18em] text-mist">
                GET IN TOUCH
              </p>
            </div>

            <h3 className="mt-6 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
              Have a question?
            </h3>

            <p className="mt-4 text-sm leading-7 text-bodytext">
              Need information about registration, abstract submissions,
              or the symposium? Reach out through the official contact
              channel.
            </p>

            <div className="mt-8 border-t border-line pt-6">
              <p className="text-xs font-semibold tracking-[0.15em] text-mist">
                ENQUIRIES
              </p>

              <p className="mt-3 text-sm leading-6 text-bodytext">
                Contact details will be announced by the organising
                committee.
              </p>
            </div>

            <div className="mt-auto pt-8">
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-between gap-4 border border-royal bg-royal px-5 py-4 text-sm font-medium text-white transition-colors duration-300 hover:border-navy hover:bg-navy"
              >
                Contact the organisers
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </motion.article>
        </div>

        {/* Closing note */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mt-10 border-t border-line pt-6"
        >
          <p className="text-sm leading-6 text-bodytext">
            AI-CHHE 2026 · Department of Civil Engineering · NIT Patna
          </p>
        </motion.div>
      </div>
    </section>
  );
};

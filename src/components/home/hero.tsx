
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative isolate min-h-170 overflow-hidden bg-[#F4F8FD] sm:min-h-185 lg:min-h-[calc(100svh-80px)]">
      {/* Campus background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/nit-patna-background.jpg')",
        }}
      />

      {/* White gradient for readable text */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-white via-white/35 to-white/50 sm:via-white/50 sm:to-white/60"
      />

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-linear-to-t from-white/50 to-transparent"
      />

      {/* Hero content */}
      <div className="mx-auto flex min-h-[680px] w-full max-w-[1240px] items-center px-5 py-20 sm:min-h-[740px] sm:px-6 lg:min-h-[calc(100svh-80px)] lg:py-24">
        <div className="max-w-[720px]">
          {/* Eyebrow */}
          <div className="mb-7 inline-flex items-center gap-3">
            <span className="h-px w-9 bg-[#2563EB]" />

            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1D55B5] sm:text-sm">
              National Symposium · NIT Patna
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-[42px] font-bold leading-[1.08] tracking-[-0.045em] text-[#0B1F44] sm:text-6xl lg:text-[76px]">
            AI-CHHE{" "}
            <span className="text-[#1457C5]">2026</span>
          </h1>

          {/* Symposium theme */}
          <h2 className="mt-6 max-w-[650px] text-2xl font-semibold leading-snug tracking-[-0.025em] text-[#18345E] sm:text-3xl lg:text-[36px]">
            From Conventional Hydraulics to Intelligent Water Systems
          </h2>

          {/* Description */}
          <p className="mt-5 max-w-[590px] text-base leading-7 text-[#526784] sm:text-lg sm:leading-8">
            Explore emerging research, computational methods, and intelligent
            approaches shaping the future of hydraulic and water systems.
          </p>

          {/* Event information */}
          <div className="mt-8 flex flex-col gap-4 text-sm font-medium text-[#243C60] sm:flex-row sm:flex-wrap sm:gap-x-7">
            <div className="inline-flex items-center gap-2.5">
              <CalendarDays className="size-[19px] text-[#1457C5]" />
              <span>21–22 November 2026</span>
            </div>

            <div className="inline-flex items-center gap-2.5">
              <MapPin className="size-[19px] text-[#1457C5]" />
              <span>NIT Patna, India</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#0B4AA2] px-7 text-sm font-semibold text-white shadow-md shadow-blue-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#083B85] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Register Now

              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/about"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#C9D7E9] bg-white/75 px-7 text-sm font-semibold text-[#18345E] backdrop-blur-sm transition-colors hover:border-[#1457C5] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Explore Symposium
            </Link>
          </div>

          {/* Supporting text */}
          <p className="mt-6 text-xs leading-5 text-[#637895] sm:text-sm">
            Research · Innovation · Intelligent Water Systems
          </p>
        </div>
      </div>
    </section>
  );
};

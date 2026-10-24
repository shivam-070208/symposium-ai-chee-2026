
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const researchDomains = [
  {
    number: "01",
    title: "Hydraulic Engineering",
    description:
      "The physical principles of fluid flow, hydraulic structures, and water systems.",
  },
  {
    number: "02",
    title: "Computational Modelling",
    description:
      "Numerical methods and simulation for understanding complex hydraulic processes.",
  },
  {
    number: "03",
    title: "Artificial Intelligence",
    description:
      "Data-driven techniques for analysing and modelling water-related systems.",
  },
];

export const AboutSection = () => {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-[#FAF9F6] text-[#202A36]"
    >
      <div className="mx-auto max-w-[1240px] px-5 py-20 sm:px-6 sm:py-28 lg:py-32">
        {/* Section introduction */}
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <span className="h-px w-8 bg-[#245A91]" />

              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#245A91]">
                01 / About the Symposium
              </span>
            </div>

            <h2
              id="about-heading"
              className="max-w-137.5 text-4xl font-semibold leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-[54px]"
            >
              Where hydraulic science meets{" "}
              <span className="text-[#245A91]">
                intelligent computation.
              </span>
            </h2>

            <div className="mt-8 max-w-[510px] space-y-5 text-[15px] leading-7 text-[#596779] sm:text-base sm:leading-8">
              <p>
                Water systems are complex physical environments. Understanding
                their behaviour requires sound engineering principles,
                rigorous mathematical models, and increasingly sophisticated
                computational methods.
              </p>

              <p>
                AI-CHHE 2026 is centred on the intersection of conventional
                hydraulics and intelligent water systems. Its theme,
                “From Conventional Hydraulics to Intelligent Water Systems,”
                highlights the evolving relationship between established
                engineering knowledge and emerging computational approaches.
              </p>
            </div>

            <Link
              href="/themes"
              className="group mt-9 inline-flex items-center gap-2 border-b border-[#245A91]/40 pb-2 text-sm font-semibold text-[#173F70] transition-colors hover:border-[#173F70] hover:text-[#245A91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35699E] focus-visible:ring-offset-4"
            >
              Explore Research Themes
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Research image */}
          <figure className="relative">
            <div className="relative aspect-[5/4] overflow-hidden bg-[#E9EFF6]">
              <Image
                src="/hydraulic-research.jpg"
                alt="Hydraulic engineering research, water flow, or computational fluid dynamics"
                fill
                priority={false}
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#102D50]/75 via-transparent to-transparent"
              />

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
                  Research · Engineering · Innovation
                </span>

                <p className="mt-2 max-w-md text-xl font-medium leading-snug text-white sm:text-2xl">
                  Advancing the understanding of water systems.
                </p>
              </div>
            </div>

            <figcaption className="mt-3 flex items-center justify-between gap-4 text-[11px] text-[#748092]">
              <span>AI-CHHE 2026</span>
              <span className="text-right">
                From physical systems to computational methods
              </span>
            </figcaption>
          </figure>
        </div>

        {/* Research domains */}
        <div className="mt-20 border-y border-[#D8D9D5] sm:mt-28">
          <div className="flex flex-col gap-3 py-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#245A91]">
                Areas of intersection
              </p>

              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                Three connected disciplines
              </h3>
            </div>

            <p className="max-w-md text-sm leading-6 text-[#697586]">
              Established engineering principles and emerging computational
              methods offer complementary ways to investigate water systems.
            </p>
          </div>

          <div className="grid border-t border-[#D8D9D5] md:grid-cols-3">
            {researchDomains.map((domain, index) => (
              <article
                key={domain.number}
                className={`py-7 sm:py-8 md:pr-7 ${
                  index > 0
                    ? "border-t border-[#D8D9D5] md:border-l md:border-t-0 md:pl-7"
                    : ""
                }`}
              >
                <span className="text-xs font-medium tabular-nums text-[#245A91]">
                  {domain.number}
                </span>

                <h4 className="mt-5 text-lg font-semibold tracking-[-0.02em]">
                  {domain.title}
                </h4>

                <p className="mt-3 max-w-sm text-sm leading-6 text-[#697586]">
                  {domain.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Closing statement */}
        <div className="mt-12 flex flex-col gap-5 sm:mt-16 sm:flex-row sm:items-start sm:justify-between">
          <h3 className="max-w-[510px] text-2xl font-medium leading-snug tracking-[-0.035em] sm:text-3xl">
            Connecting established science with emerging research methods.
          </h3>

          <p className="max-w-md text-sm leading-7 text-[#697586]">
            The symposium theme creates space to explore how hydraulic
            engineering, numerical modelling, and intelligent computational
            methods relate to the future study of water systems.
          </p>
        </div>
      </div>
    </section>
  );
};

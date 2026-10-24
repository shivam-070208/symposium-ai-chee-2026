
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  ChartNoAxesCombined,
  Droplets,
  Waves,
} from "lucide-react";

const researchThemes = [
  {
    number: "01",
    title: "Hydraulics & Fluid Mechanics",
    subtitle: "FLOW PHENOMENA & EXPERIMENTAL HYDRAULICS",
    description:
      "Explore pipe flow, open-channel flow, turbulence, and experimental hydraulics to understand fundamental fluid behaviour and hydraulic processes.",
    icon: Waves,
  },
  {
    number: "02",
    title: "River & Open-Channel Engineering",
    subtitle: "RIVER HYDRAULICS & SEDIMENT TRANSPORT",
    description:
      "Investigate river hydraulics, sediment transport, river morphology, scour, and confluences to address complex challenges in river engineering.",
    icon: Droplets,
  },
  {
    number: "03",
    title: "Hydraulic Structures",
    subtitle: "INFRASTRUCTURE & HYDRAULIC MODELLING",
    description:
      "Explore dams, spillways, weirs, bridges, energy dissipation, and hydraulic modelling for the analysis and design of hydraulic infrastructure.",
    icon: Waves,
  },
  {
    number: "04",
    title: "Hydrology & Water Resources",
    subtitle: "WATER SECURITY & RESOURCE MANAGEMENT",
    description:
      "Address floods, droughts, watershed management, groundwater, and water security through scientific analysis and modern water-resource approaches.",
    icon: Droplets,
  },
  {
    number: "05",
    title: "Computational Hydraulics & CFD",
    subtitle: "SIMULATION & NUMERICAL METHODS",
    description:
      "Explore numerical modelling, computational fluid dynamics, turbulence modelling, and multiphase flow to understand complex hydraulic phenomena.",
    icon: Waves,
  },
  {
    number: "06",
    title: "AI/ML & Smart Water Systems",
    subtitle: "INTELLIGENT MODELLING & PREDICTIVE ANALYTICS",
    description:
      "Investigate artificial intelligence, machine learning, IoT, GIS, remote sensing, and digital twins for intelligent monitoring and data-driven water systems.",
    icon: BrainCircuit,
  },
  {
    number: "07",
    title: "Climate-Resilient & Sustainable Water Management",
    subtitle: "CLIMATE ADAPTATION & SUSTAINABLE SOLUTIONS",
    description:
      "Explore climate change adaptation, nature-based solutions, water reuse, and sustainable infrastructure to build resilient water-management systems.",
    icon: ChartNoAxesCombined,
  },
];

export const ThemesSection = () => {
  return (
    <section
      id="themes"
      aria-labelledby="themes-heading"
      className="bg-white text-[#202A36]"
    >
      <div className="mx-auto max-w-[1240px] px-5 py-20 sm:px-6 sm:py-28 lg:py-32">
        {/* Section heading */}
        <div className="grid gap-8 lg:grid-cols-[1fr_0.65fr] lg:items-end lg:gap-16">
          <div>
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-8 bg-[#245A91]" />

              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#245A91]">
                02 / Research Themes
              </span>
            </div>

            <h2
              id="themes-heading"
              className="max-w-[680px] text-4xl font-semibold leading-[1.1] tracking-[-0.045em] sm:text-5xl lg:text-[60px]"
            >
              Research at the intersection of{" "}
              <span className="text-[#245A91]">
                hydraulics and intelligence.
              </span>
            </h2>
          </div>

          <div className="lg:pb-2">
            <p className="max-w-[460px] text-[15px] leading-7 text-[#596779] sm:text-base sm:leading-8">
              Discover research directions connecting established hydraulic
              engineering principles with computational modelling,
              artificial intelligence, and emerging approaches to water
              systems.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[#748092]">
              <span className="size-2 rounded-full bg-[#245A91]" />
              Four proposed research areas
            </div>
          </div>
        </div>

        {/* Research theme list */}
        <div className="mt-14 border-t border-[#E1E0DC] sm:mt-20">
          {researchThemes.map((theme) => {
            const Icon = theme.icon;

            return (
              <article
                key={theme.number}
                className="group grid gap-5 border-b border-[#E1E0DC] py-8 transition-colors duration-200 hover:bg-[#FAF9F6] sm:gap-8 sm:py-10 md:grid-cols-[64px_1fr_1fr_36px] md:items-center md:px-4"
              >
                {/* Number */}
                <span className="text-xs font-medium tabular-nums text-[#8A929D]">
                  {theme.number}
                </span>

                {/* Theme title */}
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <Icon
                      aria-hidden="true"
                      className="size-[19px] text-[#245A91]"
                      strokeWidth={1.6}
                    />

                    <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#748092] sm:text-[10px]">
                      {theme.subtitle}
                    </span>
                  </div>

                  <h3 className="max-w-md text-xl font-semibold leading-snug tracking-[-0.025em] text-[#202A36] transition-colors group-hover:text-[#245A91] sm:text-2xl">
                    {theme.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="max-w-lg text-sm leading-7 text-[#697586] sm:text-[15px]">
                  {theme.description}
                </p>

                {/* Decorative arrow */}
                <ArrowDownRight
                  aria-hidden="true"
                  className="hidden size-5 text-[#245A91] transition-transform duration-200 group-hover:translate-x-1 group-hover:translate-y-1 md:block"
                  strokeWidth={1.5}
                />
              </article>
            );
          })}
        </div>

        {/* Bottom statement */}
        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-7 text-[#697586]">
            The central theme connects physical understanding, computational
            analysis, and intelligent approaches to water-related research.
          </p>

          <Link
            href="/register"
            className="group inline-flex w-fit shrink-0 items-center gap-2 border-b border-[#245A91]/40 pb-2 text-sm font-semibold text-[#173F70] transition-colors hover:border-[#173F70] hover:text-[#245A91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35699E] focus-visible:ring-offset-4"
          >
            Participate in the Symposium
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

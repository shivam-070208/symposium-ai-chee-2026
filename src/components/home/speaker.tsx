
"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ArrowUpRight, Mic2 } from "lucide-react";

const speakers = [
  {
    id: "01",
    name: "Prof. Kishanjit Kumar Khatua",
    title: "Professor",
    affiliation: "National Institute of Technology Rourkela",
    image: "/speakers/prof-kkkhatua.png",
  },
  {
    id: "02",
    name: "Dr. Pankaj Mani",
    title: "Scientist 'G' & Head",
    affiliation:
      "National Institute of Hydrology, Centre for Flood Management Studies (CFMS)",
    image: "/speakers/dr-pankajmani.png",
  },
  {
    id: "03",
    name: "Dr. Mohit Prakash Mohanty",
    title: "Associate Professor",
    affiliation:
      "Department of Water Resources Management, Indian Institute of Technology Roorkee",
    image: "/speakers/dr-mohitprakashmohanty.png",
  },
  {
    id: "04",
    name: "Dr. Ashutosh Sharma",
    title: "Associate Professor",
    affiliation: "Department of Hydrology, Indian Institute of Technology Roorkee",
    image: "/speakers/dr-ashutoshsharma.png",
  },
  {
    id: "05",
    name: "Dr. Kesheo Prasad",
    title: "Assistant Professor",
    affiliation:
      "Department of Civil Engineering, Indian Institute of Technology (BHU) Varanasi, UP",
    image: "/speakers/dr-kesheoprasad.png",
  },
  {
    id: "06",
    name: "Dr. Kamalini Devi",
    title: "Assistant Professor",
    affiliation:
      "Department of Civil Engineering, National Institute of Technology Warangal",
    image: "/speakers/dr-kamalinidevi.png",
  },
  {
    id: "07",
    name: "Dr. Manish Pandey",
    title: "Assistant Professor",
    affiliation:
      "Department of Civil Engineering, Indian Institute of Technology Kharagpur",
    image: "/speakers/dr-manishpandey.png",
  },
  {
    id: "08",
    name: "Dr. Abhishek Kumar Pandey",
    title: "Assistant Professor",
    affiliation:
      "Department of Civil Engineering, Indian Institute of Technology (ISM) Dhanbad",
    image: "/speakers/dr-abhishekkumarpandey.png",
  },
  {
    id: "09",
    name: "Dr. Gaurav Misuriya",
    title: "Assistant Professor",
    affiliation:
      "Department of Civil Engineering, Indian Institute of Technology Kharagpur",
    image: "/speakers/dr-gauravmisuriya.png",
  },
  {
    id: "10",
    name: "Dr. Jnana Ranjan Khuntia",
    title: "Assistant Professor",
    affiliation:
      "Department of Civil Engineering, Chaitanya Bharathi Institute of Technology (CBIT)",
    image: "/speakers/dr-jnanaranjankhuntia.png",
  },
];

export const SpeakersSection = () => {
  return (
    <section
      id="speakers"
      className="relative overflow-hidden bg-paper px-5 py-20 text-navy sm:px-8 sm:py-24 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mx-auto mb-14 max-w-3xl text-center sm:mb-16"
        >
          <div className="mb-6 inline-flex items-center gap-2.5 border border-line bg-white px-4 py-2 text-[10px] font-semibold tracking-[0.22em] text-royal sm:text-xs">
            <Mic2 size={15} strokeWidth={1.8} />
            <span>INVITED SPEAKERS</span>
          </div>

          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl lg:text-6xl">
            Voices shaping the
            <span className="mt-1 block font-serif font-normal italic text-royal">
              future of water.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-bodytext sm:text-base sm:leading-8">
            Meet the experts and researchers exploring the intersection of
            artificial intelligence, computational fluid dynamics, and
            next-generation hydrology and hydraulic engineering.
          </p>

          {/* Minimal divider */}
          <div className="mx-auto mt-8 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-line" />
            <span className="h-1.5 w-1.5 rotate-45 bg-royal" />
            <span className="h-px w-12 bg-line" />
          </div>
        </motion.div>

        {/* Flat speaker cards */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-5">
          {speakers.map((speaker, index) => (
            <motion.article
              key={speaker.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.55,
                delay: index * 0.09,
                ease: "easeOut",
              }}
              whileHover={{ y: -4 }}
              className="group w-full min-w-0 border border-line bg-white transition-colors duration-300 hover:border-royal sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-0.9375rem)]"
            >
              {/* Portrait */}
              <div className="relative aspect-[4/4.5] overflow-hidden bg-transparent">
                <Image
                  src={speaker.image}
                  alt={speaker.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                />

                {/* Portrait overlay */}
                <div
                  aria-hidden="true"
                  style={{
                    background:
                      "linear-gradient(to top, color-mix(in srgb, var(--foreground) 72%, transparent), transparent)",
                  }}
                  className="absolute inset-0"
                />

                {/* Designation */}
                <div className="absolute bottom-4 left-4 right-4">
                  <span
                    style={{
                      borderColor: "color-mix(in srgb, var(--card) 30%, transparent)",
                      background: "color-mix(in srgb, var(--foreground) 20%, transparent)",
                      color: "var(--card)",
                    }}
                    className="inline-flex max-w-full border px-3 py-2 text-xs font-medium leading-4 backdrop-blur-sm"
                  >
                    {speaker.title}
                  </span>
                </div>
              </div>

              {/* Speaker details */}
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold tracking-tight text-navy transition-colors duration-300 group-hover:text-royal">
                      {speaker.name}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-mist">
                      {speaker.affiliation}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-line text-mist transition-colors duration-300 group-hover:border-royal group-hover:bg-royal group-hover:text-white">
                    <ArrowUpRight size={17} strokeWidth={1.8} />
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

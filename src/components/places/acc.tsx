
"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "motion/react";

export type Place = {
  readonly title: string;
  readonly location: string;
  readonly description: string;
  readonly image: string;
};

type AccProps = {
  readonly place: Place;
  readonly index: number;
};

export const Acc = ({ place, index }: AccProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

 
  const inset = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [20, 0, 20]
  );

  const clipPath = useMotionTemplate`
    inset(${inset}% 0% ${inset}% 0%)
  `;

  // Subtle alternating vertical parallax.
  const drift = index % 2 === 0 ? 24 : -24;

  const y = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [drift, 0, -drift]
  );

  return (
    <div
      ref={ref}
      className="group relative aspect-[4/3] overflow-hidden rounded-lg"
    >
      {/* Scroll-driven reveal */}
      <motion.div
        style={{ clipPath }}
        className="absolute inset-0"
      >
        {/* Oversized image prevents empty edges during movement */}
        <motion.div
          style={{ y, scale: 1.1 }}
          className="absolute inset-0"
        >
          <Image
            src={place.image}
            alt={place.title}
            fill
            unoptimized
            sizes="50vw"
            className="object-cover transition-[filter,transform] duration-500 ease-out group-hover:scale-105 group-hover:blur-[2px] sm:group-hover:blur-[3px]"
          />
        </motion.div>

        {/* Optional gradient overlay */}
        {/* 
        <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        */}

        {/* Place details */}
        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-2.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:p-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/60 sm:text-[10px]">
            {place.location}
          </p>

          <h3 className="mt-0.5 text-[13px] font-semibold leading-tight text-white sm:mt-1 sm:text-[19px]">
            {place.title}
          </h3>

          <p className="mt-0.5 text-[10px] leading-snug text-white/75 sm:mt-1 sm:text-[13px]">
            {place.description}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

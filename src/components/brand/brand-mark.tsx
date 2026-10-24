import Image from "next/image";
import { cn } from "cn";
import { SITE_ASSETS } from "@/lib/site-assets";

type BrandMarkProps = {
  readonly className?: string;
  readonly markClassName?: string;
};

export const BrandMark = ({
  className,
  markClassName,
}: BrandMarkProps) => (
  <span className={cn("inline-flex items-center gap-2.5", className)}>
    <Image
      src={SITE_ASSETS.logo.src}
      alt={SITE_ASSETS.logo.alt}
      width={SITE_ASSETS.logo.width}
      height={SITE_ASSETS.logo.height}
      className={cn("size-9 shrink-0 object-contain", markClassName)}
      priority={false}
    />
    <span className="flex flex-col leading-none">
      <span className="font-display text-[19px] tracking-[-0.01em]">
        AI-CHHE
      </span>
      <span className="mt-1 font-mono text-[9px] tracking-[0.32em] opacity-55">
        2026
      </span>
    </span>
  </span>
);

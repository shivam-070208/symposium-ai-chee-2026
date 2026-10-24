import type { ComponentProps } from "react";
import { cn } from "cn";

export const Input = ({ className, type, ...props }: ComponentProps<"input">) => (
  <input
    type={type}
    data-slot="input"
    className={cn(
      "h-[44px] w-full min-w-0 rounded-lg border border-line bg-white px-3 text-[14px] font-normal text-navy outline-none transition-colors placeholder:text-mist focus-visible:border-royal focus-visible:ring-2 focus-visible:ring-royal/15 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-mist aria-[invalid=true]:border-errorred aria-[invalid=true]:focus-visible:ring-errorred/15",
      className,
    )}
    {...props}
  />
);

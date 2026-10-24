import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-[14px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-royal/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-royal text-white hover:bg-navy",
        outline:
          "border border-line bg-white text-navy hover:border-royal hover:text-royal",
        ghost: "text-bodytext hover:bg-ice hover:text-royal",
        link: "text-royal underline underline-offset-4 hover:text-navy",
      },
      size: {
        default: "h-11 px-5",
        lg: "h-[46px] px-5",
        sm: "h-9 px-3 text-[13px]",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    readonly asChild?: boolean;
  };

export const Button = ({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) => {
  const Component = asChild ? Slot.Root : "button";

  return (
    <Component
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};

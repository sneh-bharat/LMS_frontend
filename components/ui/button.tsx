"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80 shadow-sm",
        outline:
          "border-slate-200 bg-background hover:bg-slate-50 hover:text-slate-900 aria-expanded:bg-slate-50 aria-expanded:text-slate-900 font-bold",
        secondary:
          "bg-slate-100 text-slate-900理论 hover:bg-slate-200 aria-expanded:bg-slate-200 aria-expanded:text-slate-900 font-bold",
        ghost:
          "hover:bg-slate-50 hover:text-slate-900 aria-expanded:bg-slate-50 aria-expanded:text-slate-900 font-bold",
        destructive:
          "bg-rose-50 text-rose-600 hover:bg-rose-100 focus-visible:ring-rose-200 font-bold",
        link: "text-primary underline-offset-4 hover:underline font-bold",
        gradient: "custom-gradient text-white shadow-md shadow-green-500/10 hover:shadow-lg transition-all active:scale-[0.98] font-black uppercase tracking-widest",
      },
      size: {
        default: "h-10 px-6 py-2 rounded-xl",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
export default Button

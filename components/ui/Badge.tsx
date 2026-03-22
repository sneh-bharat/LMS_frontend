import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-xl font-black uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-100 text-emerald-700",
        danger: "border-transparent bg-rose-100 text-rose-700",
        warning: "border-transparent bg-amber-100 text-amber-700",
        info: "border-transparent bg-sky-100 text-sky-700",
        primary: "border-transparent bg-blue-600 text-white shadow-lg shadow-blue-500/20",
        gradient: "custom-gradient text-white shadow-md shadow-green-500/10",
      },
      size: {
        default: "text-[10px] px-3 py-1",
        sm: "text-[9px] px-2 py-0.5",
        md: "text-[10px] px-3 py-1",
        lg: "text-[11px] px-4 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
export default Badge

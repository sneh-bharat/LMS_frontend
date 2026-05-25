"use client"

import * as React from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface RightDrawerProps {
    isOpen: boolean
    onClose: () => void
    title?: React.ReactNode | string
    description?: React.ReactNode | string
    children: React.ReactNode
    footer?: React.ReactNode
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | string
}

export function RightDrawer({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    maxWidth = "md",
}: RightDrawerProps) {
    const maxWidthClass = {
        sm: "sm:!max-w-[400px] sm:w-[400px]",
        md: "sm:!max-w-[500px] sm:w-[500px]",
        lg: "sm:!max-w-[650px] sm:w-[650px]",
        xl: "sm:!max-w-[800px] sm:w-[800px]",
        "2xl": "sm:!max-w-[1000px] sm:w-[1000px]",
        full: "sm:!max-w-[min(96vw,1600px)] sm:w-[min(96vw,1600px)]",
    }[maxWidth] || "sm:!max-w-[500px] sm:w-[500px]"

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                className={cn(
                    "flex flex-col h-full bg-white p-0 border-l border-slate-200 shadow-2xl transition-all duration-300 ease-in-out",
                    // Mobile & Desktop FULL HEIGHT stuck to right edge
                    "w-full data-[side=right]:w-full data-[side=right]:right-0 data-[side=right]:inset-y-0",
                    maxWidthClass
                )}
            >
                <SheetHeader className="p-6 border-b border-white/20 custom-gradient pr-12 text-left">
                    <SheetTitle className="text-xl font-bold text-white tracking-tight leading-none mb-1">
                        {title}
                    </SheetTitle>
                    {description && (
                        <SheetDescription className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                            {description}
                        </SheetDescription>
                    )}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {children}
                </div>

                {footer && (
                    <SheetFooter className="p-6 bg-slate-50 border-t border-slate-100 sm:flex-row gap-3">
                        {footer}
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default RightDrawer

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
    title: string
    description?: string
    children: React.ReactNode
    footer?: React.ReactNode
    maxWidth?: string
}

export function RightDrawer({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    maxWidth = "sm",
}: RightDrawerProps) {
    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                className={cn(
                    "flex flex-col h-full bg-white p-0 border-l border-slate-200 shadow-2xl",
                    maxWidth === "sm" ? "sm:max-w-md" : "sm:max-w-xl"
                )}
            >
                <SheetHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">
                        {title}
                    </SheetTitle>
                    {description && (
                        <SheetDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            {description}
                        </SheetDescription>
                    )}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>

                {footer && (
                    <SheetFooter className="p-6 bg-slate-50/50 border-t border-slate-100 sm:flex-row gap-3">
                        {footer}
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default RightDrawer

"use client"

import * as React from "react"
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmAlertDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    description?: string
    isLoading?: boolean
    confirmText?: string
    cancelText?: string
    variant?: "default" | "success" | "warning" | "destructive"
}

export function ConfirmAlertDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    isLoading = false,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "success",
}: ConfirmAlertDialogProps) {
    const variantConfig = {
        default: {
            icon: <AlertCircle size={24} />,
            iconBg: "bg-slate-50",
            iconColor: "text-slate-500",
            confirmBtn: "bg-slate-900 hover:bg-slate-800",
        },
        success: {
            icon: <CheckCircle2 size={24} />,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
            confirmBtn: "bg-emerald-600 hover:bg-emerald-700",
        },
        warning: {
            icon: <AlertCircle size={24} />,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-500",
            confirmBtn: "bg-amber-600 hover:bg-amber-700",
        },
        destructive: {
            icon: <AlertCircle size={24} />,
            iconBg: "bg-rose-50",
            iconColor: "text-rose-500",
            confirmBtn: "bg-rose-600 hover:bg-rose-700",
        },
    }

    const config = variantConfig[variant]

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] border-slate-100 shadow-2xl" showCloseButton={!isLoading}>
                <DialogHeader className="flex flex-col items-center text-center gap-4 py-4">
                    <div className={`w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center ${config.iconColor} shadow-inner`}>
                        {config.icon}
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-xl font-bold text-slate-900">{title}</DialogTitle>
                        <DialogDescription className="text-slate-500 leading-relaxed">
                            {description}
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:flex-1 font-bold text-slate-600 border-slate-200"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`w-full sm:flex-1 font-bold text-white shadow-md flex items-center justify-center gap-2 ${config.confirmBtn}`}
                    >
                        {isLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : null}
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

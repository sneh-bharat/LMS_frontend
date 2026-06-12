"use client"

import * as React from "react"
import { AlertCircle, Loader2, Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteAlertDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    description?: string
    isLoading?: boolean
}

export function DeleteAlertDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Patient Record",
    description = "Are you sure you want to permanently delete this patient record? This action cannot be undone and all associated data will be lost.",
    isLoading = false,
}: DeleteAlertDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] border-rose-100 shadow-2xl shadow-rose-500/10" showCloseButton={!isLoading}>
                <DialogHeader className="flex flex-col items-center text-center gap-4 py-4">
                    <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 shadow-inner">
                        <Trash2 size={24} />
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
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full sm:flex-1 font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Trash2 size={16} />
                        )}
                        Confirm Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

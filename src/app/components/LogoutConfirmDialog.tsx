"use client"

import * as React from "react"
import { LogOut, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface LogoutConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isLoading?: boolean
}

export function LogoutConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
}: LogoutConfirmDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] border-slate-100 shadow-2xl" showCloseButton={!isLoading}>
                <DialogHeader className="flex flex-col items-center text-center gap-4 py-4">
                    <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 shadow-inner">
                        <LogOut size={24} />
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-xl font-bold text-slate-900">Confirm Logout</DialogTitle>
                        <DialogDescription className="text-slate-500 leading-relaxed text-sm">
                            Are you sure you want to end your session? You will need to log in again to access the dashboard.
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:flex-1 font-bold text-slate-600 border-slate-200 hover:bg-slate-50"
                    >
                        Stay Logged In
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
                            <LogOut size={16} />
                        )}
                        Confirm Logout
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

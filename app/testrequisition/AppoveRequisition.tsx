'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { Label } from '@/components/ui';
import { useApproveTestRequisition } from '@/app/Apis/testRequest/useTestRequisitions';

const LABEL_CLS = 'text-xs font-bold text-slate-700 uppercase tracking-widest';
const FORM_ID = 'approve-requisition-form';

export interface ApproveRequisitionProps {
  isOpen: boolean;
  onClose: () => void;
  requisitionId: number | null;
  branchId: number | null;
  requisitionNumber?: string | null;
  onSuccess?: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-rose-600 flex items-center gap-1">
      <AlertCircle size={12} aria-hidden /> {message}
    </p>
  );
}

export default function ApproveRequisition({
  isOpen,
  onClose,
  requisitionId,
  branchId,
  requisitionNumber,
  onSuccess,
}: ApproveRequisitionProps) {
  const [approvalNotes, setApprovalNotes] = useState('');
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const approveMutation = useApproveTestRequisition();

  useEffect(() => {
    if (!isOpen) return;
    setApprovalNotes('');
    setError('');
  }, [isOpen, requisitionId]);

  const handleClose = () => {
    if (approveMutation.isPending) return;
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (requisitionId == null || requisitionId <= 0) {
      toast.error('Requisition id is missing.');
      return;
    }

    if (branchId == null || branchId <= 0) {
      toast.error('Branch id is missing for this requisition.');
      return;
    }

    const notes = approvalNotes.trim();
    if (!notes) {
      setError('Approval notes are required.');
      return;
    }

    approveMutation.mutate(
      {
        requisitionId,
        payload: {
          approvalNotes: notes,
          branchId,
        },
      },
      {
        onSuccess: (res) => {
          if (res?.response === false) {
            toast.error(res.message || 'Failed to approve requisition.');
            return;
          }
          toast.success(res.message?.trim() || 'Requisition approved successfully.');
          onSuccess?.();
          onClose();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to approve requisition.');
        },
      }
    );
  };

  const pending = approveMutation.isPending;
  const displayNumber =
    requisitionNumber?.trim() ||
    (requisitionId != null ? `ID ${requisitionId}` : '—');

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-white" size={22} aria-hidden />
          <span>
            Approve <span className="text-emerald-200">Requisition</span>
          </span>
        </div>
      }
      description={displayNumber}
      maxWidth="md"
      footer={
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={pending}
            className="flex-1 font-bold border-slate-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="gradient"
            disabled={pending || !requisitionId || !branchId}
            className="flex-1 font-bold"
            onClick={() => formRef.current?.requestSubmit()}
          >
            {pending ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={16} aria-hidden />
                Approving…
              </span>
            ) : (
              'Approve requisition'
            )}
          </Button>
        </div>
      }
    >
      <form
        ref={formRef}
        id={FORM_ID}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 flex items-start gap-3">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <FileText size={20} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Requisition
            </p>
            <p className="text-sm font-bold text-slate-900 font-mono truncate">
              {displayNumber}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="approvalNotes" className={LABEL_CLS}>
            Approval notes *
          </Label>
          <textarea
            id="approvalNotes"
            value={approvalNotes}
            onChange={(e) => {
              setApprovalNotes(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter approval notes for this requisition"
            rows={4}
            disabled={pending}
            className="flex w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <FieldError message={error} />
        </div>
      </form>
    </RightDrawer>
  );
}

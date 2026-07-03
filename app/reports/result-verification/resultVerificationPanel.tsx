'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Loader2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { Label } from '@/components/ui';
import { useSubmitResultApproval } from '@/app/Apis/Report/useReportEntry';
import type { PendingVerificationItem } from '@/app/Apis/Report/reportApi';
import {
  getCreatedByName,
  getLoggedInRole,
} from '@/app/utils/loggedInUser';

export type VerificationPanelMode = 'view' | 'verify';

interface ResultVerificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  row: PendingVerificationItem | null;
  mode?: VerificationPanelMode;
  onSuccess?: () => void;
}

const APPROVER_ROLES = [
  'PATHOLOGIST',
  'LAB_TECHNICIAN',
  'BIOCHEMIST',
  'MICROBIOLOGIST',
  'ADMIN',
] as const;

function formatRange(
  low: number | null | undefined,
  high: number | null | undefined,
): string {
  if (low != null && high != null) return `${low} – ${high}`;
  if (low != null) return `≥ ${low}`;
  if (high != null) return `≤ ${high}`;
  return '—';
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? value : dt.toLocaleString();
}

export default function ResultVerificationPanel({
  isOpen,
  onClose,
  row,
  mode = 'verify',
  onSuccess,
}: ResultVerificationPanelProps) {
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [approverRole, setApproverRole] = useState('PATHOLOGIST');

  const approverName = getCreatedByName();
  const approvalMutation = useSubmitResultApproval();
  const isPending = approvalMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      setComments(row?.comments ?? '');
      setRejectionReason('');
      setActionTaken('');
      const role = getLoggedInRole();
      setApproverRole(
        APPROVER_ROLES.includes(role as (typeof APPROVER_ROLES)[number])
          ? role
          : 'PATHOLOGIST',
      );
    }
  }, [isOpen, row]);

  const handleClose = () => {
    setComments('');
    setRejectionReason('');
    setActionTaken('');
    onClose();
  };

  const submitApproval = (
    approvalStatus: 'APPROVED' | 'REJECTED',
    extra?: { rejectionReason?: string; actionTaken?: string },
  ) => {
    if (!row?.resultId) return;

    approvalMutation.mutate(
      {
        resultId: row.resultId,
        approverName,
        approverRole,
        approvalStatus,
        comments: comments.trim() || null,
        rejectionReason: extra?.rejectionReason?.trim() || null,
        actionTaken: extra?.actionTaken?.trim() || null,
      },
      {
        onSuccess: (res) => {
          const status = res?.data?.resultStatus || res?.data?.approvalStatus;
          const isReject = approvalStatus === 'REJECTED';
          toast.success(
            res?.message ||
              (isReject
                ? 'Result rejected successfully.'
                : 'Result approved successfully.'),
            {
              description: isReject
                ? status
                  ? `Result reverted to ${status}.`
                  : 'Result reverted to DRAFT status.'
                : status
                  ? `Status: ${status}`
                  : undefined,
            },
          );
          handleClose();
          onSuccess?.();
        },
        onError: (err: Error) => {
          toast.error(
            err?.message ||
              (approvalStatus === 'REJECTED'
                ? 'Failed to reject result.'
                : 'Failed to approve result.'),
          );
        },
      },
    );
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    submitApproval('APPROVED', {
      actionTaken: actionTaken.trim() || 'Approved for release',
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }
    if (!actionTaken.trim()) {
      toast.error('Action taken is required (e.g. Returned for re-testing).');
      return;
    }

    submitApproval('REJECTED', {
      rejectionReason: rejectionReason.trim(),
      actionTaken: actionTaken.trim(),
    });
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <span className="flex items-center gap-2">
          <FileCheck size={20} />
          {mode === 'verify' ? 'Approve / Reject Result' : 'Result Details'}
        </span>
      }
      description={
        row
          ? `${row.parameterName || 'Parameter'} — Result #${row.resultId}`
          : undefined
      }
      maxWidth="md"
      footer={
        mode === 'verify' ? (
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold border-slate-200"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold text-rose-600 border-rose-200 hover:bg-rose-50 gap-2"
              onClick={handleReject}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <XCircle size={16} />
              )}
              Reject
            </Button>
            <Button
              type="submit"
              form="approve-result-form"
              size="sm"
              className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Approve
            </Button>
          </div>
        ) : (
          <div className="flex justify-end w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        )
      }
    >
      {row ? (
        <div className="space-y-5">
          {row.isCritical && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
              <AlertTriangle size={16} className="shrink-0" />
              Critical value — review carefully before approval.
            </div>
          )}

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-black text-slate-900">
                {row.resultValue}
              </span>
              {row.unit && (
                <span className="text-xs font-bold text-slate-500 uppercase">
                  {row.unit}
                </span>
              )}
              <Badge variant="secondary" className="text-[10px] font-bold">
                {row.abnormalFlag || '—'}
              </Badge>
              <Badge variant="warning" className="text-[10px] font-bold">
                {row.resultStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Result ID
                </p>
                <p className="font-mono font-semibold text-slate-700">
                  {row.resultId}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Reference
                </p>
                <p className="font-semibold text-slate-700">
                  {formatRange(row.referenceLow, row.referenceHigh)}
                </p>
              </div>
            </div>

            {row.clinicalInterpretation && (
              <p className="text-xs text-slate-600 border-t border-slate-200 pt-3">
                <span className="font-bold text-slate-500">Interpretation: </span>
                {row.clinicalInterpretation}
              </p>
            )}
          </div>

          {mode === 'verify' ? (
            <form
              id="approve-result-form"
              onSubmit={handleApprove}
              className="space-y-4"
            >
              <input type="hidden" name="resultId" value={row.resultId} />

              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="approverName" className="text-xs font-bold">
                    Approver name
                  </Label>
                  <input
                    id="approverName"
                    name="approverName"
                    type="text"
                    value={approverName}
                    readOnly
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="approverRole" className="text-xs font-bold">
                    Approver role
                  </Label>
                  <select
                    id="approverRole"
                    name="approverRole"
                    value={approverRole}
                    onChange={(e) => setApproverRole(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                  >
                    {APPROVER_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="comments" className="text-xs font-bold">
                    Comments
                  </Label>
                  <textarea
                    id="comments"
                    name="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={2}
                    placeholder="e.g. Result value seems inconsistent"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white resize-none"
                  />
                </div>

                <div className="space-y-1.5 border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">
                    Required for reject
                  </p>
                  <Label htmlFor="rejectionReason" className="text-xs font-bold">
                    Rejection reason
                  </Label>
                  <textarea
                    id="rejectionReason"
                    name="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                    placeholder="e.g. Value outside expected clinical range"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 focus:bg-white resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="actionTaken" className="text-xs font-bold">
                    Action taken
                  </Label>
                  <input
                    id="actionTaken"
                    name="actionTaken"
                    type="text"
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    placeholder="e.g. Returned for re-testing"
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white"
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-2 text-xs text-slate-600">
              {row.comments ? (
                <p>
                  <span className="font-bold text-slate-500">Comments: </span>
                  {row.comments}
                </p>
              ) : null}
              <p>
                <span className="font-bold text-slate-500">Entered at: </span>
                {formatDateTime(row.enteredAt)}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </RightDrawer>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { Input, Label } from '@/components/ui';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';
import {
  DEFAULT_ORDER_PRIORITY,
  ORDER_PRIORITIES,
  normalizeOrderPriority,
  type OrderPriorityValue,
} from '@/app/Apis/booking/orderPriority';
import {
  buildUpdateTestRequisitionPayload,
  canEditTestRequisition,
  type TestRequisitionDetail,
} from '@/app/Apis/testRequest/TestRequestApi';
import {
  useTestRequisitionById,
  useUpdateTestRequisition,
} from '@/app/Apis/testRequest/useTestRequisitions';
import { getCreatedByName } from '@/app/utils/loggedInUser';

const LABEL_CLS = 'text-xs font-bold text-slate-700 uppercase tracking-widest';
const FORM_ID = 'edit-requisition-form';

const SELECT_BASE =
  'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

function selectCls(hasError?: boolean) {
  return `${SELECT_BASE} ${hasError ? 'border-rose-300' : 'border-input'}`;
}

function inputCls(hasError?: boolean) {
  return hasError ? 'border-rose-300' : 'border-slate-200';
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-rose-600 flex items-center gap-1">
      <AlertCircle size={12} aria-hidden /> {message}
    </p>
  );
}

function moneyFromDetail(value: number | null | undefined): string {
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : '0';
}

function discountFromDetail(detail: TestRequisitionDetail): string {
  const concession = Number(detail.concessionAmount);
  if (Number.isFinite(concession) && concession > 0) return String(concession);
  return '0';
}

function populateFormFromDetail(detail: TestRequisitionDetail) {
  return {
    priority: normalizeOrderPriority(detail.priority) as OrderPriorityValue,
    clinicalNotes: detail.clinicalNotes?.trim() ?? '',
    clinicalDiagnosis: detail.clinicalDiagnosis?.trim() ?? '',
    drugAllergy: detail.drugAllergy?.trim() ?? '',
    isEmergency: Boolean(detail.isEmergency),
    collectionDate: detail.collectionDate?.trim().slice(0, 10) ?? '',
    collectionTime: detail.collectionTime?.trim().slice(0, 5) ?? '',
    expectedReportDate: detail.expectedReportDate?.trim().slice(0, 10) ?? '',
    totalAmount: moneyFromDetail(detail.totalAmount),
    discountAmount: discountFromDetail(detail),
    netAmount: moneyFromDetail(detail.netAmount),
    branchId: detail.branchId && detail.branchId > 0 ? detail.branchId : 0,
  };
}

export interface EditRequisitionProps {
  isOpen: boolean;
  onClose: () => void;
  requisitionId: number | null;
  requisitionNumber?: string | null;
  onSuccess?: () => void;
}

export default function EditRequisition({
  isOpen,
  onClose,
  requisitionId,
  requisitionNumber,
  onSuccess,
}: EditRequisitionProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const updateMutation = useUpdateTestRequisition();
  const detailQuery = useTestRequisitionById(requisitionId, isOpen);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [priority, setPriority] = useState<OrderPriorityValue>(DEFAULT_ORDER_PRIORITY);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');
  const [drugAllergy, setDrugAllergy] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [collectionDate, setCollectionDate] = useState('');
  const [collectionTime, setCollectionTime] = useState('');
  const [expectedReportDate, setExpectedReportDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('0');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [netAmount, setNetAmount] = useState('0');
  const [branchId, setBranchId] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const detail = detailQuery.data?.data ?? null;
  const pending = updateMutation.isPending;
  const loadingDetail = detailQuery.isLoading;
  const editable = detail ? canEditTestRequisition(detail) : true;

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
  }, [isOpen, requisitionId]);

  useEffect(() => {
    if (!isOpen || !detail) return;
    const form = populateFormFromDetail(detail);
    setPriority(form.priority);
    setClinicalNotes(form.clinicalNotes);
    setClinicalDiagnosis(form.clinicalDiagnosis);
    setDrugAllergy(form.drugAllergy);
    setIsEmergency(form.isEmergency);
    setCollectionDate(form.collectionDate);
    setCollectionTime(form.collectionTime);
    setExpectedReportDate(form.expectedReportDate);
    setTotalAmount(form.totalAmount);
    setDiscountAmount(form.discountAmount);
    setNetAmount(form.netAmount);
    setBranchId(form.branchId);
  }, [isOpen, detail]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    (async () => {
      setLoadingBranches(true);
      try {
        const res = await branchApi.listBranchesAll({ page: 0, size: 200 });
        if (cancelled) return;
        const list = res?.data?.content ?? [];
        setBranches(list);
      } catch {
        if (!cancelled) setBranches([]);
      } finally {
        if (!cancelled) setLoadingBranches(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleClose = () => {
    if (pending) return;
    onClose();
  };

  const recalcNet = (total: string, discount: string) => {
    const t = Number(total) || 0;
    const d = Number(discount) || 0;
    setNetAmount(String(Math.max(0, Math.round((t - d) * 100) / 100)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (requisitionId == null || requisitionId <= 0) {
      toast.error('Requisition id is missing.');
      return;
    }

    if (!detail) {
      toast.error('Requisition details are not loaded yet.');
      return;
    }

    if (!canEditTestRequisition(detail)) {
      toast.error('Only DRAFT or SUBMITTED requisitions can be edited.');
      return;
    }

    const nextErrors: Record<string, string> = {};
    if (!collectionDate.trim()) nextErrors.collectionDate = 'Collection date is required.';
    if (branchId <= 0) nextErrors.branchId = 'Branch is required.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = buildUpdateTestRequisitionPayload({
      initial: detail,
      priority,
      clinicalNotes,
      clinicalDiagnosis,
      drugAllergy,
      isEmergency,
      collectionDate: collectionDate.trim(),
      collectionTime: collectionTime.trim(),
      expectedReportDate: expectedReportDate.trim(),
      totalAmount: Number(totalAmount) || 0,
      discountAmount: Number(discountAmount) || 0,
      netAmount: Number(netAmount) || 0,
      branchId,
      updatedByName: getCreatedByName(),
    });

    const changedKeys = Object.keys(payload).filter((k) => k !== 'updatedByName');
    if (changedKeys.length === 0) {
      toast.info('No changes to save.');
      return;
    }

    updateMutation.mutate(
      { requisitionId, payload },
      {
        onSuccess: (res) => {
          if (res?.response === false) {
            toast.error(res.message || 'Failed to update requisition.');
            return;
          }
          toast.success(res.message?.trim() || 'Requisition updated successfully.');
          onSuccess?.();
          onClose();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to update requisition.');
        },
      },
    );
  };

  const displayNumber =
    requisitionNumber?.trim() ||
    detail?.requisitionNumber?.trim() ||
    (requisitionId != null ? `ID ${requisitionId}` : '—');

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <Pencil className="text-white" size={22} aria-hidden />
          <span>
            Edit <span className="text-emerald-200">Requisition</span>
          </span>
        </div>
      }
      description={displayNumber}
      maxWidth="lg"
      footer={
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            className="flex-1 font-bold"
            onClick={handleClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="gradient"
            className="flex-1 font-bold gap-2"
            disabled={pending || loadingDetail || !detail || !editable}
          >
            {pending ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      }
    >
      {loadingDetail ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
          <Loader2 size={28} className="animate-spin text-emerald-500" aria-hidden />
          <p className="text-sm font-medium">Loading requisition…</p>
        </div>
      ) : detailQuery.isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {detailQuery.error instanceof Error
            ? detailQuery.error.message
            : 'Failed to load requisition.'}
        </div>
      ) : detail && !editable ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This requisition cannot be edited. Only DRAFT or SUBMITTED requisitions can be updated.
        </div>
      ) : (
        <form
          id={FORM_ID}
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-6 pb-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-priority" className={LABEL_CLS}>
                Priority
              </Label>
              <select
                id="edit-priority"
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value as OrderPriorityValue);
                  clearError('priority');
                }}
                className={selectCls(!!errors.priority)}
                disabled={pending}
              >
                {ORDER_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <FieldError message={errors.priority} />
            </div>

            <div className="space-y-2 flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  disabled={pending}
                  className="rounded border-slate-300"
                />
                <span className="text-sm font-bold text-slate-700">Emergency</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-collectionDate" className={LABEL_CLS}>
                Collection date *
              </Label>
              <Input
                id="edit-collectionDate"
                type="date"
                value={collectionDate}
                onChange={(e) => {
                  setCollectionDate(e.target.value);
                  clearError('collectionDate');
                }}
                className={inputCls(!!errors.collectionDate)}
                disabled={pending}
              />
              <FieldError message={errors.collectionDate} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-collectionTime" className={LABEL_CLS}>
                Collection time
              </Label>
              <Input
                id="edit-collectionTime"
                type="time"
                value={collectionTime}
                onChange={(e) => setCollectionTime(e.target.value)}
                className={inputCls()}
                disabled={pending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-expectedReportDate" className={LABEL_CLS}>
              Expected report date
            </Label>
            <Input
              id="edit-expectedReportDate"
              type="date"
              value={expectedReportDate}
              onChange={(e) => setExpectedReportDate(e.target.value)}
              className={inputCls()}
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-clinicalNotes" className={LABEL_CLS}>
              Clinical notes
            </Label>
            <textarea
              id="edit-clinicalNotes"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={3}
              disabled={pending}
              className="flex w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-clinicalDiagnosis" className={LABEL_CLS}>
              Clinical diagnosis
            </Label>
            <textarea
              id="edit-clinicalDiagnosis"
              value={clinicalDiagnosis}
              onChange={(e) => setClinicalDiagnosis(e.target.value)}
              rows={2}
              disabled={pending}
              className="flex w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-drugAllergy" className={LABEL_CLS}>
              Drug allergy
            </Label>
            <Input
              id="edit-drugAllergy"
              value={drugAllergy}
              onChange={(e) => setDrugAllergy(e.target.value)}
              className={inputCls()}
              disabled={pending}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="edit-totalAmount" className={LABEL_CLS}>
                Total amount
              </Label>
              <Input
                id="edit-totalAmount"
                type="number"
                min={0}
                step="0.01"
                value={totalAmount}
                onChange={(e) => {
                  setTotalAmount(e.target.value);
                  recalcNet(e.target.value, discountAmount);
                }}
                className={inputCls()}
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-discountAmount" className={LABEL_CLS}>
                Discount / concession
              </Label>
              <Input
                id="edit-discountAmount"
                type="number"
                min={0}
                step="0.01"
                value={discountAmount}
                onChange={(e) => {
                  setDiscountAmount(e.target.value);
                  recalcNet(totalAmount, e.target.value);
                }}
                className={inputCls()}
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-netAmount" className={LABEL_CLS}>
                Net amount
              </Label>
              <Input
                id="edit-netAmount"
                type="number"
                min={0}
                step="0.01"
                value={netAmount}
                onChange={(e) => setNetAmount(e.target.value)}
                className={inputCls()}
                disabled={pending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-branchId" className={LABEL_CLS}>
              Branch *
            </Label>
            {loadingBranches ? (
              <p className="text-xs text-slate-500">Loading branches…</p>
            ) : (
              <select
                id="edit-branchId"
                value={branchId || ''}
                onChange={(e) => {
                  setBranchId(Number(e.target.value) || 0);
                  clearError('branchId');
                }}
                className={selectCls(!!errors.branchId)}
                disabled={pending || branches.length === 0}
              >
                <option value="" disabled>
                  Select branch
                </option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            )}
            <FieldError message={errors.branchId} />
          </div>
        </form>
      )}
    </RightDrawer>
  );
}

'use client';

import { useState, type ComponentType, type ReactNode } from 'react';
import {
  AlertCircle,
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  FlaskConical,
  Loader2,
  Stethoscope,
  Trash2,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, RightDrawer } from '@/components/ui';
import { ConfirmAlertDialog } from '@/components/ui/confirm-alert-dialog';
import {
  canModifyRequisitionTests,
  formatRequisitionCurrency,
  formatRequisitionDate,
  requisitionDetailToDiseases,
  type TestRequisitionDetail,
  type TestRequisitionDetailItem,
} from '@/app/Apis/testRequest/TestRequestApi';
import {
  useDeleteTestRequisitionItem,
  useTestRequisitionById,
} from '@/app/Apis/testRequest/useTestRequisitions';

function displayValue(value: string | number | null | undefined): string {
  if (value == null) return '—';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '—';
  const text = value.trim();
  return text || '—';
}

function formatDateTime(value?: string | null): string {
  if (!value?.trim()) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusBadgeVariant(status: string | null | undefined) {
  const s = status?.trim().toUpperCase() ?? '';
  if (['APPROVED', 'ACTIVE', 'PAID', 'COMPLETED'].includes(s)) return 'success' as const;
  if (['PENDING', 'DRAFT', 'SUBMITTED', 'IN_PROGRESS', 'UNPAID'].includes(s)) return 'warning' as const;
  if (['REJECTED', 'CANCELLED', 'FAILED'].includes(s)) return 'destructive' as const;
  return 'secondary' as const;
}

function DetailField({
  label,
  value,
  icon: Icon,
  mono,
}: {
  label: string;
  value: string | number | null | undefined;
  icon?: ComponentType<{ size?: number; className?: string }>;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
        {Icon ? <Icon size={10} className="text-emerald-500 shrink-0" /> : null}
        {label}
      </label>
      <p className={`text-sm font-bold text-slate-900 break-words ${mono ? 'font-mono' : ''}`}>
        {displayValue(value)}
      </p>
    </div>
  );
}

function DetailsSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
        <Icon size={14} className="text-emerald-500" />
        {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 rounded-xl border border-slate-100 bg-white p-4">
        {children}
      </div>
    </div>
  );
}

function getTestItemLabel(item: TestRequisitionDetailItem): string {
  if (item.testName?.trim()) return item.testName.trim();
  if (item.testCode?.trim()) return item.testCode.trim();
  return `Test #${item.testId}`;
}

function RequisitionDetailsBody({
  detail,
  canRemoveTests,
  onRemoveTest,
  removingItemId,
}: {
  detail: TestRequisitionDetail;
  canRemoveTests: boolean;
  onRemoveTest: (item: TestRequisitionDetailItem) => void;
  removingItemId: number | null;
}) {
  const items = detail.requisitionItems ?? [];
  const diseases = requisitionDetailToDiseases(detail);
  const hasApproval =
    detail.approvedBy ||
    detail.approvedByName ||
    detail.approvedDateTime ||
    detail.approvalNotes;
  const hasRejection =
    detail.rejectedBy || detail.rejectedDateTime || detail.rejectionReason;
  const hasConversion = detail.convertedToOrderId || detail.convertedDateTime;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight truncate">
            {displayValue(detail.requisitionNumber)}
          </h3>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            ID {detail.id}
            {detail.requestId ? ` · ${detail.requestId}` : ''}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant={statusBadgeVariant(detail.requisitionStatus)} className="font-black text-[10px] uppercase">
              {displayValue(detail.requisitionStatus)}
            </Badge>
            <Badge variant={statusBadgeVariant(detail.paymentStatus)} className="font-black text-[10px] uppercase">
              {displayValue(detail.paymentStatus)}
            </Badge>
            <Badge variant="secondary" className="font-black text-[10px] uppercase">
              {displayValue(detail.priority)}
            </Badge>
            {detail.isEmergency ? (
              <Badge variant="destructive" className="font-black text-[10px] uppercase">
                Emergency
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <DetailsSection title="Patient" icon={User}>
        <DetailField label="Patient name" value={detail.patientName} icon={User} />
        <DetailField label="Patient code" value={detail.patientCode} mono />
        <DetailField label="Gender" value={detail.gender} />
        <DetailField label="Age" value={detail.age} />
      </DetailsSection>

      <DetailsSection title="Requisition" icon={ClipboardList}>
        <DetailField label="Requisition date" value={formatRequisitionDate(detail.requisitionDate)} icon={Calendar} />
        <DetailField label="SRF ID" value={detail.srfId} mono />
        <DetailField label="Company Name" value={detail.tenantId} mono />
        <DetailField label="Branch Name" value={detail.branchId} mono />
      </DetailsSection>

      <DetailsSection title="Provider Information" icon={Stethoscope}>
        <DetailField label="Doctor" value={detail.referringDoctorName} icon={Stethoscope} />

        <DetailField label="Referrer " value={detail.referrerName} />

      </DetailsSection>

      <DetailsSection title="Clinical" icon={FileText}>
        <DetailField label="Clinical notes" value={detail.clinicalNotes} />
        <DetailField label="Clinical diagnosis" value={detail.clinicalDiagnosis} />
        <DetailField label="Drug allergy" value={detail.drugAllergy} />
        <DetailField label="LMP date" value={formatRequisitionDate(detail.lmpDate)} icon={Calendar} />
        <div className="sm:col-span-2">
          <DetailField
            label="Pre-existing conditions"
            value={diseases.length > 0 ? diseases.join(', ') : 'None documented'}
          />
        </div>
      </DetailsSection>

      <DetailsSection title="Collection & Report" icon={Calendar}>
        <DetailField label="Collection date" value={formatRequisitionDate(detail.collectionDate)} icon={Calendar} />
        <DetailField label="Collection time" value={detail.collectionTime} mono />
        <DetailField label="Expected report date" value={formatRequisitionDate(detail.expectedReportDate)} icon={Calendar} />
        <DetailField label="Actual report date" value={formatRequisitionDate(detail.actualReportDate)} icon={Calendar} />
        <DetailField
          label="Turnaround time (hours)"
          value={detail.turnaroundTimeHours != null ? detail.turnaroundTimeHours : null}
          mono
        />
      </DetailsSection>

      <DetailsSection title="Payment" icon={CreditCard}>
        <DetailField label="Total amount" value={formatRequisitionCurrency(detail.totalAmount)} mono />
        <DetailField label="Concession amount" value={formatRequisitionCurrency(detail.concessionAmount)} mono />
        <DetailField label="Emergency charge" value={formatRequisitionCurrency(detail.emergencyCharge)} mono />
        <DetailField label="Net amount" value={formatRequisitionCurrency(detail.netAmount)} mono />
        {(detail.paidAmount ?? 0) > 0 ? (
          <DetailField label="Paid amount" value={formatRequisitionCurrency(detail.paidAmount)} mono />
        ) : null}
        {(detail.pendingAmount ?? 0) > 0 ? (
            <DetailField label="Pending amount" value={formatRequisitionCurrency(detail.pendingAmount)} mono />
        ) : null}
        
        <DetailField label="Concession by" value={detail.concessionBy} />
      </DetailsSection>

      {hasApproval ? (
        <DetailsSection title="Approval" icon={ClipboardList}>
          <DetailField label="Approved by" value={detail.approvedByName ?? detail.approvedBy} />
          <DetailField label="Approved at" value={formatDateTime(detail.approvedDateTime)} icon={Calendar} />
          <div className="sm:col-span-2">
            <DetailField label="Approval notes" value={detail.approvalNotes} />
          </div>
        </DetailsSection>
      ) : null}

      {hasRejection ? (
        <DetailsSection title="Rejection" icon={AlertCircle}>
          <DetailField label="Rejected by" value={detail.rejectedBy} />
          <DetailField label="Rejected at" value={formatDateTime(detail.rejectedDateTime)} icon={Calendar} />
          <div className="sm:col-span-2">
            <DetailField label="Rejection reason" value={detail.rejectionReason} />
          </div>
        </DetailsSection>
      ) : null}

      {hasConversion ? (
        <DetailsSection title="Conversion" icon={ClipboardList}>
          <DetailField label="Converted order ID" value={detail.convertedToOrderId} mono />
          <DetailField label="Converted at" value={formatDateTime(detail.convertedDateTime)} icon={Calendar} />
        </DetailsSection>
      ) : null}

      <DetailsSection title={`Tests (${items.length})`} icon={FlaskConical}>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500 sm:col-span-2">No tests on this requisition.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">{getTestItemLabel(item)}</p>
                <div className="flex items-center gap-2">
                  {item.isActive === false ? (
                    <Badge variant="secondary" className="text-[10px] font-black uppercase">
                      Inactive
                    </Badge>
                  ) : null}
                  {canRemoveTests && item.isActive !== false && item.id > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
                      disabled={removingItemId === item.id}
                      onClick={() => onRemoveTest(item)}
                    >
                      {removingItemId === item.id ? (
                        <Loader2 size={14} className="animate-spin" aria-hidden />
                      ) : (
                        <Trash2 size={14} aria-hidden />
                      )}
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Code: {displayValue(item.testCode)} · Qty: {displayValue(item.quantity)} · Price:{' '}
                {formatRequisitionCurrency(item.testPrice)} · Net: {formatRequisitionCurrency(item.netPrice)}
              </p>
              {(item.categoryName || item.departmentName || item.sampleType || item.vialType) && (
                <p className="text-xs text-slate-400 mt-1">
                  {[item.categoryName, item.departmentName, item.sampleType, item.vialType]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              {item.specialInstructions?.trim() ? (
                <p className="text-xs text-slate-500 mt-1">Instructions: {item.specialInstructions}</p>
              ) : null}
            </div>
          ))
        )}
      </DetailsSection>

      <DetailsSection title="Audit" icon={User}>
        <DetailField label="Created by" value={detail.createdBy} icon={User} />
        <DetailField label="Created at" value={formatDateTime(detail.createdAt)} icon={Calendar} />
        <DetailField label="Updated at" value={formatDateTime(detail.updatedAt)} icon={Calendar} />
      </DetailsSection>
    </div>
  );
}

export interface DetailsRequisitionProps {
  isOpen: boolean;
  onClose: () => void;
  requisitionId: number | null;
}

export default function DetailsRequisition({
  isOpen,
  onClose,
  requisitionId,
}: DetailsRequisitionProps) {
  const [removeTarget, setRemoveTarget] = useState<TestRequisitionDetailItem | null>(null);
  const deleteItemMutation = useDeleteTestRequisitionItem();

  const {
    data: detailRes,
    isLoading,
    isError,
    error,
    refetch,
  } = useTestRequisitionById(requisitionId, isOpen);

  const detail = detailRes?.data ?? null;
  const canRemoveTests = detail ? canModifyRequisitionTests(detail) : false;
  const removingItemId = deleteItemMutation.isPending ? removeTarget?.id ?? null : null;

  const handleConfirmRemove = () => {
    if (!requisitionId || requisitionId <= 0 || !removeTarget?.id) return;

    deleteItemMutation.mutate(
      { requisitionId, itemId: removeTarget.id },
      {
        onSuccess: (res) => {
          toast.success(res.message?.trim() || 'Test removed from requisition.');
          setRemoveTarget(null);
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to remove test.');
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <ConfirmAlertDialog
        isOpen={Boolean(removeTarget)}
        onClose={() => {
          if (!deleteItemMutation.isPending) setRemoveTarget(null);
        }}
        onConfirm={handleConfirmRemove}
        title="Remove test"
        description={`Remove "${removeTarget ? getTestItemLabel(removeTarget) : 'this test'}" from this requisition?`}
        confirmText="Remove test"
        cancelText="Keep test"
        variant="warning"
        isLoading={deleteItemMutation.isPending}
      />

      <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Requisition details"
      description={
        detail?.requisitionNumber
          ? `${detail.requisitionNumber} · ID ${detail.id}`
          : requisitionId && requisitionId > 0
            ? `Requisition ID ${requisitionId}`
            : 'Select a requisition to view details.'
      }
      maxWidth="xl"
      footer={
        <div className="flex w-full gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 font-bold border-slate-200"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-emerald-600" aria-hidden />
          <p className="text-sm font-medium">Loading requisition details…</p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle size={32} className="text-rose-500 shrink-0" aria-hidden />
          <p className="text-sm font-semibold text-rose-800">
            {error instanceof Error ? error.message : 'Failed to load requisition details.'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="font-bold bg-white"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
        </div>
      ) : detail ? (
        <RequisitionDetailsBody
          detail={detail}
          canRemoveTests={canRemoveTests}
          onRemoveTest={setRemoveTarget}
          removingItemId={removingItemId}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <ClipboardList size={64} className="mb-4 text-slate-200" strokeWidth={1} aria-hidden />
          <p className="text-sm font-bold text-slate-900">No requisition details available</p>
        </div>
      )}
    </RightDrawer>
    </>
  );
}

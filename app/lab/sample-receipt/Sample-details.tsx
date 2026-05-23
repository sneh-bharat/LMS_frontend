'use client';

import { useState } from 'react';
import {
  FlaskConical,
  User,
  Package,
  Calendar,
  Hash,
  MapPin,
  Thermometer,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Edit2,
  RefreshCcw,
  FileText,
  Beaker,
  ClipboardList,
  Barcode,
  Trash2,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { useSampleById } from '@/app/Apis/booking/useSamples';
import UpdateSampleStatus from '@/app/lab/sample-receipt/update-sample-status';
import type { Sample } from '@/app/Apis/booking/sample';
import {
  formatSampleDateTime,
  formatSampleStatusLabel,
  formatSampleTypeLabel,
  getSampleCollectionDateTime,
  getSampleConditionLabel,
  getSampleDisplayCode,
  getSampleStatusLabel,
  resolveSampleTestNames,
} from '@/app/Apis/booking/sample';

export interface SampleDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  sampleId: number | null;
  onEdit?: (sample: Sample) => void;
}

function DetailField({
  label,
  value,
  icon: Icon,
  mono,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
        {Icon ? <Icon size={10} /> : null}
        {label}
      </label>
      <p className={`text-sm font-bold text-slate-900 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  );
}

function SectionTitle({
  title,
  icon: Icon,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
      <Icon size={14} className="text-emerald-500" />
      {title}
    </h4>
  );
}

function WorkflowStatusBadge({ status }: { status: ReturnType<typeof getSampleStatusLabel> }) {
  const config = {
    pending: { variant: 'warning' as const, label: 'Pending', icon: Clock },
    accepted: { variant: 'success' as const, label: 'Accepted', icon: CheckCircle2 },
    rejected: { variant: 'destructive' as const, label: 'Rejected', icon: XCircle },
  };
  const { variant, label, icon: Icon } = config[status];
  return (
    <Badge variant={variant} className="gap-1.5 px-3 py-1 text-[10px] font-bold uppercase">
      <Icon size={12} />
      {label}
    </Badge>
  );
}

function ConditionBadge({
  condition,
  rawLabel,
}: {
  condition?: ReturnType<typeof getSampleConditionLabel>;
  rawLabel?: string | null;
}) {
  if (condition) {
    const labels = {
      good: 'Good',
      haemolysed: 'Haemolysed',
      clotted: 'Clotted',
      insufficient: 'Insufficient',
      leaked: 'Leaked',
    };
    const variants = {
      good: 'success' as const,
      haemolysed: 'destructive' as const,
      clotted: 'warning' as const,
      insufficient: 'warning' as const,
      leaked: 'destructive' as const,
    };
    return (
      <Badge variant={variants[condition]} className="px-3 py-1 text-[10px] font-bold uppercase">
        {labels[condition]}
      </Badge>
    );
  }
  if (rawLabel?.trim()) {
    return (
      <Badge variant="secondary" className="px-3 py-1 text-[10px] font-bold uppercase">
        {rawLabel.trim()}
      </Badge>
    );
  }
  return null;
}

export function SampleDetails({ isOpen, onClose, sampleId, onEdit }: SampleDetailsProps) {
  const [statusFormOpen, setStatusFormOpen] = useState(false);

  const {
    data: sampleRes,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSampleById(isOpen ? sampleId : null);

  const sample = sampleRes?.data ?? null;
  const loading = isLoading || isFetching;

  const testNames = sample ? resolveSampleTestNames(sample) : [];
  const workflowStatus = sample ? getSampleStatusLabel(sample) : 'pending';
  const condition = sample ? getSampleConditionLabel(sample) : undefined;
  const displayCode = sample ? getSampleDisplayCode(sample) : '—';
  const apiStatus = sample?.sampleStatus ?? sample?.status ?? null;
  const hasPatientInfo = Boolean(
    sample?.patientName?.trim() || sample?.patientCode?.trim() || sample?.patientId != null
  );
  const hasReceiptInfo = Boolean(
    sample?.receivedDateTime ||
      sample?.receivedDate ||
      sample?.receivedBy?.trim() ||
      sample?.temperatureOnArrival?.trim() ||
      sample?.acceptanceDecision?.trim() ||
      sample?.acceptanceStatus?.trim()
  );
  const hasRejectionInfo = Boolean(
    sample?.rejectionReason?.trim() ||
      sample?.rejectedBy?.trim() ||
      sample?.rejectedDateTime
  );
  const hasDisposalInfo = Boolean(
    sample?.disposalDateTime || sample?.disposalMethod?.trim()
  );
  const hasNotes = Boolean(sample?.remarks?.trim() || sample?.chainOfCustodyNotes?.trim());

  return (
    <>
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <FlaskConical className="text-white" size={24} />
          <span>
            Sample <span className="text-emerald-200">Details</span>
          </span>
        </div>
      }
      description={sample ? displayCode : 'View complete sample information'}
      maxWidth="xl"
      footer={
        <div className="flex flex-wrap gap-3 w-full">
          <Button variant="outline" onClick={onClose} className="flex-1 min-w-[7rem]">
            Close
          </Button>
          {sample ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStatusFormOpen(true)}
              className="flex-1 min-w-[7rem] gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <RefreshCcw size={16} />
              Update Status
            </Button>
          ) : null}
          {onEdit && sample ? (
            <Button variant="gradient" onClick={() => onEdit(sample)} className="flex-1 min-w-[7rem] gap-2">
              <Edit2 size={18} />
              Edit Sample
            </Button>
          ) : null}
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
          <Loader2 size={28} className="animate-spin text-emerald-600" />
          <span className="text-sm font-semibold">Loading sample details…</span>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 space-y-4">
          <div className="flex items-start gap-3 text-rose-700">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">Failed to load sample</p>
              <p className="text-xs font-medium mt-1">
                {error instanceof Error ? error.message : 'Could not fetch sample details.'}
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" className="font-bold" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !sample ? (
        <div className="py-16 text-center text-sm font-medium text-slate-500">No sample selected.</div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Header */}
          <div className="flex items-start justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-16 h-16 shrink-0 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-50">
                <FlaskConical size={32} />
              </div>
              <div className="min-w-0">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-mono truncate">
                  {displayCode}
                </h3>
                {sample.sampleLabel?.trim() && sample.sampleLabel !== displayCode ? (
                  <p className="text-xs font-bold text-slate-500 mt-0.5 font-mono">
                    Label: {sample.sampleLabel}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {apiStatus ? (
                    <Badge variant="primary" className="text-[10px] font-bold uppercase px-3 py-1">
                      {formatSampleStatusLabel(apiStatus)}
                    </Badge>
                  ) : null}
                  <WorkflowStatusBadge status={workflowStatus} />
                  <ConditionBadge
                    condition={condition}
                    rawLabel={sample.sampleCondition ?? sample.condition}
                  />
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase">
                    {formatSampleTypeLabel(sample.sampleType)}
                  </Badge>
                  {sample.isActive === false ? (
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase">
                      Inactive
                    </Badge>
                  ) : null}
                  {sample.isDeleted ? (
                    <Badge variant="destructive" className="text-[10px] font-bold uppercase gap-1">
                      <Trash2 size={10} />
                      Deleted
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
                Sample ID
              </div>
              <div className="text-xl font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 inline-block">
                #{sample.id}
              </div>
            </div>
          </div>

          {/* Sample identification */}
          <div className="space-y-4">
            <SectionTitle title="Sample Identification" icon={Barcode} />
            <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <DetailField
                label="Sample Barcode"
                value={sample.sampleBarcode?.trim() || '—'}
                icon={Barcode}
                mono
              />
              <DetailField label="Sample Label" value={sample.sampleLabel?.trim() || '—'} icon={FileText} mono />
              <DetailField
                label="Sample Status"
                value={formatSampleStatusLabel(apiStatus)}
                icon={ClipboardList}
              />
              <DetailField
                label="Sample Condition"
                value={sample.sampleCondition?.trim() || sample.condition?.trim() || '—'}
                icon={CheckCircle2}
              />
              <DetailField label="Sample Type" value={formatSampleTypeLabel(sample.sampleType)} icon={FlaskConical} />
              <DetailField label="Sample Volume" value={sample.sampleVolume?.trim() || '—'} icon={Beaker} />
            </div>
          </div>

          {/* Order */}
          <div className="space-y-4">
            <SectionTitle title="Order" icon={Package} />
            <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <DetailField
                label="Order ID"
                value={sample.orderId != null ? String(sample.orderId) : '—'}
                icon={Package}
              />
              <DetailField
                label="Order Number"
                value={sample.orderNumber?.trim() || '—'}
                icon={Hash}
                mono
              />
            </div>
          </div>

          {/* Patient (only when API returns patient fields) */}
          {hasPatientInfo ? (
            <div className="space-y-4">
              <SectionTitle title="Patient" icon={User} />
              <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <DetailField label="Patient Name" value={sample.patientName?.trim() || '—'} icon={User} />
                <DetailField
                  label="Patient Code"
                  value={sample.patientCode?.trim() || '—'}
                  icon={Hash}
                  mono
                />
                <DetailField
                  label="Patient ID"
                  value={sample.patientId != null ? String(sample.patientId) : '—'}
                  icon={Hash}
                />
              </div>
            </div>
          ) : null}

          {/* Tests (list endpoint may include these) */}
          {testNames.length > 0 ? (
            <div className="space-y-4">
              <SectionTitle title="Tests" icon={Beaker} />
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex flex-wrap gap-2">
                  {testNames.map((name) => (
                    <Badge key={name} variant="primary" className="text-[10px] font-bold px-3 py-1">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Collection */}
          <div className="space-y-4">
            <SectionTitle title="Collection" icon={Calendar} />
            <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <DetailField
                label="Collection Date & Time"
                value={formatSampleDateTime(getSampleCollectionDateTime(sample))}
                icon={Calendar}
              />
              <DetailField label="Collected By" value={sample.collectedBy?.trim() || '—'} icon={User} />
              <DetailField
                label="Collection Method"
                value={sample.collectionMethod?.trim() || '—'}
                icon={ClipboardList}
              />
              <DetailField
                label="Collection Site"
                value={sample.collectionSite?.trim() || '—'}
                icon={MapPin}
              />
              <DetailField
                label="Temperature at Collection"
                value={sample.temperature?.trim() || '—'}
                icon={Thermometer}
              />
              <DetailField
                label="Created At"
                value={formatSampleDateTime(sample.createdAt)}
                icon={Clock}
              />
              <DetailField
                label="Updated At"
                value={formatSampleDateTime(sample.updatedAt)}
                icon={Clock}
              />
            </div>
          </div>

          {/* Storage */}
          <div className="space-y-4">
            <SectionTitle title="Storage" icon={MapPin} />
            <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <DetailField
                label="Storage Location"
                value={sample.storageLocation?.trim() || '—'}
                icon={MapPin}
              />
              <DetailField
                label="Storage Temperature"
                value={sample.storageTemperature?.trim() || '—'}
                icon={Thermometer}
              />
              <DetailField
                label="Expiry Date & Time"
                value={formatSampleDateTime(sample.expiryDateTime)}
                icon={Calendar}
              />
              {sample.departmentRouting?.trim() ? (
                <DetailField
                  label="Department Routing"
                  value={sample.departmentRouting}
                  icon={MapPin}
                />
              ) : null}
              {sample.aliquotingRequired != null ? (
                <DetailField
                  label="Aliquoting Required"
                  value={sample.aliquotingRequired ? 'Yes' : 'No'}
                  icon={FlaskConical}
                />
              ) : null}
              {sample.numberOfAliquots != null ? (
                <DetailField
                  label="Number of Aliquots"
                  value={String(sample.numberOfAliquots)}
                  icon={Hash}
                />
              ) : null}
            </div>
          </div>

          {/* Receipt & acceptance */}
          {hasReceiptInfo ? (
            <div className="space-y-4">
              <SectionTitle title="Receipt & Acceptance" icon={CheckCircle2} />
              <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <DetailField
                  label="Received At"
                  value={formatSampleDateTime(
                    sample.receivedDateTime ??
                      (sample.receivedDate && sample.receivedTime
                        ? `${sample.receivedDate}T${sample.receivedTime}`
                        : sample.receivedDate)
                  )}
                  icon={Calendar}
                />
                <DetailField label="Received By" value={sample.receivedBy?.trim() || '—'} icon={User} />
                <DetailField
                  label="Temperature on Arrival"
                  value={sample.temperatureOnArrival?.trim() || '—'}
                  icon={Thermometer}
                />
                <DetailField
                  label="Acceptance Decision"
                  value={sample.acceptanceDecision?.trim() || '—'}
                  icon={CheckCircle2}
                />
                <DetailField
                  label="Acceptance Status"
                  value={sample.acceptanceStatus?.trim() || '—'}
                  icon={ClipboardList}
                />
              </div>
            </div>
          ) : null}

          {/* Rejection */}
          {hasRejectionInfo ? (
            <div className="space-y-4">
              <SectionTitle title="Rejection" icon={XCircle} />
              <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-rose-100 bg-rose-50/30">
                <DetailField
                  label="Rejected At"
                  value={formatSampleDateTime(sample.rejectedDateTime)}
                  icon={Calendar}
                />
                <DetailField label="Rejected By" value={sample.rejectedBy?.trim() || '—'} icon={User} />
                {sample.rejectionReason?.trim() ? (
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1">
                      <XCircle size={10} />
                      Rejection Reason
                    </label>
                    <p className="text-sm font-bold text-rose-700">{sample.rejectionReason}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Disposal */}
          {hasDisposalInfo ? (
            <div className="space-y-4">
              <SectionTitle title="Disposal" icon={Trash2} />
              <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <DetailField
                  label="Disposal Date & Time"
                  value={formatSampleDateTime(sample.disposalDateTime)}
                  icon={Calendar}
                />
                <DetailField
                  label="Disposal Method"
                  value={sample.disposalMethod?.trim() || '—'}
                  icon={Trash2}
                />
              </div>
            </div>
          ) : null}

          {/* Notes */}
          {hasNotes ? (
            <div className="space-y-4">
              <SectionTitle title="Notes" icon={FileText} />
              <div className="space-y-3">
                {sample.remarks?.trim() ? (
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Remarks
                    </p>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{sample.remarks}</p>
                  </div>
                ) : null}
                {sample.chainOfCustodyNotes?.trim() ? (
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Chain of Custody
                    </p>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      {sample.chainOfCustodyNotes}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Meta footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>
              Sample #{sample.id}
              {sample.orderId != null ? ` · Order ${sample.orderId}` : ''}
              {sample.isActive ? ' · Active' : ' · Inactive'}
            </span>
            {sampleRes?.message ? (
              <span className="text-emerald-600 normal-case tracking-normal font-semibold">
                {sampleRes.message}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </RightDrawer>
    <UpdateSampleStatus
      isOpen={statusFormOpen}
      onClose={() => setStatusFormOpen(false)}
      sampleId={sampleId}
      sampleLabel={sample ? displayCode : undefined}
      currentStatus={apiStatus}
      onSuccess={() => void refetch()}
    />
    </>
  );
}

export default SampleDetails;

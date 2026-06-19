'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Beaker,
  ClipboardList,
  Clock,
  Edit2,
  FlaskConical,
  Gauge,
  Hash,
  Loader2,
  Microscope,
  Trash2,
  Thermometer,
  Timer,
  User,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { ConfirmAlertDialog } from '@/components/ui/confirm-alert-dialog';
import { RightDrawer } from '@/components/ui/right-drawer';
import {
  useSampleProcessingBySampleId,
  useDeleteSampleProcessing,
} from '@/app/Apis/booking/useSamples';
import {
  formatSampleDateTime,
  formatSampleProcessingLabel,
  type SampleProcessingRecord,
} from '@/app/Apis/booking/sample';
import { formatProcessedByDisplay } from '@/app/utils/loggedInUser';

export interface ProcessDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  /** Sample id (GET `/api/v1/sample-processing/sample/{sampleId}`). */
  sampleId: number | null;
  sampleLabel?: string | null;
  onEditRecord?: (record: SampleProcessingRecord) => void;
  /** Called after DELETE `/sample-processing/{processId}` succeeds. */
  onDeletedRecord?: (sampleId: number, processId: number) => void;
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
      <Icon size={14} className="text-amber-500" />
      {title}
    </h4>
  );
}

function formatNumber(value?: number | null, suffix = ''): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${value}${suffix}`;
}

export default function ProcessDetails({
  isOpen,
  onClose,
  sampleId,
  sampleLabel,
  onEditRecord,
  onDeletedRecord,
}: ProcessDetailsProps) {
  const [deleteTarget, setDeleteTarget] = useState<SampleProcessingRecord | null>(null);
  const deleteMutation = useDeleteSampleProcessing();

  const {
    data: processingRes,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSampleProcessingBySampleId(isOpen ? sampleId : null);

  const records = useMemo(
    () => processingRes?.data ?? [],
    [processingRes?.data]
  );
  const loading = isLoading || isFetching;
  const latest = records[0] ?? null;

  const handleConfirmDelete = () => {
    if (!deleteTarget?.id || !deleteTarget.sampleId) return;

    deleteMutation.mutate(
      { processId: deleteTarget.id, sampleId: deleteTarget.sampleId },
      {
        onSuccess: (res) => {
          if (res.response === false) {
            toast.error(res.message || 'Failed to delete processing record.');
            return;
          }
          toast.success(res.message?.trim() || 'Processing record deleted. You can record again.');
          onDeletedRecord?.(deleteTarget.sampleId, deleteTarget.id);
          setDeleteTarget(null);
          if (records.length <= 1) {
            onClose();
          }
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to delete processing record.');
        },
      },
    );
  };

  return (
    <>
      <ConfirmAlertDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete processing record"
        description={`Remove processing #${deleteTarget?.id ?? ''} (${formatSampleProcessingLabel(deleteTarget?.processingType)})? You can record processing again afterward.`}
        confirmText="Delete record"
        cancelText="Keep record"
        variant="warning"
        isLoading={deleteMutation.isPending}
      />
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Activity className="text-white" size={24} />
          <span>
            Processing <span className="text-emerald-200">Details</span>
          </span>
        </div>
      }
      description={
        latest
          ? records.length > 1
            ? `${sampleLabel || `Sample #${latest.sampleId}`} · ${records.length} records`
            : `${formatSampleProcessingLabel(latest.processingType)} · #${latest.id}`
          : sampleLabel
            ? sampleLabel
            : 'View sample processing records'
      }
      maxWidth="xl"
      footer={
        <div className="flex flex-wrap gap-3 w-full">
          <Button variant="outline" onClick={onClose} className="flex-1 min-w-[7rem]">
            Close
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
          <Loader2 size={28} className="animate-spin text-amber-600" />
          <span className="text-sm font-semibold">Loading processing details…</span>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 space-y-4">
          <div className="flex items-start gap-3 text-rose-700">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">Failed to load processing record</p>
              <p className="text-xs font-medium mt-1">
                {error instanceof Error ? error.message : 'Could not fetch processing details.'}
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" className="font-bold" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : records.length === 0 ? (
        <div className="py-16 text-center text-sm font-medium text-slate-500">
          No processing records found for this sample.
        </div>
      ) : (
        <div className="space-y-10">
          {records.map((record, index) => (
            <div
              key={record.id}
              className={index > 0 ? 'pt-10 border-t border-slate-200' : undefined}
            >
              {records.length > 1 ? (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                  Record {index + 1} of {records.length}
                </p>
              ) : null}
              <ProcessingDetailsBody
                record={record}
                sampleLabel={sampleLabel}
                showEndpointHint={index === records.length - 1}
                onEdit={onEditRecord}
                onDelete={setDeleteTarget}
                deleting={deleteMutation.isPending && deleteTarget?.id === record.id}
              />
            </div>
          ))}
        </div>
      )}
    </RightDrawer>
    </>
  );
}

function ProcessingDetailsBody({
  record,
  sampleLabel,
  showEndpointHint = true,
  onEdit,
  onDelete,
  deleting = false,
}: {
  record: SampleProcessingRecord;
  sampleLabel?: string | null;
  showEndpointHint?: boolean;
  onEdit?: (record: SampleProcessingRecord) => void;
  onDelete?: (record: SampleProcessingRecord) => void;
  deleting?: boolean;
}) {
  const displayBarcode =
    record.sampleBarcode?.trim() || sampleLabel?.trim() || `Sample #${record.sampleId}`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-start justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 shrink-0 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 border-2 border-amber-50">
            <Activity size={32} />
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight truncate">
              {formatSampleProcessingLabel(record.processingType)}
            </h3>
            {record.processingMethod?.trim() ? (
              <p className="text-xs font-bold text-slate-500 mt-0.5">{record.processingMethod}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="primary" className="text-[10px] font-bold uppercase px-3 py-1">
                {formatSampleProcessingLabel(record.processingType)}
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-bold uppercase px-3 py-1">
                {formatSampleProcessingLabel(record.qualityCheck)}
              </Badge>
              {record.isActive === false ? (
                <Badge variant="secondary" className="text-[10px] font-bold uppercase">
                  Inactive
                </Badge>
              ) : (
                <Badge variant="success" className="text-[10px] font-bold uppercase gap-1">
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0 ml-4 flex flex-col items-end gap-2">
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
              Process ID
            </div>
            <div className="text-xl font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100 inline-block">
              #{record.id}
            </div>
          </div>
          {onEdit || onDelete ? (
            <div className="flex flex-wrap justify-end gap-2">
              {onEdit ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(record)}
                  disabled={deleting}
                  className="font-bold gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <Edit2 size={14} />
                  Edit
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(record)}
                  disabled={deleting}
                  className="font-bold gap-2 border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  {deleting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle title="Sample Reference" icon={FlaskConical} />
        <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
         
          <DetailField label="Sample Barcode" value={displayBarcode} icon={Hash} mono />
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle title="Processing" icon={Microscope} />
        <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <DetailField
            label="Processing Type"
            value={formatSampleProcessingLabel(record.processingType)}
            icon={Activity}
          />
          <DetailField
            label="Processing Method"
            value={record.processingMethod?.trim() || '—'}
            icon={ClipboardList}
          />
          <DetailField
            label="Processing Date & Time"
            value={formatSampleDateTime(record.processingDateTime)}
            icon={Clock}
          />
          <DetailField
            label="Processed By"
            value={formatProcessedByDisplay(record.processedBy)}
            icon={User}
          />
          <DetailField
            label="Processing Parameters"
            value={record.processingParameters?.trim() || '—'}
            icon={FileText}
          />
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle title="Equipment & Reagents" icon={Beaker} />
        <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <DetailField
            label="Equipment Used"
            value={record.equipmentUsed?.trim() || '—'}
            icon={Microscope}
          />
          <DetailField label="Reagent Used" value={record.reagentUsed?.trim() || '—'} icon={Beaker} />
          <DetailField label="Lot Number" value={record.lotNumber?.trim() || '—'} icon={Hash} mono />
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle title="Run Parameters" icon={Gauge} />
        <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <DetailField label="RPM" value={formatNumber(record.rpm)} icon={Gauge} />
          <DetailField
            label="Duration"
            value={formatNumber(record.durationMinutes, ' min')}
            icon={Timer}
          />
          <DetailField
            label="Temperature"
            value={formatNumber(record.temperatureCelsius, ' °C')}
            icon={Thermometer}
          />
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle title="Aliquots" icon={Beaker} />
        <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <DetailField label="Aliquot Count" value={formatNumber(record.aliquotCount)} icon={Hash} />
          <DetailField
            label="Aliquot Volume"
            value={record.aliquotVolume?.trim() || '—'}
            icon={Beaker}
          />
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle title="Quality & Notes" icon={ClipboardList} />
        <div className="grid grid-cols-1 gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <DetailField
            label="Quality Check"
            value={formatSampleProcessingLabel(record.qualityCheck)}
            icon={ClipboardList}
          />
          <DetailField
            label="Processing Notes"
            value={record.processingNotes?.trim() || '—'}
            icon={FileText}
          />
        </div>
      </div>

      {showEndpointHint ? (
        <p className="text-xs text-slate-400 font-mono pl-1">
          GET /sample-processing/sample/{record.sampleId}
        </p>
      ) : null}
    </div>
  );
}

export { ProcessDetails };

'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Activity,
  Info,
  Heart,
  AlertTriangle,
  FlaskConical,
  CreditCard,
  Stethoscope,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { fetchPatientById } from '@/app/Apis/Patients/Patient_Service_API';
import { formatPatientFullName } from '@/app/Apis/Patients/patientDisplayUtils';
import { useEstimationDetail } from '@/features/diagnosis/services/booking.service';
import {
  estimationToDiseases,
  formatEstimationCurrency,
  formatEstimationDate,
  formatEstimationDateTime,
  formatEstimationLabel,
} from '@/features/diagnosis/services/booking.service';
import { orderPriorityLabel } from '@/features/diagnosis/services/booking.service';

export interface EstimationDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  estimationId: number | null;
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
      <p className={`text-sm font-bold text-slate-900 ${mono ? 'font-mono' : ''}`}>
        {value || '—'}
      </p>
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

function statusBadgeVariant(
  status?: string | null
): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' {
  const s = status?.trim().toUpperCase() ?? '';
  if (s.includes('APPROV') || s.includes('COMPLETE') || s === 'ACTIVE') return 'success';
  if (s.includes('REJECT') || s.includes('CANCEL')) return 'danger';
  if (s.includes('PENDING') || s.includes('DRAFT')) return 'warning';
  if (s.includes('CONVERT')) return 'primary';
  return 'secondary';
}

export function EstimationDetails({
  isOpen,
  onClose,
  estimationId,
}: EstimationDetailsProps) {
  const {
    data: detailRes,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useEstimationDetail(isOpen ? estimationId : null);

  const estimation = detailRes?.data ?? null;
  const loading = isLoading || isFetching;
  const diseases = estimation ? estimationToDiseases(estimation) : [];
  const items = estimation?.estimationItems ?? [];

  const [patientName, setPatientName] = useState('—');
  const [patientCode, setPatientCode] = useState('');
  const [patientLoading, setPatientLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !estimation?.patientId) {
      setPatientName('—');
      setPatientCode('');
      return;
    }

    let cancelled = false;
    setPatientLoading(true);
    fetchPatientById(estimation.patientId)
      .then((res) => {
        if (cancelled || !res.data) return;
        setPatientName(formatPatientFullName(res.data));
        setPatientCode(res.data.patientCode ?? '');
      })
      .catch(() => {
        if (!cancelled) setPatientName(`Patient #${estimation.patientId}`);
      })
      .finally(() => {
        if (!cancelled) setPatientLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, estimation?.patientId]);

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <FileText className="text-white" size={24} />
          <span>
            Estimation <span className="text-emerald-200">Details</span>
          </span>
        </div>
      }
      description={
        estimation?.estimationNumber
          ? estimation.estimationNumber
          : 'View complete estimation information'
      }
      maxWidth="xl"
      footer={
        <div className="flex flex-wrap gap-3 w-full">
          <Button variant="outline" onClick={onClose} className="flex-1 min-w-[7rem]">
            Close
          </Button>
          {isError ? (
            <Button
              type="button"
              variant="gradient"
              onClick={() => void refetch()}
              className="flex-1 min-w-[7rem]"
            >
              Retry
            </Button>
          ) : null}
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
          <span className="text-sm font-semibold">Loading estimation…</span>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <XCircle className="mx-auto text-rose-500 mb-2" size={32} />
          <p className="text-sm font-bold text-rose-700">
            {error instanceof Error ? error.message : 'Failed to load estimation.'}
          </p>
        </div>
      ) : !estimation ? (
        <p className="text-sm text-slate-500 text-center py-12">No estimation data.</p>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Header */}
          <div className="flex items-start justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 border-2 border-emerald-50">
                <FileText size={32} />
              </div>
              <div className="min-w-0">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight truncate">
                  {estimation.estimationNumber}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant={statusBadgeVariant(estimation.estimationStatus)}>
                    {formatEstimationLabel(estimation.estimationStatus)}
                  </Badge>
                  <Badge variant={statusBadgeVariant(estimation.approvalStatus)}>
                    {formatEstimationLabel(estimation.approvalStatus)}
                  </Badge>
                  {estimation.isConverted ? (
                    <Badge variant="primary" className="gap-1">
                      <CheckCircle2 size={12} />
                      Converted
                    </Badge>
                  ) : null}
                  {estimation.isEmergency ? (
                    <Badge variant="danger">Emergency</Badge>
                  ) : null}
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mt-2">
                  <Clock size={12} />
                  Created: {formatEstimationDateTime(estimation.createdAt)}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0 pl-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
                Final amount
              </div>
              <div className="text-xl font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                {formatEstimationCurrency(estimation.finalAmount)}
              </div>
            </div>
          </div>

          {/* Patient */}
          <div className="space-y-4">
            <SectionTitle title="Patient" icon={User} />
            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 border border-slate-100">
                {patientLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{patientName}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {patientCode ? `UHID: ${patientCode}` : `Patient ID: ${estimation.patientId}`}
                </p>
              </div>
            </div>
          </div>

          {/* Estimation info */}
          <div className="space-y-4">
            <SectionTitle title="Estimation information" icon={Calendar} />
            <div className="grid grid-cols-2 gap-6">
              <DetailField
                label="Estimation date"
                value={formatEstimationDate(estimation.estimationDate)}
                icon={Calendar}
              />
              <DetailField
                label="Valid until"
                value={formatEstimationDate(estimation.validUntil)}
                icon={Calendar}
              />
              <DetailField
                label="Priority"
                value={orderPriorityLabel(estimation.priority)}
                icon={Activity}
              />
              <DetailField
                label="Turnaround (hours)"
                value={
                  estimation.estimatedTurnaroundHours != null
                    ? String(estimation.estimatedTurnaroundHours)
                    : '—'
                }
                icon={Clock}
              />
              <DetailField label="Requested by" value={estimation.requestedBy ?? '—'} />
              <DetailField label="Created by" value={estimation.createdByName ?? '—'} />
              <DetailField label="Version" value={String(estimation.versionNumber ?? 1)} mono />
              <DetailField
                label="SRF ID"
                value={estimation.srfId ?? '—'}
                mono
              />
            </div>
          </div>

          {/* Medical */}
          <div className="space-y-4">
            <SectionTitle title="Medical information" icon={Heart} />
            <div className="grid grid-cols-1 gap-4">
              <DetailField
                label="Clinical notes"
                value={estimation.clinicalNotes ?? '—'}
              />
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <AlertTriangle size={10} /> Drug allergy
                </label>
                <p className="text-sm font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                  {estimation.drugAllergy?.trim() || 'None documented'}
                </p>
              </div>
              <DetailField
                label="LMP date"
                value={formatEstimationDate(estimation.lmpDate)}
                icon={Calendar}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Pre-existing conditions
              </label>
              {diseases.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {diseases.map((d) => (
                    <Badge
                      key={d}
                      variant="secondary"
                      className="text-[10px] font-bold uppercase"
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">None documented.</p>
              )}
            </div>
          </div>

          {/* Referral */}
          <div className="space-y-4">
            <SectionTitle title="Referral" icon={Stethoscope} />
            <div className="grid grid-cols-2 gap-6">
              <DetailField label="Referrer name" value={estimation.referrerName ?? '—'} />
              <DetailField
                label="Referring doctor"
                value={
                  estimation.referringDoctorName?.trim() ||
                  (estimation.referringDoctorId
                    ? `ID ${estimation.referringDoctorId}`
                    : '—')
                }
              />
              <DetailField
                label="Referring hospital"
                value={
                  estimation.referringHospitalName?.trim() ||
                  (estimation.referringHospitalId
                    ? `ID ${estimation.referringHospitalId}`
                    : '—')
                }
              />
            </div>
          </div>

          {/* Collection & contact */}
          <div className="space-y-4">
            <SectionTitle title="Collection & contact" icon={Phone} />
            <div className="grid grid-cols-2 gap-6">
              <DetailField
                label="Collection date"
                value={formatEstimationDate(estimation.estimatedCollectionDate)}
                icon={Calendar}
              />
              <DetailField
                label="Collection time"
                value={estimation.estimatedCollectionTime ?? '—'}
                icon={Clock}
              />
              <DetailField
                label="Report date"
                value={formatEstimationDate(estimation.estimatedReportDate)}
                icon={Calendar}
              />
              <DetailField
                label="Contact phone"
                value={estimation.contactPhone ?? '—'}
                icon={Phone}
                mono
              />
              <DetailField
                label="Contact email"
                value={estimation.contactEmail ?? '—'}
                icon={Mail}
              />
              <DetailField label="Remarks" value={estimation.remarks ?? '—'} />
            </div>
          </div>

          {/* Financial */}
          <div className="space-y-4">
            <SectionTitle title="Financial summary" icon={CreditCard} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <DetailField
                label="Total"
                value={formatEstimationCurrency(estimation.totalAmount)}
              />
              <DetailField
                label="Net"
                value={formatEstimationCurrency(estimation.netAmount)}
              />
              <DetailField
                label="Discount"
                value={formatEstimationCurrency(estimation.discountAmount)}
              />
              <DetailField
                label="Discount %"
                value={
                  estimation.discountPercentage != null
                    ? `${estimation.discountPercentage}%`
                    : '—'
                }
              />
              <DetailField
                label="Concession"
                value={formatEstimationCurrency(estimation.concessionAmount)}
              />
              <DetailField label="Concession by" value={estimation.concessionBy ?? '—'} />
              <DetailField
                label="Tax (est.)"
                value={formatEstimationCurrency(estimation.estimatedTaxAmount)}
              />
              <DetailField
                label="Emergency charge"
                value={formatEstimationCurrency(estimation.emergencyCharge)}
              />
              <DetailField
                label="Contrast charge"
                value={formatEstimationCurrency(estimation.contrastCharge)}
              />
            </div>
          </div>

          {/* Test items */}
          <div className="space-y-4">
            <SectionTitle title="Estimation tests" icon={FlaskConical} />
            {items.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">
                        Test
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">
                        Dept / Category
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-right">
                        Base
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-right">
                        Net
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-center">
                        Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900">{item.testName ?? '—'}</p>
                          <p className="text-[10px] font-mono text-slate-500">
                            {item.testCode ?? `ID ${item.testId}`}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          <p>{item.departmentName ?? '—'}</p>
                          <p className="text-slate-400">{item.categoryName ?? ''}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-700">
                          {formatEstimationCurrency(item.basePrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-700">
                          {formatEstimationCurrency(item.netPrice)}
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold">
                          {item.quantity ?? 1}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic p-6 border border-dashed border-slate-200 rounded-xl text-center">
                No tests on this estimation.
              </p>
            )}
          </div>

          {/* Approval */}
          {(estimation.approvedBy ||
            estimation.approvedDateTime ||
            estimation.approvalRemarks ||
            estimation.rejectionReason) && (
            <div className="space-y-4">
              <SectionTitle title="Approval" icon={CheckCircle2} />
              <div className="grid grid-cols-2 gap-6">
                <DetailField label="Approved by" value={estimation.approvedBy ?? '—'} />
                <DetailField
                  label="Approved at"
                  value={formatEstimationDateTime(estimation.approvedDateTime)}
                />
                <DetailField
                  label="Approval remarks"
                  value={estimation.approvalRemarks ?? '—'}
                />
                <DetailField
                  label="Rejection reason"
                  value={estimation.rejectionReason ?? '—'}
                />
              </div>
            </div>
          )}

          {/* Conversion */}
          {estimation.isConverted || estimation.convertedOrderId ? (
            <div className="space-y-4">
              <SectionTitle title="Conversion" icon={CheckCircle2} />
              <div className="grid grid-cols-2 gap-6">
                <DetailField
                  label="Order ID"
                  value={
                    estimation.convertedOrderId != null
                      ? String(estimation.convertedOrderId)
                      : '—'
                  }
                  mono
                />
                <DetailField
                  label="Converted at"
                  value={formatEstimationDateTime(estimation.convertedDateTime)}
                />
                <DetailField
                  label="Conversion notes"
                  value={estimation.conversionNotes ?? '—'}
                />
              </div>
            </div>
          ) : null}

          {/* Footer meta */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Updated: {formatEstimationDateTime(estimation.updatedAt)}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Estimation ID: {estimation.id}
            </span>
          </div>
        </div>
      )}
    </RightDrawer>
  );
}

export default EstimationDetails;

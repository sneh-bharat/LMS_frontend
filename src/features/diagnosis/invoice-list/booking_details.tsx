'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  FlaskConical,
  Stethoscope,
  CreditCard,
  Calendar,
  Clock,
  User,
  Droplets,
  Activity,
  Info,
  Loader2,
  Pencil,
  Building2,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import type { TestOrder } from '@/features/diagnosis/services/booking.service';
import { fetchPatientById } from '@/app/Apis/Patients/Patient_Service_API';
import { formatPatientFullName } from '@/app/Apis/Patients/patientDisplayUtils';
import { testOrderToDiseases } from '@/app/Apis/booking/mapTestOrderEdit';
import { orderPriorityLabel } from '@/features/diagnosis/services/booking.service';
import { useTestOrderDetail } from '@/features/diagnosis/services/booking.service';
import { useTestsByIds } from '@/app/Apis/lab/useTestsByIds';

export interface BookingDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  order: TestOrder | null;
  /** Optional label when patient fetch is skipped */
  patientName?: string;
  patientCode?: string;
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

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(amount: number | undefined) {
  return `₹${(amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusBadgeVariant(status?: string) {
  const s = status?.toUpperCase();
  if (s === 'PAID' || s === 'COMPLETED') return 'success' as const;
  if (s === 'UNPAID') return 'destructive' as const;
  if (s === 'PENDING') return 'warning' as const;
  return 'secondary' as const;
}

export function BookingDetails({
  isOpen,
  onClose,
  order,
  patientName: patientNameProp,
  patientCode: patientCodeProp,
}: BookingDetailsProps) {
  const orderId = isOpen && order?.id ? order.id : null;
  const { data: detailResponse, isLoading: orderLoading } = useTestOrderDetail(orderId);
  const displayOrder = detailResponse?.data ?? order;
  const testIds = useMemo(
    () => (displayOrder?.orderItems ?? []).map((item) => item.testId),
    [displayOrder?.orderItems]
  );
  const { testsById } = useTestsByIds(isOpen ? testIds : []);

  const [patientName, setPatientName] = useState(patientNameProp ?? '—');
  const [patientCode, setPatientCode] = useState(patientCodeProp ?? '');
  const [patientLoading, setPatientLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !displayOrder?.patientId) {
      setPatientName(patientNameProp ?? '—');
      setPatientCode(patientCodeProp ?? '');
      return;
    }

    if (patientNameProp && patientNameProp !== '—') {
      setPatientName(patientNameProp);
      setPatientCode(patientCodeProp ?? '');
    }

    let cancelled = false;
    setPatientLoading(true);
    fetchPatientById(displayOrder.patientId)
      .then((res) => {
        if (cancelled || !res.data) return;
        setPatientName(formatPatientFullName(res.data));
        setPatientCode(res.data.patientCode ?? '');
      })
      .catch(() => {
        if (!cancelled && !patientNameProp) setPatientName(`Patient #${displayOrder.patientId}`);
      })
      .finally(() => {
        if (!cancelled) setPatientLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, displayOrder?.patientId, patientNameProp, patientCodeProp]);

  if (!order) return null;

  const diseases = displayOrder ? testOrderToDiseases(displayOrder) : [];
  const editHref = (() => {
    const params = new URLSearchParams({ orderId: String(order.id) });
    const branchId = displayOrder?.branchId ?? order.branchId;
    if (branchId != null && branchId > 0) {
      params.set('branchId', String(branchId));
    }
    return `/diagnosis/diagnostic-booking/booking?${params.toString()}`;
  })();

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <FileText className="text-white" size={24} />
          <span>
            Booking <span className="text-emerald-200">Details</span>
          </span>
        </div>
      }
      description={`Invoice: ${displayOrder?.orderNumber ?? order.orderNumber}`}
      footer={
        <div className="flex flex-wrap gap-3 w-full">
          <Link href={editHref} onClick={onClose}>
            <Button
              type="button"
              variant="outline"
              className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex items-center gap-2"
            >
              <Pencil size={16} />
              Edit booking
            </Button>
          </Link>
        </div>
      }
      maxWidth="xl"
    >
      {orderLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-emerald-600" />
          <p className="text-sm font-medium">Loading booking details…</p>
        </div>
      ) : !displayOrder ? (
        <div className="py-16 text-center text-sm text-slate-500">Booking details could not be loaded.</div>
      ) : (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        {/* Header */}
        <div className="flex items-start justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-50">
              <FileText size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
                {displayOrder.orderNumber}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant={statusBadgeVariant(displayOrder.orderStatus)}>{displayOrder.orderStatus}</Badge>
                <Badge variant={statusBadgeVariant(displayOrder.paymentStatus)}>{displayOrder.paymentStatus}</Badge>
                <Badge variant="secondary">{orderPriorityLabel(displayOrder.priority)}</Badge>
                {displayOrder.isEmergency ? (
                  <Badge variant="destructive">Emergency</Badge>
                ) : null}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
              Actual payable
            </div>
            <div className="text-xl font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
              {formatCurrency(displayOrder.actualPayable)}
            </div>
          </div>
        </div>

        {/* Patient summary */}
        <div className="p-4 rounded-xl border border-slate-100 bg-white">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-3">
            <User size={14} className="text-emerald-500" />
            Patient
          </h4>
          <div className="flex items-center gap-2">
            {patientLoading ? <Loader2 size={16} className="animate-spin text-emerald-600" /> : null}
            <div>
              <p className="text-sm font-bold text-slate-900">{patientName}</p>
              <p className="text-[10px] text-slate-500 font-mono">
                {patientCode ? `UHID: ${patientCode}` : `Patient ID: ${displayOrder.patientId}`}
              </p>
            </div>
          </div>
        </div>

        {/* Collection & schedule */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Calendar size={14} className="text-emerald-500" />
            Collection & schedule
          </h4>
          <div className="grid grid-cols-2 gap-6">
            <DetailField label="Order date" value={formatDate(displayOrder.orderDate)} icon={Calendar} />
            <DetailField label="Collection date" value={formatDate(displayOrder.collectionDate)} icon={Calendar} />
            <DetailField label="Collection time" value={displayOrder.collectionTime ?? '—'} icon={Clock} mono />
            <DetailField
              label="Expected report"
              value={formatDate(displayOrder.expectedReportDate)}
              icon={Calendar}
            />
            <DetailField label="Collector" value={displayOrder.collectorName ?? '—'} icon={User} />
            <DetailField label="Turnaround (hrs)" value={String(displayOrder.turnaroundTimeHours ?? '—')} icon={Clock} />
          </div>
        </div>

        {/* Medical */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Stethoscope size={14} className="text-emerald-500" />
            Medical information
          </h4>
          <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 space-y-3">
            <DetailField label="Drug allergy" value={displayOrder.drugAllergy ?? 'None'} icon={Droplets} />
            <DetailField label="LMP date" value={formatDate(displayOrder.lmpDate)} icon={Calendar} />
            <DetailField label="Clinical notes" value={displayOrder.clinicalNotes ?? '—'} icon={Activity} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Pre-existing conditions
            </label>
            {diseases.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {diseases.map((d) => (
                  <Badge key={d} variant="secondary" className="text-[10px] font-bold">
                    {d}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">None recorded</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-6 pt-2">
            <DetailField label="Referrer" value={displayOrder.referrerName ?? '—'} icon={Building2} />
            <DetailField label="SRF ID" value={displayOrder.srfId ?? '—'} mono />
            <DetailField
              label="Referring doctor"
              value={
                displayOrder.referringDoctorName?.trim() ||
                (displayOrder.referringDoctorId ? `ID ${displayOrder.referringDoctorId}` : '—')
              }
            />
            <DetailField
              label="Referring hospital"
              value={
                displayOrder.referringHospitalName?.trim() ||
                (displayOrder.referringHospitalId ? `ID ${displayOrder.referringHospitalId}` : '—')
              }
            />
          </div>
        </div>

        {/* Financial */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <CreditCard size={14} className="text-amber-500" />
            Financial information
          </h4>
          <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <DetailField label="Total amount" value={formatCurrency(displayOrder.totalAmount)} mono />
            <DetailField label="Discount" value={formatCurrency(displayOrder.discountAmount)} mono />
            <DetailField label="Net amount" value={formatCurrency(displayOrder.netAmount)} mono />
            <DetailField label="Concession" value={formatCurrency(displayOrder.concessionAmount)} mono />
            <DetailField label="Concession by" value={displayOrder.concessionBy ?? '—'} />
            <DetailField label="Emergency charge" value={formatCurrency(displayOrder.emergencyCharge)} mono />
            <DetailField label="Contrast charge" value={formatCurrency(displayOrder.contrastCharge)} mono />
            <DetailField label="Paid amount" value={formatCurrency(displayOrder.paidAmount)} mono />
            <DetailField label="Pending amount" value={formatCurrency(displayOrder.pendingAmount)} mono />
            <DetailField label="Payment mode" value={displayOrder.paymentMode ?? '—'} />
            <DetailField label="Payment reference" value={displayOrder.paymentReference ?? '—'} mono />
          </div>
        </div>

        {/* Order items */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <FlaskConical size={14} className="text-emerald-500" />
            Investigations ({displayOrder.orderItems?.length ?? 0})
          </h4>
          {displayOrder.orderItems && displayOrder.orderItems.length > 0 ? (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Test</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-right">
                      Price
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-right">
                      Disc %
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-right">
                      Net
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayOrder.orderItems.map((item) => {
                    const testLabel =
                      item.testName?.trim() ||
                      testsById.get(item.testId)?.testName ||
                      `Test #${item.testId}`;
                    return (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-semibold text-slate-800">{testLabel}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.testPrice)}</td>
                      <td className="px-4 py-3 text-right">{item.discountPercentage}%</td>
                      <td className="px-4 py-3 text-right font-bold">{formatCurrency(item.netPrice)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-[9px]">
                          {item.resultStatus}
                        </Badge>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center">
              <FlaskConical className="mx-auto text-slate-200 mb-2" size={32} />
              <p className="text-sm text-slate-400 font-medium">No investigations on this order.</p>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Created by: <span className="text-slate-900">{displayOrder.createdByName ?? '—'}</span>
            </span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
            <Clock size={10} className="inline mr-1" />
            {formatDateTime(displayOrder.createdAt)}
            {displayOrder.updatedAt ? ` · Updated ${formatDateTime(displayOrder.updatedAt)}` : ''}
          </div>
        </div>
      </div>
      )}
    </RightDrawer>
  );
}

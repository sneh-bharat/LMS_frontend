'use client';

import {
  Activity,
  CreditCard,
  Droplets,
  FlaskConical,
  Globe,
  Info,
  Mail,
  MapPin,
  Plus,
  Stethoscope,
  Timer,
  Trash2,
  User,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import PatientSearchSelect from './PatientSearchSelect';
import PreExistingDynamics from './PreExistingDynamics';
import PatientLastVisit from './booking/patient_last_visit';
import {
  computeBookingFinancials,
  type BookingInvestigation,
} from '@/app/Apis/booking/mapBookingToTestOrder';
import {
  ORDER_PRIORITIES,
  orderPriorityLabel,
  orderPriorityTurnaroundHours,
} from '@/app/Apis/booking/orderPriority';
import type { ReferringDoctor } from '@/app/Apis/doctor/referringDoctorApi';
import {
  DISC_TYPES,
  GENDERS,
  TITLES,
  type DiagnosticBookingFormState,
  type EstimationMetaState,
} from './bookingFormTypes';
import { todayIsoDate } from './booking/bookingFormDefaults';

function referringDoctorMeta(doctor: ReferringDoctor) {
  const parts: string[] = [];
  if (doctor.specialization?.trim()) parts.push(doctor.specialization.trim());
  if (doctor.hospitalName?.trim()) parts.push(doctor.hospitalName.trim());
  if (doctor.doctorPhone?.trim()) parts.push(doctor.doctorPhone.trim());
  return parts.join(' · ') || 'Referring doctor';
}

export interface DiagnosticIntakeFormProps {
  form: DiagnosticBookingFormState;
  setForm: React.Dispatch<React.SetStateAction<DiagnosticBookingFormState>>;
  investigations: BookingInvestigation[];
  setInvestigations: React.Dispatch<React.SetStateAction<BookingInvestigation[]>>;
  referringDoctors: ReferringDoctor[];
  onReferringDoctorsChange: (doctors: ReferringDoctor[]) => void;
  branchId: number;
  mobileLookupMessage: string | null;
  apiDynamicsOptions: string[];
  onPatientSelect: (patient: import('@/app/Apis/Patients/Patient_Service_API').Patient) => void | Promise<void>;
  onClearPatient: () => void;
  onOpenAddTests: () => void;
  onOpenAddDoctor: () => void;
  variant?: 'booking' | 'estimation';
  estimationMeta?: EstimationMetaState;
  setEstimationMeta?: React.Dispatch<React.SetStateAction<EstimationMetaState>>;
}

export default function DiagnosticIntakeForm({
  form,
  setForm,
  investigations,
  setInvestigations,
  referringDoctors,
  onReferringDoctorsChange,
  branchId,
  mobileLookupMessage,
  apiDynamicsOptions,
  onPatientSelect,
  onClearPatient,
  onOpenAddTests,
  onOpenAddDoctor,
  variant = 'booking',
  estimationMeta,
  setEstimationMeta,
}: DiagnosticIntakeFormProps) {
  const isEstimation = variant === 'estimation';

  const set =
    (key: keyof DiagnosticBookingFormState) => (e: React.ChangeEvent<HTMLInputElement> | string) => {
      const value = typeof e === 'string' ? e : e.target.value;
      setForm((f) => ({ ...f, [key]: value }));
    };

  const financials = computeBookingFinancials(investigations, form);

  const syncReferringDoctorForm = (doctors: ReferringDoctor[]) => {
    const primary = doctors[doctors.length - 1];
    setForm((f) => ({
      ...f,
      referringDoctorId: primary?.id ?? null,
      referredDoctor: primary?.doctorName ?? '',
      referrer: primary?.doctorName ?? f.referrer,
    }));
  };

  const removeReferringDoctor = (id: number) => {
    const next = referringDoctors.filter((d) => d.id !== id);
    syncReferringDoctorForm(next);
    onReferringDoctorsChange(next);
  };

  const removeInvestigation = (id: number) =>
    setInvestigations((prev) => prev.filter((i) => i.id !== id));

  const summaryTitle = isEstimation ? 'Estimation Summary' : 'Checkout Summary';
  const summaryDueLabel = isEstimation ? 'Final Amount' : 'Balance Due';
  const summaryDueAmount = isEstimation
    ? financials.actualPayable
    : financials.balanceDue;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      <div className="xl:col-span-8 space-y-8">
        <Card className="p-6 border-gray-300 overflow-visible relative shadow-sm z-10">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Activity size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                Patient Identity
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                Profile Sync & Access
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <PatientSearchSelect
              patientId={form.patientId}
              onPatientSelect={(patient) => void onPatientSelect(patient)}
              onClear={onClearPatient}
              dynamicFieldLabel
              lookupMessage={mobileLookupMessage}
              required
            />
            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Digital ID (Email)
              </Label>
              <div className="relative group">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10"
                  size={16}
                />
                <Input
                  value={form.email}
                  onChange={set('email')}
                  placeholder="patient@example.com"
                  className="pl-10 border-gray-300"
                />
              </div>
            </div>
          </div>
        </Card>

        {form.patientId != null && form.patientId > 0 ? (
          <PatientLastVisit patientId={form.patientId} />
        ) : null}

        <Card className="p-0 border-gray-300 overflow-hidden relative shadow-sm">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="p-6 border-b border-gray-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <User size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                  Bio Information
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  Clinical Demographics
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">Title</Label>
                <Select value={form.title} onValueChange={(v) => v && set('title')(v)}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Title" />
                  </SelectTrigger>
                  <SelectContent>
                    {TITLES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-6 space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">
                  Full Legal Name
                </Label>
                <Input
                  value={form.patientName}
                  onChange={set('patientName')}
                  placeholder="Enter patient name"
                  className="border-gray-300"
                />
              </div>
              <div className="md:col-span-4 grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase pl-1 text-center">
                    Age
                  </Label>
                  <Input
                    value={form.age}
                    onChange={set('age')}
                    className="text-center font-black text-emerald-600 border-gray-300"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => v && set('gender')(v)}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">
                  Permanent Address
                </Label>
                <div className="relative group">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10"
                    size={16}
                  />
                  <Input value={form.address} onChange={set('address')} className="pl-10 border-gray-300" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">Nationality</Label>
                <div className="relative group">
                  <Globe
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10"
                    size={16}
                  />
                  <Input
                    value={form.nationality}
                    onChange={set('nationality')}
                    className="pl-10 border-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <Label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                <Droplets size={12} className="text-rose-600" /> Drug Allergy
              </Label>
              <Input
                value={form.drugAllergy}
                onChange={set('drugAllergy')}
                className="bg-rose-50 border-rose-200 placeholder:text-rose-300 text-rose-700 font-bold border-gray-300"
                placeholder="None"
              />
            </div>

            <PreExistingDynamics
              selected={form.diseases}
              onChange={(diseases) => setForm((f) => ({ ...f, diseases }))}
              apiOptions={apiDynamicsOptions}
            />

            <div className="space-y-2 max-w-xs">
              <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">LMP Date</Label>
              <Input type="date" value={form.lmpDate} onChange={set('lmpDate')} className="border-gray-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">Clinical Notes</Label>
                <Input
                  value={form.diagnosis}
                  onChange={set('diagnosis')}
                  placeholder="Routine blood workup"
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">Referrer Name</Label>
                <Input
                  value={form.referrer}
                  onChange={set('referrer')}
                  placeholder="Medical Center Referral"
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">SRF ID</Label>
                <Input
                  value={form.srfId}
                  onChange={set('srfId')}
                  placeholder="SRF-2026-001234"
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">
                  Referring Hospital ID
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.referringHospitalId ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((f) => ({
                      ...f,
                      referringHospitalId: v === '' ? null : Number(v),
                    }));
                  }}
                  placeholder="Hospital ID"
                  className="border-gray-300"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Referring Doctor</h3>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-black text-[10px] px-2.5">
                {referringDoctors.length} ITEMS
              </Badge>
            </div>
            <Button
              type="button"
              onClick={onOpenAddDoctor}
              className="rounded-xl custom-gradient text-white text-xs font-black gap-2 px-5 group shadow-lg shadow-emerald-500/10 shrink-0"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add Referring
              Doctor
            </Button>
          </div>

          {referringDoctors.length > 0 ? (
            <Card className="overflow-hidden border-gray-300 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Doctor Name
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Details
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {referringDoctors.map((doctor) => (
                      <tr key={doctor.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 border border-gray-200">
                              <Stethoscope size={16} />
                            </div>
                            <div className="text-sm font-bold text-slate-900">{doctor.doctorName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-500 text-[9px] font-black border-gray-200 max-w-xs truncate"
                          >
                            {referringDoctorMeta(doctor)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => removeReferringDoctor(doctor.id)}
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <div
              className="bg-white rounded-3xl border-2 border-dashed border-gray-200 h-52 flex flex-col items-center justify-center text-center p-8 transition-all hover:bg-slate-50 group cursor-pointer"
              onClick={onOpenAddDoctor}
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 mb-4 group-hover:scale-110 group-hover:bg-emerald-50 group-hover:text-emerald-400 transition-all border border-gray-100">
                <Stethoscope size={32} />
              </div>
              <p className="text-slate-400 text-sm font-bold">No referring doctors added yet.</p>
              <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">
                Start by clicking &quot;Add Referring Doctor&quot;
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Order Cart</h3>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-black text-[10px] px-2.5">
                {investigations.length} ITEMS
              </Badge>
            </div>
            <Button
              type="button"
              onClick={onOpenAddTests}
              className="rounded-xl custom-gradient text-white text-xs font-black gap-2 px-5 group shadow-lg shadow-emerald-500/10 shrink-0"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add Test
            </Button>
          </div>

          {investigations.length > 0 ? (
            <Card className="overflow-hidden border-gray-300 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Test Name
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Category
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                        MRP
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {investigations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 border border-gray-200">
                              <FlaskConical size={16} />
                            </div>
                            <div className="text-sm font-bold text-slate-900 leading-snug">{inv.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-500 text-[9px] font-black border-gray-200"
                          >
                            {inv.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-black text-slate-900">
                            ₹{inv.mrp.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => removeInvestigation(inv.id)}
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <div
              className="bg-white rounded-3xl border-2 border-dashed border-gray-200 h-52 flex flex-col items-center justify-center text-center p-8 transition-all hover:bg-slate-50 group cursor-pointer"
              onClick={onOpenAddTests}
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 mb-4 group-hover:scale-110 group-hover:bg-emerald-50 group-hover:text-emerald-400 transition-all border border-gray-100">
                <FlaskConical size={32} />
              </div>
              <p className="text-slate-400 text-sm font-bold">No investigations added yet.</p>
              <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">
                Start by clicking &quot;Add Investigation&quot;
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="xl:col-span-4 space-y-8 xl:sticky xl:top-4">
        <Card className="p-0 border-gray-300 overflow-hidden shadow-xl">
          <div className="p-6 bg-blue-900 text-white">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 opacity-80 mb-1">
              {summaryTitle}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <div className="flex items-baseline gap-1 mt-4">
              <span className="text-[10px] font-black opacity-50 uppercase">{summaryDueLabel}</span>
              <span className="text-3xl font-black text-emerald-400">
                ₹{summaryDueAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {isEstimation && estimationMeta && setEstimationMeta ? (
              <div className="space-y-3 pb-4 border-b border-gray-100">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Estimation dates
                </Label>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500">Estimation date</Label>
                  <Input
                    type="date"
                    value={estimationMeta.estimationDate}
                    onChange={(e) =>
                      setEstimationMeta((m) => ({ ...m, estimationDate: e.target.value }))
                    }
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500">Valid until</Label>
                  <Input
                    type="date"
                    value={estimationMeta.validUntil}
                    onChange={(e) =>
                      setEstimationMeta((m) => ({ ...m, validUntil: e.target.value }))
                    }
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500">Remarks</Label>
                  <Input
                    value={estimationMeta.remarks}
                    onChange={(e) =>
                      setEstimationMeta((m) => ({ ...m, remarks: e.target.value }))
                    }
                    placeholder="Patient requested morning collection"
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500">Estimated tax</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={estimationMeta.estimatedTaxAmount}
                    onChange={(e) =>
                      setEstimationMeta((m) => ({ ...m, estimatedTaxAmount: e.target.value }))
                    }
                    className="border-gray-300"
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Processing Priority
                </Label>
                <Select value={form.processing} onValueChange={(v) => v && set('processing')(v)}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Priority">{orderPriorityLabel(form.processing)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] font-semibold text-slate-500 pl-1">
                  Est. turnaround: {orderPriorityTurnaroundHours(form.processing)} hours
                </p>
              </div>

              <div className="space-y-4 pt-2 border-b border-gray-100 pb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-400">Total Amount</span>
                  <span className="font-black text-slate-900">
                    ₹{financials.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-400">Discount Amount</span>
                  <span className="font-black text-amber-600">
                    − ₹{financials.discountAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-400">Net Amount</span>
                  <span className="font-black text-slate-900">
                    ₹{financials.netAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-400 flex items-center gap-2 italic">
                    <Timer size={14} className="text-rose-500" /> Emergency Charge
                  </span>
                  <input
                    type="number"
                    value={form.emergencyCharge}
                    onChange={set('emergencyCharge')}
                    placeholder="0"
                    className="w-20 text-right bg-white border border-gray-300 rounded-lg px-2 py-1.5 focus:border-emerald-500 outline-none font-black text-slate-900"
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-400">Contrast Charge</span>
                  <input
                    type="number"
                    value={form.contrast}
                    onChange={set('contrast')}
                    placeholder="0"
                    className="w-20 text-right bg-white border border-gray-300 rounded-lg px-2 py-1.5 focus:border-emerald-500 outline-none font-black text-slate-900"
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-black text-slate-900 uppercase">Actual Payable</span>
                  <span className="text-lg font-black text-emerald-600">
                    ₹{financials.actualPayable.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-gray-200 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Adjustment / Discount
                  </span>
                  <Badge variant="secondary" className="bg-white text-emerald-600 text-[10px] font-black border-gray-200">
                    APPLY
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" value={form.discount} onChange={set('discount')} className="bg-white border-gray-300" />
                  <Select value={form.discountType} onValueChange={(v) => v && set('discountType')(v)}>
                    <SelectTrigger className="border-gray-300 bg-white">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISC_TYPES.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-slate-400 uppercase">Concession amount</Label>
                  <Input
                    type="number"
                    value={form.concessionAmount}
                    onChange={set('concessionAmount')}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-slate-400 uppercase">Concession By</Label>
                  <Input
                    value={form.concessionBy}
                    onChange={set('concessionBy')}
                    placeholder="Dr. Admin"
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Sample Collection
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500">Collection Date</Label>
                    <Input
                      type="date"
                      value={form.collectionDate}
                      min={todayIsoDate()}
                      onChange={(e) => {
                        const value = e.target.value;
                        const minDate = todayIsoDate();
                        const collectionDate = value && value < minDate ? minDate : value;
                        setForm((f) => ({
                          ...f,
                          collectionDate,
                          expectedReportDate:
                            f.expectedReportDate &&
                            collectionDate &&
                            f.expectedReportDate < collectionDate
                              ? collectionDate
                              : f.expectedReportDate,
                        }));
                      }}
                      className="border-gray-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500">Collection Time</Label>
                    <Input
                      type="time"
                      value={form.collectionTime}
                      onChange={set('collectionTime')}
                      className="border-gray-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500">Expected Report Date</Label>
                    <Input
                      type="date"
                      value={form.expectedReportDate}
                      min={
                        form.collectionDate && form.collectionDate >= todayIsoDate()
                          ? form.collectionDate
                          : todayIsoDate()
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        const minDate =
                          form.collectionDate && form.collectionDate >= todayIsoDate()
                            ? form.collectionDate
                            : todayIsoDate();
                        setForm((f) => ({
                          ...f,
                          expectedReportDate: value && value < minDate ? minDate : value,
                        }));
                      }}
                      className="border-gray-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500">Collector Name</Label>
                    <Input
                      value={form.phlebotomist}
                      onChange={set('phlebotomist')}
                      className="border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {!isEstimation ? (
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900 uppercase text-gray-500">
                      Final Amount Due
                    </span>
                    <span className="text-2xl font-black text-[#050b18]">
                      ₹{financials.actualPayable.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="relative group">
                      <CreditCard
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10"
                        size={16}
                      />
                      <Input
                        type="number"
                        value={form.payment}
                        onChange={set('payment')}
                        placeholder="Payable amount..."
                        className="pl-10 h-12 bg-white border-gray-300 font-black text-[#050b18] placeholder:text-gray-300 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-1">
                <Label className="text-[10px] font-black text-slate-400 uppercase">Created By</Label>
                <Input
                  value={form.createdByName}
                  onChange={set('createdByName')}
                  placeholder="Admin User"
                  className="border-gray-300 h-10 font-semibold"
                />
              </div>

              <div className="mt-4 flex flex-col items-center gap-1 opacity-40">
                <div className="flex items-center gap-1.5">
                  <Info size={10} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    WellnessHive® Precision Billing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

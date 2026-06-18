'use client';

import { useEffect, useRef, useState } from 'react';
import {
    AlertCircle,
    Building2,
    ChevronRight,
    FlaskConical,
    Loader2,
    Plus,
    Stethoscope,
    Timer,
    Trash2,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { Badge, Input, Label } from '@/components/ui';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';
import type { BookingInvestigation } from '@/app/Apis/booking/mapBookingToTestOrder';
import {
    DEFAULT_ORDER_PRIORITY,
    ORDER_PRIORITIES,
    isEmergencyPriority,
    type OrderPriorityValue,
} from '@/app/Apis/booking/orderPriority';
import type { Patient } from '@/app/Apis/Patients/Patient_Service_API';
import {
    buildCreateTestRequisitionPayload,
    type CreateTestRequisitionPayload,
} from '@/app/Apis/testRequest/TestRequestApi';
import { useCreateTestRequisition } from '@/app/Apis/testRequest/useTestRequisitions';
import { fetchTenants, type Tenant } from '@/app/Apis/tenant/tenantApi';
import { type Referrer, getReferrerName, getReferrerPhone } from '@/app/Apis/Referrer/referrerApi';
import type { ReferringDoctor } from '@/app/Apis/doctor/referringDoctorApi';
import { getCreatedByName } from '@/app/utils/loggedInUser';
import PatientSearchSelect from '@/app/diagnosis/diagnostic-booking/PatientSearchSelect';
import ReferrerSelect from '@/app/diagnosis/diagnostic-booking/ReferrerSelect';
import AddReferringDoctorModal from '@/app/diagnosis/diagnostic-booking/booking/AddReferringDoctorModal';
import AddInvestigationsModal from '@/app/diagnosis/diagnostic-booking/AddInvestigationsModal';
import PreExistingDynamics from '@/app/diagnosis/diagnostic-booking/PreExistingDynamics';

export interface NewRequisitionProps {
    isOpen: boolean;
    onSuccess?: () => void;
    onClose: () => void;
}

function todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
}

function isPastIsoDate(value: string): boolean {
    return value.trim() > '' && value < todayIsoDate();
}

function parseAmountInput(raw: string): string {
    return raw.replace(/\D/g, '').slice(0, 5);
}

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && err !== null) {
        const o = err as Record<string, unknown>;
        if (typeof o.message === 'string' && o.message.trim()) return o.message;
    }
    return 'Failed to create test requisition.';
}

function referringDoctorMeta(doctor: ReferringDoctor) {
    const parts: string[] = [];
    if (doctor.specialization?.trim()) parts.push(doctor.specialization.trim());
    if (doctor.hospitalName?.trim()) parts.push(doctor.hospitalName.trim());
    if (doctor.doctorPhone?.trim()) parts.push(doctor.doctorPhone.trim());
    return parts.join(' · ') || 'Referring doctor';
}

function referrerMeta(referrer: Referrer) {
    const parts: string[] = [];
    if (referrer.centre?.trim()) parts.push(referrer.centre.trim());
    if (referrer.branchName?.trim()) parts.push(referrer.branchName.trim());
    const phone = getReferrerPhone(referrer);
    if (phone !== '—') parts.push(phone);
    return parts.join(' · ') || 'Referrer';
}

const LABEL_CLS = 'text-xs font-bold text-slate-700 uppercase tracking-widest';

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

function SelectSkeleton({ label }: { label: string }) {
    return (
        <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
            <Loader2 className="animate-spin text-emerald-600" size={16} aria-hidden />
            Loading {label}…
        </div>
    );
}

export default function NewRequisition({ isOpen, onSuccess, onClose }: NewRequisitionProps) {
    const [patientId, setPatientId] = useState<number | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [referringDoctors, setReferringDoctors] = useState<ReferringDoctor[]>([]);
    const [referringHospital, setReferringHospital] = useState(0);
    const [selectedReferrer, setSelectedReferrer] = useState<Referrer | null>(null);
    const [requisitionDate, setRequisitionDate] = useState(todayIsoDate());
    const [priority, setPriority] = useState<OrderPriorityValue>(DEFAULT_ORDER_PRIORITY);
    const [collectionDate, setCollectionDate] = useState('');
    const [collectionTime, setCollectionTime] = useState('');
    const [tests, setTests] = useState<BookingInvestigation[]>([]);

    const [branchId, setBranchId] = useState(0);

    const [clinicalNotes, setClinicalNotes] = useState('');
    const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');
    const [drugAllergy, setDrugAllergy] = useState('');
    const [srfId, setSrfId] = useState('');
    const [lmpDate, setLmpDate] = useState('');
    const [expectedReportDate, setExpectedReportDate] = useState('');
    const [diseases, setDiseases] = useState<string[]>([]);
    const [concessionAmount, setConcessionAmount] = useState('0');
    const [concessionBy, setConcessionBy] = useState('');
    const [emergencyCharge, setEmergencyCharge] = useState('0');

    const [branches, setBranches] = useState<Branch[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loadingTenants, setLoadingTenants] = useState(false);

    const [addTestsOpen, setAddTestsOpen] = useState(false);
    const [addDoctorOpen, setAddDoctorOpen] = useState(false);
    const [addReferrerOpen, setAddReferrerOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const formRef = useRef<HTMLFormElement>(null);
    const createMutation = useCreateTestRequisition();

    useEffect(() => {
        if (!isOpen) return;
        setPatientId(null);
        setSelectedPatient(null);
        setReferringDoctors([]);
        setReferringHospital(0);
        setSelectedReferrer(null);
        setRequisitionDate(todayIsoDate());
        setPriority(DEFAULT_ORDER_PRIORITY);
        setCollectionDate('');
        setCollectionTime('');
        setTests([]);
        setBranchId(0);
        setAddDoctorOpen(false);
        setClinicalNotes('');
        setClinicalDiagnosis('');
        setDrugAllergy('');
        setSrfId('');
        setLmpDate('');
        setExpectedReportDate('');
        setDiseases([]);
        setConcessionAmount('0');
        setConcessionBy('');
        setEmergencyCharge('0');
        setErrors({});
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;

        (async () => {
            setLoadingBranches(true);
            try {
                const res = await branchApi.listBranchesAll({ page: 0, size: 200 });
                const list = res?.data?.content ?? [];
                if (!cancelled) {
                    setBranches(list);
                    setBranchId((prev) => (prev > 0 ? prev : list[0]?.id ?? 0));
                }
            } catch {
                if (!cancelled) setBranches([]);
            } finally {
                if (!cancelled) setLoadingBranches(false);
            }
        })();

        (async () => {
            setLoadingTenants(true);
            try {
                const res = await fetchTenants({ page: 0, size: 200 });
                if (!cancelled) setTenants(res?.data?.content ?? []);
            } catch {
                if (!cancelled) setTenants([]);
            } finally {
                if (!cancelled) setLoadingTenants(false);
            }
        })();

        return () => { cancelled = true; };
    }, [isOpen]);

    const clearError = (key: string) => {
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
    };

    const validate = (): boolean => {
        const next: Record<string, string> = {};

        if (!patientId || patientId < 1) {
            next.patientId = 'Patient is required.';
        }
        if (!requisitionDate.trim()) {
            next.requisitionDate = 'Requisition date is required.';
        }
        if (!priority.trim()) {
            next.priority = 'Priority is required.';
        }
        if (!collectionDate.trim()) {
            next.collectionDate = 'Collection date is required.';
        } else if (isPastIsoDate(collectionDate)) {
            next.collectionDate = 'Collection date must be today or a future date.';
        }
        if (tests.length < 1) {
            next.tests = 'Add at least one requisition item.';
        }

        setErrors(next);
        if (Object.keys(next).length > 0) {
            toast.error('Please complete all required fields.');
        }
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const selectedDoctorId = referringDoctors.length > 0
            ? referringDoctors[referringDoctors.length - 1].id
            : 0;

        const payload: CreateTestRequisitionPayload = buildCreateTestRequisitionPayload({
            patientId: patientId!,
            referringDoctor: selectedDoctorId,
            referringHospital,
            referrerName: selectedReferrer ? getReferrerName(selectedReferrer) : '',
            requisitionDate,
            priority,
            collectionDate,
            collectionTime,
            investigations: tests,
            branchId,
            createdBy: getCreatedByName(),
            createdByName: getCreatedByName(),
            createdAt: new Date().toISOString(),
            srfId,
            clinicalNotes,
            clinicalDiagnosis,
            drugAllergy,
            lmpDate,
            expectedReportDate: expectedReportDate || collectionDate,
            diseases,
            concessionAmount: Number(concessionAmount) || 0,
            concessionBy,
            emergencyCharge: Number(emergencyCharge) || 0,
        });

        createMutation.mutate(payload, {
            onSuccess: (res) => {
                if (!res.response) {
                    toast.error(res.message || 'Failed to create test requisition.');
                    return;
                }
                toast.success(res.message?.trim() || 'Test requisition created successfully.');
                onSuccess?.();
                onClose();
            },
            onError: (err) => toast.error(getErrorMessage(err)),
        });
    };

    const handlePatientSelect = (patient: Patient) => {
        setSelectedPatient(patient);
        setPatientId(patient.id ?? null);
        clearError('patientId');
    };

    const handleAddTests = (items: BookingInvestigation[]) => {
        setTests((prev) => {
            const byId = new Map(prev.map((t) => [t.id, t]));
            items.forEach((item) => byId.set(item.id, item));
            return Array.from(byId.values());
        });
        setAddTestsOpen(false);
        clearError('tests');
    };

    const removeReferringDoctor = (id: number) => {
        setReferringDoctors((prev) => prev.filter((d) => d.id !== id));
    };

    const pending = createMutation.isPending;

    const footer = (
        <div className="flex gap-3 w-full">
            <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 font-bold"
                disabled={pending}
            >
                Cancel
            </Button>
            <Button
                type="button"
                variant="gradient"
                className="flex-1 font-bold"
                disabled={pending}
                onClick={() => formRef.current?.requestSubmit()}
            >
                {pending ? (
                    <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={18} aria-hidden />
                        Submitting…
                    </span>
                ) : (
                    'Create requisition'
                )}
            </Button>
        </div>
    );

    return (
        <>
            <RightDrawer
                isOpen={isOpen}
                onClose={onClose}
                title={
                    <>
                        Add <span className="text-emerald-200">test requisition</span>
                    </>
                }
                description="Status will be set to SUBMITTED on create"
                footer={footer}
                maxWidth="lg"
            >
                <form ref={formRef} id="new-requisition-form" onSubmit={handleSubmit} className="space-y-5">
                    {/* ── Patient ── */}
                    <div className="space-y-2">
                        <PatientSearchSelect
                            patientId={patientId}
                            onPatientSelect={handlePatientSelect}
                            onClear={() => { setSelectedPatient(null); setPatientId(null); }}
                            disabled={pending}
                            required
                        />
                        <FieldError message={errors.patientId} />
                        {selectedPatient && (
                            <p className="text-xs font-medium text-slate-500">
                                Selected: {selectedPatient.patientCode}
                            </p>
                        )}
                    </div>

                    {/* ── Referrer (drawer) & Tenant (select) ── */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="requisitionDate" className={LABEL_CLS}>
                                Requisition date *
                            </Label>
                            <Input
                                id="requisitionDate"
                                type="date"
                                value={requisitionDate}
                                onChange={(e) => { setRequisitionDate(e.target.value); clearError('requisitionDate'); }}
                                className={inputCls(!!errors.requisitionDate)}
                                disabled={pending}
                            />
                            <FieldError message={errors.requisitionDate} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="referringHospital" className={LABEL_CLS}>
                                Tenant
                            </Label>
                            {loadingTenants ? (
                                <SelectSkeleton label="tenants" />
                            ) : (
                                <select
                                    id="referringHospital"
                                    value={referringHospital || ''}
                                    onChange={(e) => { setReferringHospital(Number(e.target.value) || 0); clearError('referringHospital'); }}
                                    className={selectCls(!!errors.referringHospital)}
                                    disabled={pending}
                                >
                                    <option value="" disabled>Select tenant</option>
                                    {tenants.map((t) => (
                                        <option key={t.id} value={t.id}>{t.tenantName}</option>
                                    ))}
                                </select>
                            )}
                            <FieldError message={errors.referringHospital} />
                        </div>
                    </div>

                    {/* ── Requisition Date & Priority ── */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">


                        <div className="space-y-2">
                            <Label htmlFor="priority" className={LABEL_CLS}>
                                Priority *
                            </Label>
                            <select
                                id="priority"
                                value={priority}
                                onChange={(e) => {
                                    setPriority(e.target.value as OrderPriorityValue);
                                    clearError('priority');
                                }}
                                className={selectCls(!!errors.priority)}
                                disabled={pending}
                            >
                                {ORDER_PRIORITIES.map((p) => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                            <FieldError message={errors.priority} />
                        </div>
                    </div>

                    {/* ── Collection Date & Time ── */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="collectionDate" className={LABEL_CLS}>
                                Collection date *
                            </Label>
                            <Input
                                id="collectionDate"
                                type="date"
                                min={todayIsoDate()}
                                value={collectionDate}
                                onChange={(e) => { setCollectionDate(e.target.value); clearError('collectionDate'); }}
                                className={inputCls(!!errors.collectionDate)}
                                disabled={pending}
                            />
                            <FieldError message={errors.collectionDate} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="collectionTime" className={LABEL_CLS}>
                                Collection time
                            </Label>
                            <Input
                                id="collectionTime"
                                type="time"
                                value={collectionTime}
                                onChange={(e) => { setCollectionTime(e.target.value); clearError('collectionTime'); }}
                                className={inputCls(!!errors.collectionTime)}
                                disabled={pending}
                            />
                            <FieldError message={errors.collectionTime} />
                        </div>
                    </div>

                    {/* ── Branch ── */}
                    <div className="space-y-2">
                        <Label htmlFor="branchId" className={LABEL_CLS}>
                            Branch
                        </Label>
                        {loadingBranches ? (
                            <SelectSkeleton label="branches" />
                        ) : (
                            <select
                                id="branchId"
                                value={branchId || ''}
                                onChange={(e) => { setBranchId(Number(e.target.value) || 0); setTests([]); clearError('branchId'); }}
                                className={selectCls()}
                                disabled={pending || branches.length === 0}
                            >
                                <option value="" disabled>Select branch</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>{b.branchName}</option>
                                ))}
                            </select>
                        )}
                        {!loadingBranches && branches.length === 0 && (
                            <p className="text-xs text-amber-700 flex items-center gap-1">
                                <AlertCircle size={12} aria-hidden /> No branches found.
                            </p>
                        )}
                        <FieldError message={errors.branchId} />
                    </div>
                    {/* ── Referrer ── */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-800 tracking-tight">Referrer</span>
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-black text-[10px] px-2">
                                    {selectedReferrer ? '1 SELECTED' : 'NONE'}
                                </Badge>
                            </div>
                            <Button
                                type="button"
                                variant="gradient"
                                size="sm"
                                className="gap-1.5 font-black text-xs"
                                onClick={() => setAddReferrerOpen(true)}
                                disabled={pending}
                            >
                                <Plus size={14} className="group-hover:rotate-90 transition-transform" aria-hidden />
                                Add Referrer
                            </Button>
                        </div>

                        {selectedReferrer ? (
                            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Referrer Name</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Details</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all border border-gray-200">
                                                        <Building2 size={14} />
                                                    </div>
                                                    <div className="text-sm font-bold text-slate-900 truncate">{getReferrerName(selectedReferrer)}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[9px] font-black border-gray-200 max-w-xs truncate">
                                                    {referrerMeta(selectedReferrer)}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                    onClick={() => setSelectedReferrer(null)}
                                                    disabled={pending}
                                                    aria-label="Remove referrer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div
                                className="rounded-xl border-2 border-dashed border-gray-200 bg-white py-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors group"
                                onClick={() => setAddReferrerOpen(true)}
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200 mb-3 group-hover:bg-emerald-50 group-hover:text-emerald-400 transition-all border border-gray-100">
                                    <Building2 size={24} />
                                </div>
                                <p className="text-slate-400 text-sm font-bold">No referrer added yet.</p>
                                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                    Click &quot;Add Referrer&quot;
                                </p>
                            </div>
                        )}
                        <FieldError message={errors.referrerName} />
                    </div>

                    {/* ── Doctor ── */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-800 tracking-tight">Doctor</span>
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-black text-[10px] px-2">
                                    {referringDoctors.length} ITEMS
                                </Badge>
                            </div>
                            <Button
                                type="button"
                                variant="gradient"
                                size="sm"
                                className="gap-1.5 font-black text-xs"
                                onClick={() => setAddDoctorOpen(true)}
                                disabled={pending || !branchId}
                            >
                                <Plus size={14} className="group-hover:rotate-90 transition-transform" aria-hidden />
                                Add Doctor
                            </Button>
                        </div>

                        {referringDoctors.length > 0 ? (
                            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor Name</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Details</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {referringDoctors.map((doctor) => (
                                            <tr key={doctor.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all border border-gray-200">
                                                            <Stethoscope size={14} />
                                                        </div>
                                                        <div className="text-sm font-bold text-slate-900 truncate">{doctor.doctorName}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[9px] font-black border-gray-200 max-w-xs truncate">
                                                        {referringDoctorMeta(doctor)}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        onClick={() => removeReferringDoctor(doctor.id)}
                                                        disabled={pending}
                                                        aria-label={`Remove ${doctor.doctorName}`}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div
                                className="rounded-xl border-2 border-dashed border-gray-200 bg-white py-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors group"
                                onClick={() => branchId ? setAddDoctorOpen(true) : undefined}
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200 mb-3 group-hover:bg-emerald-50 group-hover:text-emerald-400 transition-all border border-gray-100">
                                    <Stethoscope size={24} />
                                </div>
                                <p className="text-slate-400 text-sm font-bold">No referring doctors added yet.</p>
                                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                    Click &quot;Add Doctor&quot;
                                </p>
                            </div>
                        )}
                        <FieldError message={errors.referringDoctor} />
                    </div>

                    {/* ── Tests (modal) ── */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <Label className={LABEL_CLS}>Requisition items *</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1.5 font-bold"
                                onClick={() => setAddTestsOpen(true)}
                                disabled={pending || !branchId}
                            >
                                <Plus size={14} aria-hidden />
                                Add tests
                            </Button>
                        </div>

                        {tests.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                No tests added yet. Select a branch and add at least one test.
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {tests.map((test) => (
                                    <li
                                        key={test.id}
                                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                            <FlaskConical size={16} aria-hidden />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-bold text-slate-900 truncate">{test.name}</div>
                                            <div className="text-xs text-slate-500">{test.category}</div>
                                        </div>
                                        <button
                                            type="button"
                                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                            onClick={() => setTests((prev) => prev.filter((t) => t.id !== test.id))}
                                            disabled={pending}
                                            aria-label={`Remove ${test.name}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <FieldError message={errors.tests} />
                    </div>

                    {/* ── Optional section ── */}
                    <div className="relative border-t border-slate-100 pt-5 mt-1">
                        <span className="absolute -top-2.5 left-0 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Optional
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="clinicalDiagnosis" className={LABEL_CLS}>
                                Clinical diagnosis
                            </Label>
                            <Input
                                id="clinicalDiagnosis"
                                value={clinicalDiagnosis}
                                onChange={(e) => setClinicalDiagnosis(e.target.value)}
                                placeholder="Optional"
                                className="border-slate-200"
                                disabled={pending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="clinicalNotes" className={LABEL_CLS}>
                                Clinical notes
                            </Label>
                            <Input
                                id="clinicalNotes"
                                value={clinicalNotes}
                                onChange={(e) => setClinicalNotes(e.target.value)}
                                placeholder="Optional"
                                className="border-slate-200"
                                disabled={pending}
                            />
                        </div>
                    </div>
                    <div
                        className={cn(
                            'flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
                            isEmergencyPriority(priority)
                                ? 'border-rose-200 bg-rose-50/80'
                                : 'border-slate-200 bg-slate-50/80'
                        )}
                    >
                        <input
                            id="isEmergency"
                            type="checkbox"
                            checked={isEmergencyPriority(priority)}
                            onChange={(e) =>
                                setPriority(e.target.checked ? 'STAT' : DEFAULT_ORDER_PRIORITY)
                            }
                            className="h-4 w-4 shrink-0 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                            disabled={pending}
                        />
                        <Label
                            htmlFor="isEmergency"
                            className="mb-0 flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-800"
                        >
                            <Timer size={14} className="text-rose-500 shrink-0" aria-hidden />
                            Emergency requisition
                        </Label>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="drugAllergy" className={LABEL_CLS}>
                                Drug allergy
                            </Label>
                            <Input
                                id="drugAllergy"
                                value={drugAllergy}
                                onChange={(e) => setDrugAllergy(e.target.value)}
                                placeholder="Optional"
                                className="border-slate-200"
                                disabled={pending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="srfId" className={LABEL_CLS}>
                                SRF ID
                            </Label>
                            <Input
                                id="srfId"
                                value={srfId}
                                onChange={(e) => setSrfId(e.target.value)}
                                placeholder="SRF-2026-001234"
                                className="border-slate-200"
                                disabled={pending}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="lmpDate" className={LABEL_CLS}>
                                LMP date
                            </Label>
                            <Input
                                id="lmpDate"
                                type="date"
                                value={lmpDate}
                                onChange={(e) => setLmpDate(e.target.value)}
                                className="border-slate-200"
                                disabled={pending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expectedReportDate" className={LABEL_CLS}>
                                Expected report date
                            </Label>
                            <Input
                                id="expectedReportDate"
                                type="date"
                                value={expectedReportDate}
                                onChange={(e) => setExpectedReportDate(e.target.value)}
                                className="border-slate-200"
                                disabled={pending}
                            />
                        </div>
                    </div>

                    <PreExistingDynamics
                        selected={diseases}
                        onChange={setDiseases}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="concessionAmount" className={LABEL_CLS}>
                                Concession amount
                            </Label>
                            <Input
                                id="concessionAmount"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={5}
                                value={concessionAmount}
                                onChange={(e) => setConcessionAmount(parseAmountInput(e.target.value))}
                                className="border-slate-200"
                                disabled={pending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="concessionBy" className={LABEL_CLS}>
                                Concession by
                            </Label>
                            <Input
                                id="concessionBy"
                                value={concessionBy}
                                onChange={(e) => setConcessionBy(e.target.value)}
                                placeholder="Optional"
                                className="border-slate-200"
                                disabled={pending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="emergencyCharge" className={LABEL_CLS}>
                                Emergency charge
                            </Label>
                            <Input
                                id="emergencyCharge"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={5}
                                value={emergencyCharge}
                                onChange={(e) => setEmergencyCharge(parseAmountInput(e.target.value))}
                                className="border-slate-200"
                                disabled={pending}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="createdByName" className={LABEL_CLS}>
                            Created by
                        </Label>
                        <Input
                            id="createdByName"
                            value={getCreatedByName()}
                            className="border-slate-200 bg-slate-50"
                            disabled
                            readOnly
                        />
                    </div>
                 
                </form>
            </RightDrawer>

            {/* ── Sub-drawers ── */}
            <ReferrerSelect
                hideTrigger
                drawerOpen={addReferrerOpen}
                onDrawerOpenChange={setAddReferrerOpen}
                value={selectedReferrer?.id ?? null}
                onChange={(id, referrer) => {
                    setSelectedReferrer(referrer);
                    clearError('referrerName');
                }}
            />

            <AddReferringDoctorModal
                isOpen={addDoctorOpen}
                onClose={() => setAddDoctorOpen(false)}
                onAdd={(doctors) => {
                    setReferringDoctors((prev) => {
                        const byId = new Map(prev.map((d) => [d.id, d]));
                        doctors.forEach((d) => byId.set(d.id, d));
                        return Array.from(byId.values());
                    });
                    clearError('referringDoctor');
                }}
                branchId={branchId}
            />

            <AddInvestigationsModal
                isOpen={addTestsOpen}
                onClose={() => setAddTestsOpen(false)}
                onAdd={handleAddTests}
                branchId={branchId}
            />
        </>
    );
}

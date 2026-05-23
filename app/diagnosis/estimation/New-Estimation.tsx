'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRightCircle,
  Building2,
  FileText,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Badge,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { RightDrawer } from '@/components/ui/right-drawer';
import SelectBranch from '@/app/diagnosis/diagnostic-booking/select-branch';
import PatientSearchSelect from '@/app/diagnosis/diagnostic-booking/PatientSearchSelect';
import PreExistingDynamics from '@/app/diagnosis/diagnostic-booking/PreExistingDynamics';
import { mapPatientToBookingForm } from '@/app/diagnosis/diagnostic-booking/patientFormUtils';
import AddReferringDoctorModal from '@/app/diagnosis/diagnostic-booking/booking/AddReferringDoctorModal';
import {
  DEFAULT_COLLECTION_TIME,
  isoDateOffset,
  todayIsoDate,
} from '@/app/diagnosis/diagnostic-booking/booking/bookingFormDefaults';
import type { Branch } from '@/app/Apis/branch/branchApi';
import type { Patient } from '@/app/Apis/Patients/Patient_Service_API';
import type { ReferringDoctor } from '@/app/Apis/doctor/referringDoctorApi';
import { useCreateEstimation } from '@/app/Apis/booking/useEstimations';
import {
  mapEstimationFormToPayload,
  type EstimationFormSnapshot,
  type EstimationInvestigation,
} from '@/app/Apis/booking/mapEstimationForm';
import { ORDER_PRIORITIES } from '@/app/Apis/booking/orderPriority';
import { getLoggedInFullName } from '@/app/utils/loggedInUser';
import EstimationAddTestsModal from './EstimationAddTestsModal';

const FORM_ID = 'new-estimation-form';
const FIELD_LABEL =
  'text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1';
const INPUT_CLASS = 'border-gray-300';

type Phase = 'branch' | 'form';

function createDefaultForm(): EstimationFormSnapshot {
  const staffName = getLoggedInFullName();
  return {
    patientId: null,
    estimationDate: todayIsoDate(),
    validUntil: isoDateOffset(30),
    priority: 'ROUTINE',
    referringDoctorId: null,
    referringHospitalId: null,
    clinicalNotes: '',
    drugAllergy: '',
    diseases: [],
    lmpDate: '',
    referrerName: '',
    srfId: '',
    discount: '',
    discountType: '%',
    concessionAmount: '',
    concessionBy: '',
    emergencyCharge: '0',
    contrastCharge: '0',
    estimatedTaxAmount: '',
    estimatedCollectionDate: isoDateOffset(1),
    estimatedCollectionTime: DEFAULT_COLLECTION_TIME,
    estimatedReportDate: isoDateOffset(3),
    requestedBy: staffName,
    contactEmail: '',
    contactPhone: '',
    remarks: '',
    createdByName: staffName,
  };
}

function referringDoctorMeta(doctor: ReferringDoctor) {
  const parts: string[] = [];
  if (doctor.specialization?.trim()) parts.push(doctor.specialization.trim());
  if (doctor.hospitalName?.trim()) parts.push(doctor.hospitalName.trim());
  if (doctor.mobile?.trim()) parts.push(doctor.mobile.trim());
  return parts.join(' · ') || 'Referring doctor';
}

export interface NewEstimationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NewEstimation({ isOpen, onClose, onSuccess }: NewEstimationProps) {
  const createMutation = useCreateEstimation();

  const [phase, setPhase] = useState<Phase>('branch');
  const [branchId, setBranchId] = useState<number | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState<EstimationFormSnapshot>(createDefaultForm);
  const [investigations, setInvestigations] = useState<EstimationInvestigation[]>([]);
  const [referringDoctors, setReferringDoctors] = useState<ReferringDoctor[]>([]);
  const [addTestsOpen, setAddTestsOpen] = useState(false);
  const [addDoctorOpen, setAddDoctorOpen] = useState(false);

  const resetAll = () => {
    setPhase('branch');
    setBranchId(null);
    setBranch(null);
    setForm(createDefaultForm());
    setInvestigations([]);
    setReferringDoctors([]);
    setAddTestsOpen(false);
    setAddDoctorOpen(false);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const name = getLoggedInFullName();
    if (name) {
      setForm((f) => ({
        ...f,
        requestedBy: f.requestedBy || name,
        createdByName: f.createdByName || name,
      }));
    }
  }, [isOpen]);

  const handleBranchChange = (id: number, b: Branch | null) => {
    setBranchId(id);
    setBranch(b);
  };

  const handleContinueBranch = () => {
    if (!branchId || !branch) {
      toast.error('Select a branch to continue.');
      return;
    }
    setPhase('form');
  };

  const handlePatientSelect = (patient: Patient) => {
    const mapped = mapPatientToBookingForm(patient, '');
    setForm((f) => ({
      ...f,
      patientId: patient.id,
      drugAllergy: mapped.drugAllergy ?? f.drugAllergy,
      diseases: mapped.diseases ?? f.diseases,
      referringDoctorId: mapped.referringDoctorId ?? f.referringDoctorId,
      contactEmail: patient.email?.trim() || f.contactEmail,
      contactPhone: patient.mobilePrimary?.trim() || f.contactPhone,
    }));
  };

  const syncReferringDoctorForm = (doctors: ReferringDoctor[]) => {
    const primary = doctors[doctors.length - 1];
    setForm((f) => ({
      ...f,
      referringDoctorId: primary?.id ?? null,
      referrerName: primary?.doctorName ?? f.referrerName,
    }));
  };

  const removeReferringDoctor = (id: number) => {
    setReferringDoctors((prev) => {
      const next = prev.filter((d) => d.id !== id);
      syncReferringDoctorForm(next);
      return next;
    });
  };

  const testsSubtotal = useMemo(
    () => investigations.reduce((s, i) => s + i.mrp, 0),
    [investigations]
  );

  const setField =
    <K extends keyof EstimationFormSnapshot>(key: K) =>
    (value: EstimationFormSnapshot[K]) => {
      setForm((f) => ({ ...f, [key]: value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) {
      toast.error('Branch is required.');
      return;
    }

    const selectedDoctorId =
      referringDoctors.length > 0
        ? referringDoctors[referringDoctors.length - 1].id
        : form.referringDoctorId;

    try {
      const payload = mapEstimationFormToPayload({
        form,
        investigations,
        branchId,
        referringDoctorId: selectedDoctorId,
      });

      const result = await createMutation.mutateAsync(payload);
      const label = result.data?.estimationNumber
        ? `Estimation ${result.data.estimationNumber}`
        : 'Estimation';
      toast.success(result.message || `${label} created successfully.`);
      onSuccess?.();
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create estimation.');
    }
  };

  const drawerTitle =
    phase === 'branch' ? (
      <>
        Select <span className="text-emerald-200">Branch</span>
      </>
    ) : (
      <>
        New <span className="text-emerald-200">Estimation</span>
      </>
    );

  const drawerDescription =
    phase === 'branch'
      ? 'Choose the operational branch before creating an estimation'
      : branch
        ? `${branch.branchName} · Patient test estimation`
        : 'Create patient test estimation';

  return (
    <>
      <EstimationAddTestsModal
        isOpen={addTestsOpen}
        onClose={() => setAddTestsOpen(false)}
        branchId={branchId ?? 0}
        existingTestIds={investigations.map((i) => i.id)}
        onAdd={(tests) => {
          setInvestigations((prev) => {
            const byId = new Map(prev.map((t) => [t.id, t]));
            for (const t of tests) byId.set(t.id, t);
            return [...byId.values()];
          });
        }}
      />
      <AddReferringDoctorModal
        isOpen={addDoctorOpen}
        onClose={() => setAddDoctorOpen(false)}
        branchId={branchId ?? 0}
        onAdd={(doctors) => {
          setReferringDoctors((prev) => {
            const next = [...prev, ...doctors];
            syncReferringDoctorForm(next);
            return next;
          });
        }}
      />

      <RightDrawer
        isOpen={isOpen}
        onClose={handleClose}
        title={
          <div className="flex items-center gap-3">
            {phase === 'branch' ? (
              <Building2 className="text-white" size={22} aria-hidden />
            ) : (
              <FileText className="text-white" size={22} aria-hidden />
            )}
            <span>{drawerTitle}</span>
          </div>
        }
        description={drawerDescription}
        maxWidth="2xl"
        footer={
          phase === 'branch' ? (
            <div className="flex flex-wrap gap-3 w-full justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-slate-200 text-slate-600 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleContinueBranch}
                disabled={!branchId || !branch}
                className="custom-gradient text-white font-bold gap-2 min-w-[180px]"
              >
                Continue
                <ArrowRightCircle size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 w-full justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPhase('branch')}
                disabled={createMutation.isPending}
                className="border-slate-200 text-slate-600 font-bold gap-2"
              >
                <ArrowLeft size={16} />
                Change branch
              </Button>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={createMutation.isPending}
                  className="border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form={FORM_ID}
                  disabled={createMutation.isPending}
                  className="custom-gradient text-white font-bold gap-2 min-w-[180px]"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating…
                    </>
                  ) : (
                    'Create estimation'
                  )}
                </Button>
              </div>
            </div>
          )
        }
      >
        {phase === 'branch' ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className={FIELD_LABEL}>Operational branch</Label>
              <SelectBranch
                value={branchId}
                onChange={handleBranchChange}
                autoSelectFirst={false}
              />
            </div>
            {branch ? (
              <div className="rounded-2xl border border-teal-100 bg-teal-50/40 p-5 space-y-1">
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">
                  Selected branch
                </p>
                <p className="text-lg font-black text-slate-900">{branch.branchName}</p>
                {branch.branchType ? (
                  <Badge className="bg-teal-100 text-teal-700 border-teal-200 text-[9px] font-black uppercase">
                    {branch.branchType.replace(/_/g, ' ')}
                  </Badge>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
                Select a branch to continue
              </p>
            )}
          </div>
        ) : (
          <form id={FORM_ID} onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
            {branch ? (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                <Building2 size={14} className="text-teal-600 shrink-0" />
                <span className="text-slate-800">{branch.branchName}</span>
                <span className="text-slate-300">·</span>
                <span>Branch ID {branchId}</span>
              </div>
            ) : null}

            <section className="space-y-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Patient
              </h3>
              <PatientSearchSelect
                patientId={form.patientId}
                onPatientSelect={handlePatientSelect}
                onClear={() => setForm((f) => ({ ...f, patientId: null }))}
                required
              />
            </section>

            <section className="space-y-4 border-t border-slate-100 pt-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Estimation details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Estimation date</Label>
                  <Input
                    type="date"
                    value={form.estimationDate}
                    onChange={(e) => setField('estimationDate')(e.target.value)}
                    className={INPUT_CLASS}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Valid until</Label>
                  <Input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setField('validUntil')(e.target.value)}
                    className={INPUT_CLASS}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Priority</Label>
                  <Select
                    value={form.priority}
                    onValueChange={(v) => {
                      if (v) setField('priority')(v);
                    }}
                  >
                    <SelectTrigger className={INPUT_CLASS}>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_PRIORITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Requested by / Created by</Label>
                  <Input
                    value={form.requestedBy}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((f) => ({
                        ...f,
                        requestedBy: value,
                        createdByName: value,
                      }));
                    }}
                    placeholder="Front Desk"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t border-slate-100 pt-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Medical information
              </h3>
              <div className="space-y-2">
                <Label className={FIELD_LABEL}>Drug allergy</Label>
                <Input
                  value={form.drugAllergy}
                  onChange={(e) => setField('drugAllergy')(e.target.value)}
                  placeholder="Penicillin"
                  className="bg-rose-50 border-rose-200 text-rose-800 font-semibold"
                />
              </div>
              <PreExistingDynamics
                selected={form.diseases}
                onChange={(diseases) => setForm((f) => ({ ...f, diseases }))}
              />
              <div className="space-y-2 max-w-xs">
                <Label className={FIELD_LABEL}>LMP date</Label>
                <Input
                  type="date"
                  value={form.lmpDate}
                  onChange={(e) => setField('lmpDate')(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="space-y-2">
                <Label className={FIELD_LABEL}>Clinical notes</Label>
                <Input
                  value={form.clinicalNotes}
                  onChange={(e) => setField('clinicalNotes')(e.target.value)}
                  placeholder="Routine blood work for annual checkup"
                  className={INPUT_CLASS}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Referrer name</Label>
                  <Input
                    value={form.referrerName}
                    onChange={(e) => setField('referrerName')(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>SRF ID</Label>
                  <Input
                    value={form.srfId}
                    onChange={(e) => setField('srfId')(e.target.value)}
                    placeholder="SRF-2026-001"
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Referring hospital ID</Label>
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
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Referring doctor
                  </h3>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-black">
                    {referringDoctors.length}
                  </Badge>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setAddDoctorOpen(true)}
                  className="rounded-xl custom-gradient text-white text-xs font-black gap-1"
                >
                  <Plus size={14} /> Add doctor
                </Button>
              </div>
              {referringDoctors.length > 0 ? (
                <ul className="space-y-2">
                  {referringDoctors.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">
                          {doc.doctorName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {referringDoctorMeta(doc)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeReferringDoctor(doc.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0"
                        aria-label="Remove doctor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">Optional — add a referring doctor if needed.</p>
              )}
            </section>

            <section className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Tests
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Subtotal ₹{testsSubtotal.toLocaleString('en-IN')}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setAddTestsOpen(true)}
                  className="rounded-xl custom-gradient text-white text-xs font-black gap-1"
                >
                  <Plus size={14} /> Add tests
                </Button>
              </div>
              {investigations.length > 0 ? (
                <ul className="space-y-2">
                  {investigations.map((inv) => (
                    <li
                      key={inv.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3"
                    >
                      <span className="font-semibold text-slate-800 text-sm truncate">
                        {inv.name}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-black text-emerald-700">
                          ₹{inv.mrp.toLocaleString('en-IN')}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setInvestigations((prev) => prev.filter((i) => i.id !== inv.id))
                          }
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                          aria-label="Remove test"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  Add at least one test before submitting.
                </p>
              )}
            </section>

            <section className="space-y-4 border-t border-slate-100 pt-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Financial
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Discount</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={form.discount}
                      onChange={(e) => setField('discount')(e.target.value)}
                      className={INPUT_CLASS}
                    />
                    <Select
                      value={form.discountType}
                      onValueChange={(v) => {
                        if (v) setField('discountType')(v);
                      }}
                    >
                      <SelectTrigger className="w-20 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="₹">₹</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Concession amount</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.concessionAmount}
                    onChange={(e) => setField('concessionAmount')(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Concession by</Label>
                  <Input
                    value={form.concessionBy}
                    onChange={(e) => setField('concessionBy')(e.target.value)}
                    placeholder="Reception"
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Estimated tax</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.estimatedTaxAmount}
                    onChange={(e) => setField('estimatedTaxAmount')(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Emergency charge</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.emergencyCharge}
                    onChange={(e) => setField('emergencyCharge')(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Contrast charge</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.contrastCharge}
                    onChange={(e) => setField('contrastCharge')(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t border-slate-100 pt-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Collection & contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Collection date</Label>
                  <Input
                    type="date"
                    value={form.estimatedCollectionDate}
                    onChange={(e) => setField('estimatedCollectionDate')(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Collection time</Label>
                  <Input
                    type="time"
                    value={form.estimatedCollectionTime}
                    onChange={(e) => setField('estimatedCollectionTime')(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Estimated report date</Label>
                  <Input
                    type="date"
                    value={form.estimatedReportDate}
                    onChange={(e) => setField('estimatedReportDate')(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Contact phone</Label>
                  <Input
                    value={form.contactPhone}
                    onChange={(e) => setField('contactPhone')(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className={FIELD_LABEL}>Contact email</Label>
                  <Input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setField('contactEmail')(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className={FIELD_LABEL}>Remarks</Label>
                  <Input
                    value={form.remarks}
                    onChange={(e) => setField('remarks')(e.target.value)}
                    placeholder="Patient requested morning collection"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </section>
          </form>
        )}
      </RightDrawer>
    </>
  );
}

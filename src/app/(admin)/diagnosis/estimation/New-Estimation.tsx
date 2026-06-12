'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRightCircle,
  Building2,
  FileText,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, Badge, Label } from '@/components/ui';
import { RightDrawer } from '@/components/ui/right-drawer';
import SelectBranch from '@/app/diagnosis/diagnostic-booking/select-branch';
import AddInvestigationsModal from '@/app/diagnosis/diagnostic-booking/AddInvestigationsModal';
import AddReferringDoctorModal from '@/app/diagnosis/diagnostic-booking/booking/AddReferringDoctorModal';
import AddReferrerModal from '@/app/diagnosis/diagnostic-booking/booking/AddReferrerModal';
import DiagnosticIntakeForm from '@/app/diagnosis/diagnostic-booking/DiagnosticIntakeForm';
import {
  BLANK_BOOKING_FORM,
  createEstimationMetaDefaults,
  type DiagnosticBookingFormState,
  type EstimationMetaState,
} from '@/app/diagnosis/diagnostic-booking/bookingFormTypes';
import { mapPatientToBookingForm } from '@/app/diagnosis/diagnostic-booking/patientFormUtils';
import type { Branch } from '@/app/Apis/branch/branchApi';
import { fetchPatientById, type Patient } from '@/app/Apis/Patients/Patient_Service_API';
import { fetchReferringDoctorById, type ReferringDoctor } from '@/app/Apis/doctor/referringDoctorApi';
import type { Referrer } from '@/app/Apis/Referrer/referrerApi';
import { useCreateEstimation } from '@/app/Apis/booking/useEstimations';
import { mapBookingFormToEstimationPayload } from '@/app/Apis/booking/mapBookingFormToEstimation';
import type { BookingInvestigation } from '@/app/Apis/booking/mapBookingToTestOrder';
import { getLoggedInFullName } from '@/app/utils/loggedInUser';

const FORM_ID = 'new-estimation-form';
const FIELD_LABEL =
  'text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1';

type Phase = 'branch' | 'form';

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
  const [form, setForm] = useState<DiagnosticBookingFormState>({ ...BLANK_BOOKING_FORM });
  const [estimationMeta, setEstimationMeta] = useState<EstimationMetaState>(
    createEstimationMetaDefaults
  );
  const [investigations, setInvestigations] = useState<BookingInvestigation[]>([]);
  const [referringDoctors, setReferringDoctors] = useState<ReferringDoctor[]>([]);
  const [addInvOpen, setAddInvOpen] = useState(false);
  const [addDoctorOpen, setAddDoctorOpen] = useState(false);
  const [addReferrerOpen, setAddReferrerOpen] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState<Referrer | null>(null);
  const [mobileLookupMessage, setMobileLookupMessage] = useState<string | null>(null);
  const [apiDynamicsOptions, setApiDynamicsOptions] = useState<string[]>([]);

  const resetAll = () => {
    setPhase('branch');
    setBranchId(null);
    setBranch(null);
    setForm({ ...BLANK_BOOKING_FORM });
    setEstimationMeta(createEstimationMetaDefaults());
    setInvestigations([]);
    setReferringDoctors([]);
    setSelectedReferrer(null);
    setAddInvOpen(false);
    setAddDoctorOpen(false);
    setAddReferrerOpen(false);
    setMobileLookupMessage(null);
    setApiDynamicsOptions([]);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const name = getLoggedInFullName();
    if (name) {
      setForm((f) => ({ ...f, createdByName: f.createdByName || name }));
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

  const applyPatientRecord = useCallback(async (patient: Patient, mobileOverride?: string) => {
    const digits = (mobileOverride ?? patient.mobilePrimary ?? '').replace(/\D/g, '');
    const allergyNames = patient.allergies?.map((a) => a.allergyName).filter(Boolean) ?? [];
    setApiDynamicsOptions(allergyNames);
    const mapped = mapPatientToBookingForm(patient, digits);
    setForm((f) => ({ ...f, ...mapped }));

    if (mapped.referringDoctorId != null && mapped.referringDoctorId > 0) {
      try {
        const docRes = await fetchReferringDoctorById(mapped.referringDoctorId);
        if (docRes?.data) setReferringDoctors([docRes.data]);
      } catch {
        setReferringDoctors([]);
      }
    } else {
      setReferringDoctors([]);
    }
  }, []);

  const clearPatientRecord = useCallback(() => {
    setMobileLookupMessage(null);
    setApiDynamicsOptions([]);
    setReferringDoctors([]);
    setForm((f) => ({
      ...f,
      patientId: undefined,
      mobile: '',
      title: BLANK_BOOKING_FORM.title,
      patientName: '',
      age: '',
      gender: BLANK_BOOKING_FORM.gender,
      address: '',
      email: '',
      drugAllergy: '',
      diseases: [],
      referringDoctorId: null,
      referredDoctor: '',
    }));
  }, []);

  const handlePatientSearchSelect = useCallback(
    async (patient: Patient) => {
      if (!patient.id) return;
      setMobileLookupMessage(null);
      try {
        const hasProfile =
          Boolean(patient.firstName && patient.patientCode && patient.mobilePrimary) &&
          (patient.addresses != null || patient.allergies != null);
        const full = hasProfile
          ? patient
          : ((await fetchPatientById(patient.id)).data ?? patient);
        await applyPatientRecord(full);
        setMobileLookupMessage(
          full.patientCode
            ? `Patient found: ${full.patientCode}`
            : 'Patient details loaded'
        );
      } catch (err) {
        setMobileLookupMessage(
          err instanceof Error ? err.message : 'Failed to load patient details'
        );
      }
    },
    [applyPatientRecord]
  );

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
      const payload = mapBookingFormToEstimationPayload({
        form,
        meta: estimationMeta,
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

  return (
    <>
      <AddInvestigationsModal
        isOpen={addInvOpen}
        onClose={() => setAddInvOpen(false)}
        branchId={branchId ?? 0}
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
            const primary = next[next.length - 1];
            setForm((f) => ({
              ...f,
              referringDoctorId: primary?.id ?? null,
              referredDoctor: primary?.doctorName ?? '',
              referrer: primary?.doctorName ?? f.referrer,
            }));
            return next;
          });
        }}
      />
      <AddReferrerModal
        isOpen={addReferrerOpen}
        onClose={() => setAddReferrerOpen(false)}
        selectedReferrerId={selectedReferrer?.id}
        onSelect={(referrer) => {
          setSelectedReferrer(referrer);
          setForm((f) => ({
            ...f,
            referringHospitalId: referrer.id,
            referrer:
              referrer.referrerName?.trim() ||
              referrer.fullName?.trim() ||
              referrer.name?.trim() ||
              '',
          }));
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
            <span>
              {phase === 'branch' ? (
                <>
                  Select <span className="text-emerald-200">Branch</span>
                </>
              ) : (
                <>
                  New <span className="text-emerald-200">Estimation</span>
                </>
              )}
            </span>
          </div>
        }
        description={
          phase === 'branch'
            ? 'Choose the operational branch (same as diagnostic booking)'
            : branch
              ? `${branch.branchName} · Diagnostic booking intake`
              : 'Create estimation'
        }
        maxWidth={phase === 'form' ? 'full' : 'lg'}
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
                  disabled={createMutation.isPending || investigations.length === 0}
                  className="custom-gradient text-white font-bold gap-2 min-w-[200px] h-12"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating estimation…
                    </>
                  ) : (
                    <>
                      Create estimation
                      <ArrowRightCircle size={18} />
                    </>
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
          <form id={FORM_ID} onSubmit={(e) => void handleSubmit(e)}>
            <DiagnosticIntakeForm
              form={form}
              setForm={setForm}
              investigations={investigations}
              setInvestigations={setInvestigations}
              referringDoctors={referringDoctors}
              onReferringDoctorsChange={setReferringDoctors}
              branchId={branchId ?? 0}
              mobileLookupMessage={mobileLookupMessage}
              apiDynamicsOptions={apiDynamicsOptions}
              onPatientSelect={handlePatientSearchSelect}
              onClearPatient={clearPatientRecord}
              onOpenAddTests={() => {
                if (!branchId) {
                  toast.error('Select a branch before adding tests.');
                  return;
                }
                setAddInvOpen(true);
              }}
              onOpenAddDoctor={() => setAddDoctorOpen(true)}
              onOpenAddReferrer={() => setAddReferrerOpen(true)}
              selectedReferrer={selectedReferrer}
              onRemoveReferrer={() => {
                setSelectedReferrer(null);
                setForm((f) => ({
                  ...f,
                  referringHospitalId: null,
                  referrer: '',
                }));
              }}
              variant="estimation"
              estimationMeta={estimationMeta}
              setEstimationMeta={setEstimationMeta}
            />
          </form>
        )}
      </RightDrawer>
    </>
  );
}

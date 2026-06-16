'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  User,
  Mail,
  MapPin,
  Globe,
  Activity,
  Stethoscope,
  X,
  ChevronRight,
  CreditCard,
  Trash2,
  FlaskConical,
  Droplets,
  Timer,
  AlertTriangle,
  Calendar,
  ArrowRightCircle,
  ArrowLeft,
  Download,
  MoreVertical,
  Zap,
  Loader2,
  Info,
  Lock,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import {
  Button,
  Badge,
  Card,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Table
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Branch } from '@/app/Apis/branch/branchApi';
import SelectBranch from '../select-branch';
import type { Patient } from '@/app/Apis/Patients/Patient_Service_API';
import PatientSearchSelect from '../PatientSearchSelect';
import CollectorSearchSelect from '../CollectorSearchSelect';
import { mapPatientToBookingForm } from '../patientFormUtils';
import PreExistingDynamics from '../PreExistingDynamics';
import ReferrerSelect from '../ReferrerSelect';
import AddInvestigationsModal from '../AddInvestigationsModal';
import AddReferringDoctorModal from './AddReferringDoctorModal';
import type { BookingInvestigation } from '../bookingInvestigationUtils';
import {
  fetchReferrerById,
  getReferrerName,
  getReferrerPhone,
  type Referrer,
} from '@/app/Apis/Referrer/referrerApi';
import {
  BLANK_MEMBER_CARD,
  MEMBERSHIP_CARD_PAYMENT_MODE,
  MemberCardDrawer,
  MemberCardSummaryButton,
} from './membercard';
import {
  fetchReferringDoctorById,
  type ReferringDoctor,
} from '@/app/Apis/doctor/referringDoctorApi';
import {
  computeBookingFinancials,
  mapBookingToTestOrderPayload,
} from '@/app/Apis/booking/mapBookingToTestOrder';
import {
  mapBookingFormToFinancialPayload,
  mapBookingFormToMedicalPayload,
  mapTestOrderToFinancialForm,
  mapTestOrderToMedicalForm,
  priorityToProcessing,
} from '@/app/Apis/booking/mapTestOrderEdit';
import {
  DEFAULT_ORDER_PRIORITY,
  ORDER_PRIORITIES,
  orderPriorityLabel,
  orderPriorityTurnaroundHours,
} from '@/app/Apis/booking/orderPriority';
import type { TestOrder } from '@/app/Apis/booking/testOrderApi';
import {
  useCreateTestOrder,
  useTestOrderDetail,
  useUpdateTestOrderFinancial,
  useUpdateTestOrderMedical,
} from '@/app/Apis/booking/useTestOrders';
import { fetchPatientById } from '@/app/Apis/Patients/Patient_Service_API';
import { toast } from 'sonner';
import {
  DEFAULT_COLLECTION_TIME,
  isoDateOffset,
  todayIsoDate,
} from './bookingFormDefaults';
import PatientLastVisit from './patient_last_visit';

// ─── Types & Constants ───────────────────────────────────────────────────────
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

interface FormState {
  country: string;
  mobile: string;
  title: string;
  patientName: string;
  age: string;
  month: string;
  day: string;
  gender: string;
  address: string;
  email: string;
  diagnosis: string;
  nationality: string;
  drugAllergy: string;
  diseases: string[];
  referredDoctor: string;
  referringDoctorId?: number | null;
  referringHospitalId?: number | null;
  referrer: string;
  processing: string;
  emergencyCharge: string;
  phlebotomist: string;
  contrast: string;
  discount: string;
  discountType: string;
  discountBy: string;
  concessionAmount: string;
  concessionBy: string;
  collectionDate: string;
  collectionTime: string;
  expectedReportDate: string;
  payment: string;
  paymentMode: string;
  paymentReference: string;
  createdByName: string;
  membershipCardNumber: string;
  membershipCardHolderName: string;
  membershipCardHolderEmail: string;
  membershipCardOtp: string;
  srfId: string;
  lmpDate: string;
  patientId?: number;
}

function readOnlyInputProps(isEditMode: boolean) {
  return isEditMode ? { disabled: true, readOnly: true } : {};
}

function formatBookingSubmitError(err: unknown): string {
  const message = err instanceof Error ? err.message : 'Failed to create test booking';
  const lower = message.toLowerCase();
  if (
    lower.includes('409') ||
    lower.includes('conflict') ||
    lower.includes('duplicate') ||
    lower.includes('already exists')
  ) {
    if (message.length > 24 && !message.startsWith('Request failed with status')) {
      return message;
    }
    return (
      'Booking conflict (409): this patient may already have an active order with the same tests or date. ' +
      'Check the invoice list, or adjust collection date / tests and try again.'
    );
  }
  return message;
}

const TITLES = ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Smt.', 'Baby', 'M/s'];
const GENDERS = ['Male', 'Female', 'Other'];
const PAY_MODES = ['Cash', 'Card', 'UPI', 'Online', 'Credit', 'Membership Card'];
const PAYMENT_MODES_WITH_REFERENCE = new Set(['Card', 'UPI', 'Online', 'Credit']);
const DISC_TYPES = ['%', 'Flat'];

const BLANK: FormState = {
  country: 'IND +91', mobile: '', title: 'Mr.', patientName: '',
  age: '', month: '0', day: '0', gender: 'Male',
  address: '', email: '', diagnosis: '', nationality: 'IND-India',
  drugAllergy: '',
  diseases: [], referredDoctor: '', referringDoctorId: null, referringHospitalId: null,
  referrer: '',
  processing: DEFAULT_ORDER_PRIORITY,
  emergencyCharge: '',
  phlebotomist: '', contrast: '',
  discount: '0', discountType: '%', discountBy: 'N/A',
  concessionAmount: '0', concessionBy: '',
  collectionDate: isoDateOffset(1),
  collectionTime: DEFAULT_COLLECTION_TIME,
  expectedReportDate: isoDateOffset(2),
  payment: '', paymentMode: 'Cash', paymentReference: '', createdByName: '',
  membershipCardNumber: BLANK_MEMBER_CARD.membershipCardNumber,
  membershipCardHolderName: BLANK_MEMBER_CARD.holderName,
  membershipCardHolderEmail: BLANK_MEMBER_CARD.holderEmail,
  membershipCardOtp: BLANK_MEMBER_CARD.otp,
  srfId: '', lmpDate: '',
};

// ─── Main Page ────────────────────────────────────────────────────────────────
function DiagnosticBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = Number(searchParams.get('orderId') || 0);
  const isEditMode = Number.isFinite(orderId) && orderId > 0;
  const branchId = Number(searchParams.get('branchId') || 0);
  const branchName = searchParams.get('branchName') || '';

  const [form, setForm] = useState<FormState>(BLANK);
  const [loadedOrder, setLoadedOrder] = useState<TestOrder | null>(null);
  const [orderHydrated, setOrderHydrated] = useState(false);
  const [investigations, setInvestigations] = useState<BookingInvestigation[]>([]);
  const [addInvOpen, setAddInvOpen] = useState(false);
  const [addReferringDoctorOpen, setAddReferringDoctorOpen] = useState(false);
  const [addReferrerOpen, setAddReferrerOpen] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState<Referrer | null>(null);
  const [memberCardDrawerOpen, setMemberCardDrawerOpen] = useState(false);
  const [referringDoctors, setReferringDoctors] = useState<ReferringDoctor[]>([]);
  const [mobileLookupMessage, setMobileLookupMessage] = useState<string | null>(null);
  const [apiDynamicsOptions, setApiDynamicsOptions] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createTestOrderMutation = useCreateTestOrder();
  const isSubmittingBookingRef = useRef(false);
  const { data: orderDetail, isLoading: orderLoading, isError: orderError, error: orderLoadError } =
    useTestOrderDetail(isEditMode ? orderId : null);
  const updateMedicalMutation = useUpdateTestOrderMedical();
  const updateFinancialMutation = useUpdateTestOrderFinancial();

  /** In edit mode, branch may come from the loaded order when URL has only `orderId`. */
  const effectiveBranchId =
    branchId > 0 ? branchId : (loadedOrder?.branchId ?? orderDetail?.data?.branchId ?? 0);

  const selectedBranch: Branch | null =
    effectiveBranchId > 0
      ? {
        id: effectiveBranchId,
        branchName: branchName || `Branch #${effectiveBranchId}`,
        branchCode: searchParams.get('branchCode') || '',
        branchType: searchParams.get('branchType') || '',
        address: null,
        city: null,
        state: null,
        country: null,
        postalCode: null,
        contactEmail: null,
        contactPhone: null,
        isActive: true,
        tenantId: 1,
      }
      : null;

  useEffect(() => {
    if (isEditMode) return;
    if (!branchId || branchId < 1) {
      router.replace('/diagnosis/diagnostic-booking');
    }
  }, [branchId, router, isEditMode]);

  useEffect(() => {
    if (!isEditMode || !orderDetail?.data || branchId > 0) return;
    const order = orderDetail.data;
    if (!order.branchId || order.branchId < 1) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('branchId', String(order.branchId));
    router.replace(`/diagnosis/diagnostic-booking/booking?${params.toString()}`, {
      scroll: false,
    });
  }, [isEditMode, orderDetail, branchId, router, searchParams]);

  useEffect(() => {
    if (!isEditMode || !orderDetail?.data || orderHydrated) return;

    const order = orderDetail.data;
    setLoadedOrder(order);
    const medical = mapTestOrderToMedicalForm(order);
    const financial = mapTestOrderToFinancialForm(order);

    setForm((f) => ({
      ...f,
      patientId: order.patientId,
      processing: medical.processing,
      drugAllergy: medical.drugAllergy,
      diseases: medical.diseases,
      diagnosis: medical.diagnosis,
      referrer: medical.referrer,
      srfId: medical.srfId,
      referringDoctorId: medical.referringDoctorId,
      referringHospitalId: medical.referringHospitalId,
      collectionDate: medical.collectionDate,
      collectionTime: medical.collectionTime,
      expectedReportDate: medical.expectedReportDate,
      phlebotomist: medical.phlebotomist,
      lmpDate: medical.lmpDate,
      discount: financial.discountAmount,
      discountType: 'Flat',
      concessionAmount: financial.concessionAmount,
      concessionBy: financial.concessionBy,
      emergencyCharge: financial.emergencyCharge,
      contrast: financial.contrast,
      payment: financial.payment,
      paymentMode: financial.paymentMode,
      paymentReference: financial.paymentReference,
    }));

    setInvestigations(
      (order.orderItems ?? []).map((item) => ({
        id: item.testId,
        name: `Test #${item.testId}`,
        mrp: item.testPrice,
        category: item.resultStatus,
      }))
    );

    if (order.referringDoctorId && order.referringDoctorId > 0) {
      fetchReferringDoctorById(order.referringDoctorId)
        .then((res) => {
          if (res?.data) setReferringDoctors([res.data]);
        })
        .catch(() => setReferringDoctors([]));
    }

    if (medical.referringHospitalId && medical.referringHospitalId > 0) {
      fetchReferrerById(medical.referringHospitalId)
        .then((res) => {
          if (res?.data) setSelectedReferrer(res.data);
        })
        .catch(() => setSelectedReferrer(null));
    }

    fetchPatientById(order.patientId)
      .then((res) => {
        if (!res.data) return;
        const mapped = mapPatientToBookingForm(res.data, res.data.mobilePrimary);
        setForm((f) => ({
          ...f,
          ...mapped,
          processing: priorityToProcessing(order.priority),
          drugAllergy: medical.drugAllergy,
          diseases: medical.diseases,
          diagnosis: medical.diagnosis,
          referrer: medical.referrer,
          srfId: medical.srfId,
          referringDoctorId: medical.referringDoctorId,
          referringHospitalId: medical.referringHospitalId,
          collectionDate: medical.collectionDate,
          collectionTime: medical.collectionTime,
          expectedReportDate: medical.expectedReportDate,
          phlebotomist: medical.phlebotomist,
          lmpDate: medical.lmpDate,
          discount: financial.discountAmount,
          discountType: 'Flat',
          concessionAmount: financial.concessionAmount,
          concessionBy: financial.concessionBy,
          emergencyCharge: financial.emergencyCharge,
          contrast: financial.contrast,
          payment: financial.payment,
          paymentMode: financial.paymentMode,
          paymentReference: financial.paymentReference,
          patientId: order.patientId,
        }));
      })
      .catch(() => {
        /* patient bio stays partial from order */
      });

    setOrderHydrated(true);
  }, [isEditMode, orderDetail, orderHydrated]);

  useEffect(() => {
    if (orderDetail?.data) {
      setLoadedOrder(orderDetail.data);
    }
  }, [orderDetail?.data]);

  const handleBranchChange = (id: number, selected: Branch | null) => {
    if (!selected) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('branchId', String(id));
    params.set('branchName', selected.branchName);
    if (selected.branchCode) {
      params.set('branchCode', selected.branchCode);
    } else {
      params.delete('branchCode');
    }
    if (selected.branchType) {
      params.set('branchType', selected.branchType);
    } else {
      params.delete('branchType');
    }
    router.replace(`/diagnosis/diagnostic-booking/booking?${params.toString()}`);
  };

  const set = (key: keyof FormState) => (e: any) => {
    const value = e && e.target ? e.target.value : e;
    setForm(f => ({ ...f, [key]: value }));
  };

  const handlePaymentModeChange = (mode: string | null) => {
    if (!mode) return;
    const isMembershipCard = mode === MEMBERSHIP_CARD_PAYMENT_MODE;
    const needsPaymentReference = PAYMENT_MODES_WITH_REFERENCE.has(mode);
    setForm((f) => ({
      ...f,
      paymentMode: mode,
      ...(!needsPaymentReference ? { paymentReference: '' } : {}),
      ...(isMembershipCard
        ? {}
        : {
          membershipCardNumber: BLANK_MEMBER_CARD.membershipCardNumber,
          membershipCardHolderName: BLANK_MEMBER_CARD.holderName,
          membershipCardHolderEmail: BLANK_MEMBER_CARD.holderEmail,
          membershipCardOtp: BLANK_MEMBER_CARD.otp,
        }),
    }));
    setMemberCardDrawerOpen(isMembershipCard);
  };

  const applyMemberCardForm = (card: typeof BLANK_MEMBER_CARD) => {
    setForm((f) => ({
      ...f,
      membershipCardNumber: card.membershipCardNumber,
      membershipCardHolderName: card.holderName,
      membershipCardHolderEmail: card.holderEmail,
      membershipCardOtp: card.otp,
    }));
  };

  const applyPatientRecord = useCallback(async (patient: Patient, mobileOverride?: string) => {
    const digits = (mobileOverride ?? patient.mobilePrimary ?? '').replace(/\D/g, '');
    const allergyNames =
      patient.allergies?.map((a) => a.allergyName).filter(Boolean) ?? [];
    setApiDynamicsOptions(allergyNames);
    const mapped = mapPatientToBookingForm(patient, digits);
    setForm((f) => ({ ...f, ...mapped }));

    if (mapped.referringDoctorId != null && mapped.referringDoctorId > 0) {
      try {
        const docRes = await fetchReferringDoctorById(mapped.referringDoctorId);
        if (docRes?.data) {
          setReferringDoctors([docRes.data]);
        }
      } catch {
        setReferringDoctors([]);
      }
    } else {
      setReferringDoctors([]);
    }

    return mapped;
  }, []);

  const clearPatientRecord = useCallback(() => {
    setMobileLookupMessage(null);
    setApiDynamicsOptions([]);
    setReferringDoctors([]);
    setForm((f) => ({
      ...f,
      patientId: undefined,
      mobile: '',
      title: BLANK.title,
      patientName: '',
      age: '',
      gender: BLANK.gender,
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
          : (await fetchPatientById(patient.id)).data ?? patient;
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

  const removeInvestigation = (id: number) => setInvestigations(prev => prev.filter(i => i.id !== id));

  const syncReferringDoctorForm = (doctors: ReferringDoctor[]) => {
    const primary = doctors[doctors.length - 1];
    setForm((f) => ({
      ...f,
      referringDoctorId: primary?.id ?? null,
      referredDoctor: primary?.doctorName ?? '',
    }));
  };

  const removeReferringDoctor = (id: number) => {
    setReferringDoctors((prev) => {
      const next = prev.filter((d) => d.id !== id);
      syncReferringDoctorForm(next);
      return next;
    });
  };

  const testsSubtotal = investigations.reduce((s, i) => s + i.mrp, 0);
  const financials = computeBookingFinancials(investigations, form);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedName = localStorage.getItem('fullName');
    if (storedName && !form.createdByName) {
      setForm((f) => ({ ...f, createdByName: storedName }));
    }
  }, []);

  const handleUpdateMedical = async () => {
    if (!loadedOrder) return;
    setSubmitError(null);
    try {
      const payload = mapBookingFormToMedicalPayload({
        drugAllergy: form.drugAllergy,
        diseases: form.diseases,
        lmpDate: form.lmpDate,
      });
      const result = await updateMedicalMutation.mutateAsync({
        orderId: loadedOrder.id,
        payload,
      });
      toast.success(result.message || 'Medical information updated.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update medical information';
      setSubmitError(message);
      toast.error(message);
    }
  };

  const handleUpdateFinancial = async () => {
    if (!loadedOrder) return;
    setSubmitError(null);
    try {
      const payload = mapBookingFormToFinancialPayload({
        processing: form.processing,
        concessionAmount: form.concessionAmount,
        concessionBy: form.concessionBy,
        emergencyCharge: form.emergencyCharge,
        contrast: form.contrast,
        phlebotomist: form.phlebotomist,
        actualPayable: financials.actualPayable,
      });
      const result = await updateFinancialMutation.mutateAsync({
        orderId: loadedOrder.id,
        payload,
      });
      toast.success(result.message || 'Financial information updated.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update financial information';
      setSubmitError(message);
      toast.error(message);
    }
  };

  const handleConfirmBooking = async () => {
    if (isSubmittingBookingRef.current || createTestOrderMutation.isPending) {
      return;
    }

    setSubmitError(null);

    if (!effectiveBranchId || effectiveBranchId < 1) {
      const msg = 'Select a branch before confirming the booking.';
      setSubmitError(msg);
      toast.error(msg);
      return;
    }
    if (!form.patientId || form.patientId < 1) {
      const msg = 'Search and select a patient before confirming the booking.';
      setSubmitError(msg);
      toast.error(msg);
      return;
    }
    if (investigations.length === 0) {
      const msg = 'Add at least one investigation to the order cart.';
      setSubmitError(msg);
      toast.error(msg);
      return;
    }

    if (form.paymentMode === MEMBERSHIP_CARD_PAYMENT_MODE) {
      if (!form.membershipCardNumber.trim()) {
        const msg = 'Enter the membership card number.';
        setSubmitError(msg);
        toast.error(msg);
        return;
      }
      if (!form.membershipCardHolderEmail.trim()) {
        const msg = 'Enter the cardholder email for OTP verification.';
        setSubmitError(msg);
        toast.error(msg);
        return;
      }
      if (!form.membershipCardOtp.trim()) {
        const msg = 'Enter the OTP sent to the cardholder email.';
        setSubmitError(msg);
        toast.error(msg);
        return;
      }
    }

    const selectedReferringDoctorId =
      referringDoctors.length > 0
        ? referringDoctors[referringDoctors.length - 1].id
        : form.referringDoctorId;

    isSubmittingBookingRef.current = true;
    try {
      const payload = mapBookingToTestOrderPayload({
        form,
        investigations,
        branchId: effectiveBranchId,
        testsSubtotal,
        referringDoctorId: selectedReferringDoctorId,
      });

      if (process.env.NODE_ENV === 'development') {
        console.info('[test-order] POST payload', payload);
      }

      const result = await createTestOrderMutation.mutateAsync(payload);
      const orderLabel = result.data?.orderNumber
        ? `Order ${result.data.orderNumber}`
        : 'Test order';
      toast.success(result.message || `${orderLabel} created successfully`);
      router.push('/diagnosis/invoice-list');
    } catch (err) {
      const message = formatBookingSubmitError(err);
      setSubmitError(message);
      toast.error(message);
    } finally {
      isSubmittingBookingRef.current = false;
    }
  };

  if (isEditMode && (orderLoading || (!orderDetail?.data && !orderError))) {
    return (
      <div className="max-w-[1600px] mx-auto flex items-center justify-center min-h-[40vh] gap-2 text-slate-500">
        <Loader2 className="animate-spin text-emerald-600" size={24} />
        <span className="font-semibold">Loading order…</span>
      </div>
    );
  }

  if (isEditMode && orderError) {
    return (
      <div className="max-w-[1600px] mx-auto p-8 text-center">
        <p className="text-rose-600 font-semibold mb-4">
          {orderLoadError?.message || 'Could not load test order.'}
        </p>
        <Link href="/diagnosis/invoice-list">
          <Button variant="outline" size="sm">
            Back to invoice list
          </Button>
        </Link>
      </div>
    );
  }

  if (!isEditMode && (!branchId || branchId < 1)) {
    return null;
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <AddInvestigationsModal
        isOpen={addInvOpen}
        onClose={() => setAddInvOpen(false)}
        onAdd={(inv) => setInvestigations(prev => [...prev, ...inv])}
        branchId={effectiveBranchId}
      />
      <AddReferringDoctorModal
        isOpen={addReferringDoctorOpen}
        onClose={() => setAddReferringDoctorOpen(false)}
        onAdd={(doctors) => {
          setReferringDoctors((prev) => {
            const next = [...prev, ...doctors];
            syncReferringDoctorForm(next);
            return next;
          });
        }}
        branchId={effectiveBranchId}
      />
      <ReferrerSelect
        hideTrigger
        drawerOpen={addReferrerOpen}
        onDrawerOpenChange={setAddReferrerOpen}
        value={form.referringHospitalId}
        onChange={(id, referrer) => {
          setSelectedReferrer(referrer);
          setForm((f) => ({
            ...f,
            referringHospitalId: id,
            referrer: referrer ? getReferrerName(referrer) : '',
          }));
        }}
      />
      <MemberCardDrawer
        isOpen={memberCardDrawerOpen}
        onClose={() => setMemberCardDrawerOpen(false)}
        value={{
          membershipCardNumber: form.membershipCardNumber,
          holderName: form.membershipCardHolderName,
          holderEmail: form.membershipCardHolderEmail,
          otp: form.membershipCardOtp,
        }}
        onChange={applyMemberCardForm}
      />

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {isEditMode ? (
            <Link
              href="/diagnosis/invoice-list"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 mb-3"
            >
              <ArrowLeft size={14} />
              Back to invoice list
            </Link>
          ) : null}
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <FlaskConical size={22} />
            </div>
            {isEditMode ? 'Edit Diagnostic Order' : 'Diagnostic Booking'}
          </h1>
          <p className="text-slate-500 text-sm font-semibold mt-1 flex items-center gap-2">
            {isEditMode ? (
              <>
                Order <span className="font-mono text-emerald-700">{loadedOrder?.orderNumber}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1 text-slate-400">
                  <Lock size={10} /> Patient identity is view-only
                </span>
              </>
            ) : (
              'Patient Intake Workflow'
            )}
            {!isEditMode && selectedBranch ? (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-emerald-600 font-bold">{selectedBranch.branchName}</span>
                {selectedBranch.branchType ? (
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {selectedBranch.branchType.replace(/_/g, ' ')}
                  </span>
                ) : null}
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <SelectBranch
            className="w-full sm:w-72"
            value={effectiveBranchId}
            onChange={handleBranchChange}
            autoSelectFirst={false}
          />
          {!isEditMode ? (
            <>
              <Button className="rounded-xl custom-gradient text-white font-bold text-xs gap-2 shadow-lg shadow-emerald-500/10 px-6">
                <Zap size={16} /> Smart Sync
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* ── Main Form Column ── */}
        <div className="xl:col-span-8 space-y-8">

          {/* Section 1: Identity & Sync */}
          <Card className="p-6 border-gray-300 overflow-visible relative shadow-sm z-10">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Activity size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Patient Identity</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {isEditMode ? 'View only' : 'Profile Sync & Access'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <PatientSearchSelect
                patientId={form.patientId}
                onPatientSelect={(patient) => void handlePatientSearchSelect(patient)}
                onClear={clearPatientRecord}
                disabled={isEditMode}
                dynamicFieldLabel
                lookupMessage={mobileLookupMessage}
                required
              />
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Digital ID (Email)</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10" size={16} />
                  <Input
                    value={form.email}
                    onChange={isEditMode ? undefined : set('email')}
                    placeholder="patient@example.com"
                    className={cn('pl-10 border-gray-300', isEditMode && 'bg-slate-50')}
                    {...readOnlyInputProps(isEditMode)}
                  />
                </div>
              </div>
            </div>
          </Card>

          {form.patientId != null && form.patientId > 0 ? (
            <PatientLastVisit patientId={form.patientId} />
          ) : null}

          {/* Section 2: Bio Information */}
          <Card className="p-0 border-gray-300 overflow-hidden relative shadow-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
            <div className="p-6 border-b border-gray-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <User size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Bio Information</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {isEditMode ? 'Demographics view only · clinical fields editable below' : 'Clinical Demographics'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Name & Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">Title</Label>
                  <Select value={form.title} onValueChange={isEditMode ? undefined : set('title')} disabled={isEditMode}>
                    <SelectTrigger className={cn('border-gray-300', isEditMode && 'bg-slate-50')}>
                      <SelectValue placeholder="Title" />
                    </SelectTrigger>
                    <SelectContent>
                      {TITLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-6 space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">Full Legal Name</Label>
                  <Input
                    value={form.patientName}
                    onChange={isEditMode ? undefined : set('patientName')}
                    placeholder="Enter patient name"
                    className={cn('border-gray-300', isEditMode && 'bg-slate-50')}
                    {...readOnlyInputProps(isEditMode)}
                  />
                </div>
                <div className="md:col-span-4 grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-400 uppercase pl-1 text-center">Age</Label>
                    <Input
                      value={form.age}
                      onChange={isEditMode ? undefined : set('age')}
                      className={cn('text-center font-black text-emerald-600', isEditMode && 'bg-slate-50')}
                      placeholder="0"
                      disabled={isEditMode}
                      readOnly={isEditMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">Gender</Label>
                    <Select value={form.gender} onValueChange={isEditMode ? undefined : set('gender')} disabled={isEditMode}>
                      <SelectTrigger className={cn('border-gray-300', isEditMode && 'bg-slate-50')}>
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Address & Context */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">Permanent Address</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10" size={16} />
                    <Input
                      value={form.address}
                      onChange={isEditMode ? undefined : set('address')}
                      className={cn('pl-10 border-gray-300', isEditMode && 'bg-slate-50')}
                      {...readOnlyInputProps(isEditMode)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">Nationality</Label>
                  <div className="relative group">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10" size={16} />
                    <Input
                      value={form.nationality}
                      onChange={isEditMode ? undefined : set('nationality')}
                      className={cn('pl-10 border-gray-300', isEditMode && 'bg-slate-50')}
                      {...readOnlyInputProps(isEditMode)}
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
                <Input
                  type="date"
                  value={form.lmpDate}
                  onChange={set('lmpDate')}
                  className="border-gray-300"
                />
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
                  <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">SRF ID</Label>
                  <Input
                    value={form.srfId}
                    onChange={set('srfId')}
                    placeholder="SRF-2026-001234"
                    className="border-gray-300"
                  />
                </div>

              </div>
            </div>
          </Card>

          {/* Section 3: Referrer  */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-slate-800 tracking-tight"> Referrer</h3>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-black text-[10px] px-2.5">
                  {selectedReferrer ? '1 SELECTED' : 'NONE'}
                </Badge>
              </div>
              <Button
                onClick={() => setAddReferrerOpen(true)}
                className="rounded-xl custom-gradient text-white text-xs font-black gap-2 px-5 group shadow-lg shadow-emerald-500/10 shrink-0"
              >
                <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add Referrer
              </Button>
            </div>

            {selectedReferrer ? (
              <Card className="overflow-hidden border-gray-300 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Referrer Name</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Details</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 border border-gray-200">
                              <Building2 size={16} />
                            </div>
                            <div className="text-sm font-bold text-slate-900">{getReferrerName(selectedReferrer)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[9px] font-black border-gray-200 max-w-xs truncate">
                            {referrerMeta(selectedReferrer)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReferrer(null);
                              setForm((f) => ({
                                ...f,
                                referringHospitalId: null,
                                referrer: '',
                              }));
                            }}
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <div
                className="bg-white rounded-3xl border-2 border-dashed border-gray-200 h-52 flex flex-col items-center justify-center text-center p-8 transition-all hover:bg-slate-50 group cursor-pointer"
                onClick={() => setAddReferrerOpen(true)}
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 mb-4 group-hover:scale-110 group-hover:bg-emerald-50 group-hover:text-emerald-400 transition-all border border-gray-100">
                  <Building2 size={32} />
                </div>
                <p className="text-slate-400 text-sm font-bold">No referrer added yet.</p>
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">
                  Start by clicking &quot;Add Referrer&quot;
                </p>
              </div>
            )}
          </div>

          {/* Section 3:  Doctor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-slate-800 tracking-tight"> Doctor</h3>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-black text-[10px] px-2.5">
                  {referringDoctors.length} ITEMS
                </Badge>
              </div>
              <Button
                onClick={() => setAddReferringDoctorOpen(true)}
                className="rounded-xl custom-gradient text-white text-xs font-black gap-2 px-5 group shadow-lg shadow-emerald-500/10 shrink-0"
              >
                <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add Doctor
              </Button>
            </div>

            {referringDoctors.length > 0 ? (
              <Card className="overflow-hidden border-gray-300 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor Name</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Details</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
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
                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[9px] font-black border-gray-200 max-w-xs truncate">
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
                onClick={() => setAddReferringDoctorOpen(true)}
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

          {/* Section 4: Order Cart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Order Cart</h3>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-black text-[10px] px-2.5">{investigations.length} ITEMS</Badge>
                {isEditMode ? (
                  <Badge variant="secondary" className="text-[9px] font-black">
                    View only
                  </Badge>
                ) : null}
              </div>
              {!isEditMode ? (
                <Button
                  onClick={() => {
                    if (!effectiveBranchId || effectiveBranchId < 1) {
                      toast.error('Select a branch before adding tests.');
                      return;
                    }
                    setAddInvOpen(true);
                  }}
                  className="rounded-xl custom-gradient text-white text-xs font-black gap-2 px-5 group shadow-lg shadow-emerald-500/10 shrink-0"
                >
                  <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add Test
                </Button>
              ) : null}
            </div>

            {investigations.length > 0 ? (
              <Card className="overflow-hidden border-gray-300 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Name</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Category</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">MRP</th>
                        {!isEditMode ? (
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                        ) : null}
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
                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[9px] font-black border-gray-200">{inv.category}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-black text-slate-900">₹{inv.mrp.toLocaleString()}</span>
                          </td>
                          {!isEditMode ? (
                            <td className="px-6 py-4 text-center">
                              <button onClick={() => removeInvestigation(inv.id)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : !isEditMode ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 h-52 flex flex-col items-center justify-center text-center p-8 transition-all hover:bg-slate-50 group cursor-pointer" onClick={() => setAddInvOpen(true)}>
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 mb-4 group-hover:scale-110 group-hover:bg-emerald-50 group-hover:text-emerald-400 transition-all border border-gray-100">
                  <FlaskConical size={32} />
                </div>
                <p className="text-slate-400 text-sm font-bold">No investigations added yet.</p>
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">Start by clicking "Add Investigation"</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Summary Column ── */}
        <div className="xl:col-span-4 space-y-8 sticky top-24">
          <Card className="p-0 border-gray-300 overflow-hidden shadow-xl">
            <div className="p-6 bg-blue-900 text-white">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 opacity-80 mb-1">
                Checkout Summary
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-[10px] font-black opacity-50 uppercase">Balance Due</span>
                <span className="text-3xl font-black text-emerald-400">₹{financials.balanceDue.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Processing Priority</Label>
                  <Select value={form.processing} onValueChange={set('processing')}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Priority">
                        {orderPriorityLabel(form.processing)}
                      </SelectValue>
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
                    <span className="font-black text-slate-900">₹{financials.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400">Discount Amount</span>
                    <span className="font-black text-amber-600">− ₹{financials.discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400">Net Amount</span>
                    <span className="font-black text-slate-900">₹{financials.netAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 flex items-center gap-2 italic"><Timer size={14} className="text-rose-500" /> Emergency Charge</span>
                    <input type="number" value={form.emergencyCharge} onChange={set('emergencyCharge')} placeholder="0" className="w-20 text-right bg-white border border-gray-300 rounded-lg px-2 py-1.5 focus:border-emerald-500 outline-none font-black text-slate-900" />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400">Contrast Charge</span>
                    <input type="number" value={form.contrast} onChange={set('contrast')} placeholder="0" className="w-20 text-right bg-white border border-gray-300 rounded-lg px-2 py-1.5 focus:border-emerald-500 outline-none font-black text-slate-900" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-black text-slate-900 uppercase">Actual Payable</span>
                    <span className="text-lg font-black text-emerald-600">₹{financials.actualPayable.toLocaleString()}</span>
                  </div>
                </div>

                {/* Adjustment */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-gray-200 space-y-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjustment / Discount</span>
                    <Badge variant="secondary" className="bg-white text-emerald-600 text-[10px] font-black border-gray-200">APPLY</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="number" value={form.discount} onChange={set('discount')} className="bg-white border-gray-300" />
                    <Select value={form.discountType} onValueChange={set('discountType')}>
                      <SelectTrigger className="border-gray-300 bg-white">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISC_TYPES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-slate-400 uppercase">Concession By</Label>
                    <Input value={form.concessionBy} onChange={set('concessionBy')} placeholder="Dr. Admin" className="bg-white border-gray-300" />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Sample Collection</Label>
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
                          const collectionDate =
                            value && value < minDate ? minDate : value;
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
                      <Input type="time" value={form.collectionTime} onChange={set('collectionTime')} className="border-gray-300" />
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
                    <CollectorSearchSelect
                      value={form.phlebotomist}
                      onChange={(name) => setForm((f) => ({ ...f, phlebotomist: name }))}
                    />
                  </div>
                </div>

                {/* Final Due & Pay */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900 uppercase text-gray-500">Final Amount Due</span>
                    <span className="text-2xl font-black text-[#050b18]">₹{financials.actualPayable.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="relative group">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10" size={16} />
                      <Input type="number" value={form.payment} onChange={set('payment')} placeholder="Payable amount..." className="pl-10 h-12 bg-white border-gray-300 font-black text-[#050b18] placeholder:text-gray-300 shadow-sm" />
                    </div>
                    <Select value={form.paymentMode} onValueChange={handlePaymentModeChange}>
                      <SelectTrigger className="border-gray-300 h-10 font-bold">
                        <SelectValue placeholder="Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAY_MODES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {PAYMENT_MODES_WITH_REFERENCE.has(form.paymentMode) ? (
                      <Input
                        value={form.paymentReference}
                        onChange={set('paymentReference')}
                        placeholder="Payment reference (e.g. PAY-001)"
                        className="border-gray-300 h-10 font-semibold"
                      />
                    ) : null}

                    {form.paymentMode === MEMBERSHIP_CARD_PAYMENT_MODE ? (
                      <MemberCardSummaryButton
                        value={{
                          membershipCardNumber: form.membershipCardNumber,
                          holderName: form.membershipCardHolderName,
                          holderEmail: form.membershipCardHolderEmail,
                          otp: form.membershipCardOtp,
                        }}
                        onOpen={() => setMemberCardDrawerOpen(true)}
                      />
                    ) : null}
                    <div className="flex justify-between items-center text-sm pt-1">
                      <span className="font-bold text-slate-500">Paid Amount</span>
                      <span className="font-black text-emerald-700">₹{financials.paidAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm / Update */}
              <div className="pt-2 space-y-3">
                {submitError ? (
                  <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 mb-3">
                    {submitError}
                  </p>
                ) : null}
                {isEditMode ? (
                  <>
                    <Button
                      type="button"
                      disabled={updateMedicalMutation.isPending}
                      onClick={handleUpdateMedical}
                      className="w-full h-12 rounded-2xl custom-gradient text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 gap-2"
                    >
                      {updateMedicalMutation.isPending ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Updating medical…
                        </>
                      ) : (
                        'Update medical information only'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={updateFinancialMutation.isPending}
                      onClick={handleUpdateFinancial}
                      className="w-full h-12 rounded-2xl border-gray-300 font-black text-xs uppercase tracking-wider"
                    >
                      {updateFinancialMutation.isPending ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Updating financial…
                        </>
                      ) : (
                        'Update financial information only'
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    disabled={createTestOrderMutation.isPending || investigations.length === 0}
                    onClick={handleConfirmBooking}
                    className="w-full h-14 rounded-2xl custom-gradient text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 gap-3 group disabled:opacity-60"
                  >
                    {createTestOrderMutation.isPending ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Creating Order…
                      </>
                    ) : (
                      <>
                        Confirm Booking
                        <ArrowRightCircle size={20} className="group-hover:translate-x-1.5 transition-transform" />
                      </>
                    )}
                  </Button>
                )}
                <div className="mt-4 flex flex-col items-center gap-1 opacity-40">
                  <div className="flex items-center gap-1.5">
                    <Info size={10} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">WellnessHive® Precision Billing</span>
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-tighter">System ID: DIAG-BOOK-PR13-2026</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BookingFallback() {
  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-6 animate-in fade-in duration-300">
      <div className="h-10 w-72 rounded-lg bg-slate-100 animate-pulse" />
      <div className="h-96 rounded-xl border border-gray-200 bg-white animate-pulse" />
    </div>
  );
}

export default function DiagnosticBookingPage() {
  return (
    <Suspense fallback={<BookingFallback />}>
      <DiagnosticBookingContent />
    </Suspense>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { Building2, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import { RightDrawer } from '@/components/ui/right-drawer';
import {
    BILLING_CYCLES,
    ORGANIZATION_TYPES,
    formatOrganizationLabel,
    type BillingCycle,
    type Organization,
    type OrganizationType,
    type UpdateOrganizationPayload,
} from '../services/organization.service';
import { useUpdateOrganization } from '../services/organization.service';

const FORM_ID = 'edit-organization-form';
const FIELD_LABEL =
    'text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1';
const INPUT_CLASS =
    'h-11 rounded-xl border-slate-200 bg-white font-bold shadow-none ring-0 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500';

export interface EditOrganizationProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    organization: Organization | null;
}

type FormState = {
    orgName: string;
    orgType: OrganizationType | '';
    shortName: string;
    orgCode: string;
    registrationNumber: string;
    addressLine1: string;
    primaryPhone: string;
    secondaryPhone: string;
    email: string;
    website: string;
    contactPersonName: string;
    contactPersonDesignation: string;
    contactPersonPhone: string;
    contactPersonEmail: string;
    paymentTermsDays: string;
    billingCycle: BillingCycle | '';
    specialNotes: string;
    termsAndConditions: string;
};

function createFormFromOrganization(org: Organization | null): FormState {
    if (!org) {
        return {
            orgName: '',
            orgType: '',
            shortName: '',
            orgCode: '',
            registrationNumber: '',
            addressLine1: '',
            primaryPhone: '',
            secondaryPhone: '',
            email: '',
            website: '',
            contactPersonName: '',
            contactPersonDesignation: '',
            contactPersonPhone: '',
            contactPersonEmail: '',
            paymentTermsDays: '',
            billingCycle: '',
            specialNotes: '',
            termsAndConditions: '',
        };
    }

    return {
        orgName: org.orgName || '',
        orgType: (org.orgType as OrganizationType) || '',
        shortName: org.shortName || '',
        orgCode: org.orgCode || '',
        registrationNumber: org.registrationNumber || '',
        addressLine1: org.addressLine1 || '',
        primaryPhone: org.primaryPhone || '',
        secondaryPhone: org.secondaryPhone || '',
        email: org.email || '',
        website: org.website || '',
        contactPersonName: org.contactPersonName || '',
        contactPersonDesignation: org.contactPersonDesignation || '',
        contactPersonPhone: org.contactPersonPhone || '',
        contactPersonEmail: org.contactPersonEmail || '',
        paymentTermsDays: org.paymentTermsDays != null ? String(org.paymentTermsDays) : '',
        billingCycle: (org.billingCycle as BillingCycle) || '',
        specialNotes: org.specialNotes || '',
        termsAndConditions: org.termsAndConditions || '',
    };
}

function FormSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
            <h3 className="text-[10px] font-black text-teal-700 uppercase tracking-widest">
                {title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
        </section>
    );
}

function Field({
    label,
    required,
    className,
    children,
}: {
    label: string;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={`space-y-1.5 ${className ?? ''}`}>
            <Label className={FIELD_LABEL}>
                {label}
                {required ? <span className="text-red-500 ml-0.5">*</span> : null}
            </Label>
            {children}
        </div>
    );
}

export default function EditOrganization({
    isOpen,
    onClose,
    onSuccess,
    organization,
}: EditOrganizationProps) {
    const updateMutation = useUpdateOrganization();
    const [form, setForm] = useState(() => createFormFromOrganization(organization));

    useEffect(() => {
        if (isOpen && organization) {
            setForm(createFormFromOrganization(organization));
        }
    }, [isOpen, organization]);

    const handleClose = () => {
        if (!updateMutation.isPending) {
            onClose();
        }
    };

    const set =
        <K extends keyof FormState>(key: K) =>
            (value: FormState[K]) => {
                setForm((prev) => ({ ...prev, [key]: value }));
            };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organization) return;

        const orgName = form.orgName.trim();
        const orgType = form.orgType.trim() as OrganizationType;

        if (!orgName) {
            toast.error('Organization name is required.');
            return;
        }
        if (!orgType) {
            toast.error('Organization type is required.');
            return;
        }

        const paymentDays = form.paymentTermsDays.trim()
            ? Number.parseInt(form.paymentTermsDays.trim(), 10)
            : undefined;

        if (form.paymentTermsDays.trim() && (!Number.isFinite(paymentDays) || paymentDays! < 0)) {
            toast.error('Payment terms must be a valid number of days.');
            return;
        }

        const payload: UpdateOrganizationPayload = {
            orgName,
            orgType,
            shortName: form.shortName.trim() || undefined,
            orgCode: form.orgCode.trim() || undefined,
            registrationNumber: form.registrationNumber.trim() || undefined,
            addressLine1: form.addressLine1.trim() || undefined,
            primaryPhone: form.primaryPhone.trim() || undefined,
            secondaryPhone: form.secondaryPhone.trim() || undefined,
            email: form.email.trim() || undefined,
            website: form.website.trim() || undefined,
            contactPersonName: form.contactPersonName.trim() || undefined,
            contactPersonDesignation: form.contactPersonDesignation.trim() || undefined,
            contactPersonPhone: form.contactPersonPhone.trim() || undefined,
            contactPersonEmail: form.contactPersonEmail.trim() || undefined,
            specialNotes: form.specialNotes.trim() || undefined,
            termsAndConditions: form.termsAndConditions.trim() || undefined,
            billingCycle: form.billingCycle || undefined,
            paymentTermsDays: paymentDays,
        };

        try {
            const res = await updateMutation.mutateAsync({
                organizationId: organization.id,
                payload,
            });
            if (res.response === false) {
                toast.error(res.message || 'Failed to update organization.');
                return;
            }
            toast.success(res.message || 'Organization updated successfully.');
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update organization.');
        }
    };

    const submitting = updateMutation.isPending;

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={handleClose}
            maxWidth="2xl"
            title={
                <div className="flex items-center gap-3">
                    <Building2 className="text-white" size={22} aria-hidden />
                    <span>
                        Edit <span className="text-emerald-200">Organization</span>
                    </span>
                </div>
            }
            description={`Update details for ${organization?.orgName || 'organization'}`}
            footer={
                <div className="flex flex-wrap gap-3 w-full justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={submitting}
                        className="border-slate-200 text-slate-600 font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form={FORM_ID}
                        disabled={submitting}
                        className="custom-gradient text-white font-bold gap-2 min-w-[200px] h-12"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" aria-hidden />
                                Updating…
                            </>
                        ) : (
                            <>
                                <Save size={18} aria-hidden />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            }
        >
            <form id={FORM_ID} onSubmit={(e) => void handleSubmit(e)} className="space-y-6 pb-4">
                <FormSection title="Organization">
                    <Field label="Organization name" required className="sm:col-span-2">
                        <Input
                            value={form.orgName}
                            onChange={(e) => set('orgName')(e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="e.g. Acme Healthcare Pvt Ltd"
                            required
                            disabled={submitting}
                        />
                    </Field>
                    <Field label="Organization type" required>
                        <Select
                            value={form.orgType}
                            onValueChange={(v) => set('orgType')((v ?? '') as OrganizationType)}
                            disabled={submitting}
                        >
                            <SelectTrigger className={`${INPUT_CLASS} font-bold`}>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {ORGANIZATION_TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {formatOrganizationLabel(t)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="Short name">
                        <Input
                            value={form.shortName}
                            onChange={(e) => set('shortName')(e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="e.g. Acme HC"
                            disabled={submitting}
                        />
                    </Field>
                    <Field label="Organization code">
                        <Input
                            value={form.orgCode}
                            onChange={(e) => set('orgCode')(e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="e.g. ACME-001"
                            disabled={submitting}
                        />
                    </Field>
                    <Field label="Registration number">
                        <Input
                            value={form.registrationNumber}
                            onChange={(e) => set('registrationNumber')(e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="e.g. REG-2026-001"
                            disabled={submitting}
                        />
                    </Field>
                </FormSection>

                <FormSection title="Address & contact">
                    <Field label="Address" className="sm:col-span-2">
                        <Input
                            value={form.addressLine1}
                            onChange={(e) => set('addressLine1')(e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="Street address"
                            disabled={submitting}
                        />
                    </Field>
                    <Field label="Primary phone">
                        <Input
                            value={form.primaryPhone}
                            onChange={(e) => set('primaryPhone')(e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="9876543210"
                            disabled={submitting}
                        />
                    </Field>
                    <Field label="Secondary phone">
                        <Input
                            value={form.secondaryPhone}
                            onChange={(e) => set('secondaryPhone')(e.target.value)}
                            className={INPUT_CLASS}
                            disabled={submitting}
                        />
                    </Field>
                    <Field label="Email">
                        <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => set('email')(e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="contact@example.com"
                            disabled={submitting}
                        />
                    </Field>
                    <Field label="Website">
                        <Input
                            type="url"
                            value={form.website}
                            onChange={(e) => set('website')(e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="https://"
                            disabled={submitting}
                        />
                    </Field>
                </FormSection>

                <FormSection title="Contact person">
                    <Field label="Name">
                        <Input
                            value={form.contactPersonName}
                            onChange={(e) => set('contactPersonName')(e.target.value)}
                            className={INPUT_CLASS}
                            disabled={submitting}
                        />
                    </Field>
                    <Field label="Designation">
                        <Input
                            value={form.contactPersonDesignation}
                            onChange={(e) => set('contactPersonDesignation')(e.target.value)}
                            className={INPUT_CLASS}
                            disabled={submitting}
                        />
                    </Field>
                    <Field label="Phone">
                        <Input
                            value={form.contactPersonPhone}
                            onChange={(e) => set('contactPersonPhone')(e.target.value)}
                            className={INPUT_CLASS}
                            disabled={submitting}
                        />
                    </Field>
                    <Field label="Email">
                        <Input
                            type="email"
                            value={form.contactPersonEmail}
                            onChange={(e) => set('contactPersonEmail')(e.target.value)}
                            className={INPUT_CLASS}
                            disabled={submitting}
                        />
                    </Field>
                </FormSection>

                <FormSection title="Billing">
                    <Field label="Payment terms (days)">
                        <Input
                            type="number"
                            min={0}
                            value={form.paymentTermsDays}
                            onChange={(e) => set('paymentTermsDays')(e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="30"
                            disabled={submitting}
                        />
                    </Field>
                    <Field label="Billing cycle">
                        <Select
                            value={form.billingCycle}
                            onValueChange={(v) => set('billingCycle')((v ?? '') as BillingCycle)}
                            disabled={submitting}
                        >
                            <SelectTrigger className={`${INPUT_CLASS} font-bold`}>
                                <SelectValue placeholder="Select cycle" />
                            </SelectTrigger>
                            <SelectContent>
                                {BILLING_CYCLES.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {formatOrganizationLabel(c)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                </FormSection>

                <FormSection title="Notes & terms">
                    <Field label="Special notes" className="sm:col-span-2">
                        <Textarea
                            value={form.specialNotes}
                            onChange={(e) => set('specialNotes')(e.target.value)}
                            className="min-h-[88px] rounded-xl border-slate-200 font-medium resize-y"
                            disabled={submitting}
                        />
                    </Field>
                    <Field label="Terms and conditions" className="sm:col-span-2">
                        <Textarea
                            value={form.termsAndConditions}
                            onChange={(e) => set('termsAndConditions')(e.target.value)}
                            className="min-h-[88px] rounded-xl border-slate-200 font-medium resize-y"
                            disabled={submitting}
                        />
                    </Field>
                </FormSection>
            </form>
        </RightDrawer>
    );
}

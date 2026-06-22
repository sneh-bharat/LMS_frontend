'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui';
import {
  createSlaRule,
  updateSlaRule,
  type CreateSlaRuleInput,
  type SlaRule,
  type SlaRulePriority,
} from '@/app/Apis/SlaManagement/SlaManagementApi';
import { departmentApi } from '@/app/Apis/lab/departmentApi';
import { fetchTestCategories, type TestCategory } from '@/app/Apis/lab/TestCategories';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';

const PRIORITIES: SlaRulePriority[] = ['ROUTINE', 'URGENT', 'STAT', 'NORMAL'];
const TEST_TYPES = [
  'BIOCHEMISTRY',
  'HEMATOLOGY',
  'MICROBIOLOGY',
  'PATHOLOGY',
  'IMMUNOLOGY',
  'SEROLOGY',
  'MOLECULAR',
  'HISTOPATHOLOGY',
];

type FormState = {
  priority: SlaRulePriority;
  testType: string;
  departmentId: string;
  categoryId: string;
  slaHours: string;
  warningThresholdHours: string;
  breachEscalationHours: string;
  description: string;
  branchId: string;
};

const EMPTY_FORM: FormState = {
  priority: 'ROUTINE',
  testType: 'BIOCHEMISTRY',
  departmentId: '',
  categoryId: '',
  slaHours: '',
  warningThresholdHours: '',
  breachEscalationHours: '',
  description: '',
  branchId: '',
};

type AddNewSlaProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: SlaRule | null;
};

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
      {children}
      {required ? <span className="text-rose-500 ml-0.5">*</span> : null}
    </label>
  );
}

const selectClass =
  'input-refined w-full py-2.5 px-3 text-sm font-semibold appearance-none bg-white';

export default function AddNewSla({ isOpen, onClose, onSuccess, editData }: AddNewSlaProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [departments, setDepartments] = useState<Array<{ id: number; name: string }>>([]);
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const isEditMode = Boolean(editData?.id);

  useEffect(() => {
    if (!isOpen) return;

    if (editData) {
      setForm({
        priority: editData.priority,
        testType: editData.testType,
        departmentId: String(editData.departmentId || ''),
        categoryId: String(editData.categoryId || ''),
        slaHours: String(editData.slaHours ?? ''),
        warningThresholdHours: String(editData.warningThresholdHours ?? ''),
        breachEscalationHours: String(editData.breachEscalationHours ?? ''),
        description: editData.description ?? '',
        branchId: String(editData.branchId || ''),
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [isOpen, editData]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [deptRes, catRes, branchRes] = await Promise.all([
          departmentApi.getActiveDepartments({ pageNo: 0, pageSize: 500 }),
          fetchTestCategories(0, 500),
          branchApi.getAllBranches({ pageNo: 0, pageSize: 500 }),
        ]);

        if (cancelled) return;

        const deptContent = deptRes?.data?.content ?? [];
        setDepartments(
          deptContent.map((d) => ({ id: d.id, name: d.departmentName }))
        );

        const categoryRows =
          (catRes as { data?: { content?: TestCategory[] }; content?: TestCategory[] })?.data
            ?.content ??
          (catRes as { content?: TestCategory[] })?.content ??
          [];
        setCategories(categoryRows);
        setBranches(branchRes?.data?.content ?? []);
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : 'Failed to load form options.'
          );
        }
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const filteredCategories = useMemo(() => {
    const deptId = Number(form.departmentId);
    if (!deptId) return categories;
    return categories.filter((c) => c.departmentId === deptId);
  }, [categories, form.departmentId]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'departmentId') next.categoryId = '';
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = (): CreateSlaRuleInput | null => {
    const nextErrors: Record<string, string> = {};

    const departmentId = Number(form.departmentId);
    const categoryId = Number(form.categoryId);
    const branchId = Number(form.branchId);
    const slaHours = Number(form.slaHours);
    const warningThresholdHours = Number(form.warningThresholdHours);
    const breachEscalationHours = Number(form.breachEscalationHours);

    if (!form.testType.trim()) nextErrors.testType = 'Test type is required.';
    if (!departmentId) nextErrors.departmentId = 'Department is required.';
    if (!categoryId) nextErrors.categoryId = 'Category is required.';
    if (!branchId) nextErrors.branchId = 'Branch is required.';
    if (!form.description.trim()) nextErrors.description = 'Description is required.';

    if (!form.slaHours.trim() || Number.isNaN(slaHours) || slaHours <= 0) {
      nextErrors.slaHours = 'Enter a valid SLA hours value.';
    }
    if (
      !form.warningThresholdHours.trim() ||
      Number.isNaN(warningThresholdHours) ||
      warningThresholdHours < 0
    ) {
      nextErrors.warningThresholdHours = 'Enter a valid warning threshold.';
    }
    if (
      !form.breachEscalationHours.trim() ||
      Number.isNaN(breachEscalationHours) ||
      breachEscalationHours <= 0
    ) {
      nextErrors.breachEscalationHours = 'Enter a valid breach escalation value.';
    }

    if (
      !Number.isNaN(warningThresholdHours) &&
      !Number.isNaN(slaHours) &&
      warningThresholdHours > slaHours
    ) {
      nextErrors.warningThresholdHours = 'Warning threshold cannot exceed SLA hours.';
    }

    if (
      !Number.isNaN(breachEscalationHours) &&
      !Number.isNaN(slaHours) &&
      breachEscalationHours < slaHours
    ) {
      nextErrors.breachEscalationHours = 'Breach escalation must be at or above SLA hours.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return null;

    return {
      priority: form.priority,
      testType: form.testType.trim(),
      departmentId,
      categoryId,
      slaHours,
      warningThresholdHours,
      breachEscalationHours,
      description: form.description.trim(),
      branchId,
    };
  };

  const handleSubmit = async () => {
    const payload = validate();
    if (!payload) return;

    setSubmitting(true);
    try {
      if (isEditMode && editData) {
        const response = await updateSlaRule(editData.id, payload);
        toast.success(response.message?.trim() || 'SLA configuration updated.');
      } else {
        const response = await createSlaRule(payload);
        toast.success(response.message?.trim() || 'SLA configuration created.');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to save SLA configuration.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit SLA Configuration' : 'Create SLA Configuration'}
      description="Define turnaround targets, warning thresholds, and breach escalation rules"
      maxWidth="lg"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="flex-1 font-bold"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="gradient"
            className="flex-1 font-bold gap-2"
            onClick={() => void handleSubmit()}
            disabled={submitting || loadingOptions}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {isEditMode ? 'Update SLA' : 'Create SLA'}
          </Button>
        </>
      }
    >
      {loadingOptions ? (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
          <Loader2 size={20} className="animate-spin text-[#006D77]" />
          <span className="text-sm font-semibold">Loading form options…</span>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Priority</FieldLabel>
              <select
                value={form.priority}
                onChange={(e) => updateField('priority', e.target.value as SlaRulePriority)}
                className={selectClass}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel required>Test Type</FieldLabel>
              <select
                value={form.testType}
                onChange={(e) => updateField('testType', e.target.value)}
                className={selectClass}
              >
                {TEST_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.testType ? (
                <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.testType}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Department</FieldLabel>
              <select
                value={form.departmentId}
                onChange={(e) => updateField('departmentId', e.target.value)}
                className={selectClass}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.departmentId ? (
                <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.departmentId}
                </p>
              ) : null}
            </div>
            <div>
              <FieldLabel required>Category</FieldLabel>
              <select
                value={form.categoryId}
                onChange={(e) => updateField('categoryId', e.target.value)}
                className={selectClass}
                disabled={!form.departmentId}
              >
                <option value="">Select category</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
              {errors.categoryId ? (
                <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.categoryId}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <FieldLabel required>Branch</FieldLabel>
            <select
              value={form.branchId}
              onChange={(e) => updateField('branchId', e.target.value)}
              className={selectClass}
            >
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branchName}
                </option>
              ))}
            </select>
            {errors.branchId ? (
              <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.branchId}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FieldLabel required>SLA Hours</FieldLabel>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 8"
                value={form.slaHours}
                onChange={(e) => updateField('slaHours', e.target.value)}
              />
              {errors.slaHours ? (
                <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.slaHours}
                </p>
              ) : null}
            </div>
            <div>
              <FieldLabel required>Warning Threshold (hrs)</FieldLabel>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 6"
                value={form.warningThresholdHours}
                onChange={(e) => updateField('warningThresholdHours', e.target.value)}
              />
              {errors.warningThresholdHours ? (
                <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.warningThresholdHours}
                </p>
              ) : null}
            </div>
            <div>
              <FieldLabel required>Breach Escalation (hrs)</FieldLabel>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 10"
                value={form.breachEscalationHours}
                onChange={(e) => updateField('breachEscalationHours', e.target.value)}
              />
              {errors.breachEscalationHours ? (
                <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.breachEscalationHours}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <FieldLabel required>Description</FieldLabel>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="e.g. Urgent biochemistry tests SLA"
              rows={4}
              className="input-refined w-full py-3 px-3 text-sm font-medium resize-y min-h-[96px]"
            />
            {errors.description ? (
              <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.description}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </RightDrawer>
  );
}

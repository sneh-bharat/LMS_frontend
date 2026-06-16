"use client";

import { useEffect, useState } from "react";
import { AlertCircle, FlaskConical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RightDrawer } from "@/components/ui/right-drawer";
import Button from "@/components/ui/button";
import { Input, Label } from "@/components/ui";
import { branchApi, type Branch } from "@/app/Apis/branch/branchApi";
import { useCreatePathologist } from "@/app/Apis/pathologist/usePathologists";

export interface AddPathologistModalProps {
  isOpen: boolean;
  onSuccess?: () => void;
  onClose: () => void;
}

const initialForm = {
  branchId: 0,
  fullName: "",
  email: "",
  phone: "",
  username: "",
  password: "",
  specialization: "",
  licenseNumber: "",
  isVerified: true,
  isActive: true,
};

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const o = err as Record<string, unknown>;
    if (typeof o.message === "string") return o.message;
    const res = o.response as
      | { data?: { message?: string; error?: string } }
      | undefined;
    const server = res?.data?.message ?? res?.data?.error;
    if (typeof server === "string") return server;
  }
  return "Failed to create pathologist.";
}

export default function AddPathologistModal({
  isOpen,
  onSuccess,
  onClose,
}: AddPathologistModalProps) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const createMutation = useCreatePathologist();

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    (async () => {
      setLoadingBranches(true);
      try {
        const res = await branchApi.getAllBranches({
          pageNo: 0,
          pageSize: 200,
        });
        const list = res?.data?.content ?? [];
        if (cancelled) return;
        setBranches(list);
        setForm((prev) => {
          if (prev.branchId !== 0) return prev;
          const first = list[0]?.id;
          return first ? { ...prev, branchId: first } : prev;
        });
      } catch {
        if (!cancelled) {
          setBranches([]);
          toast.error("Failed to load branches.");
        }
      } finally {
        if (!cancelled) setLoadingBranches(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const el = e.target;
    const name = el.name;

    if (el instanceof HTMLInputElement && el.type === "checkbox") {
      const f = name as "isVerified" | "isActive";
      setForm((prev) => ({ ...prev, [f]: el.checked }));
    } else if (name === "branchId") {
      setForm((prev) => ({ ...prev, branchId: Number(el.value) || 0 }));
    } else {
      setForm((prev) => ({ ...prev, [name]: el.value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.branchId || form.branchId < 1)
      next.branchId = "Branch is required.";
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.username.trim()) next.username = "Username is required.";
    if (!form.password.trim()) next.password = "Password is required.";
    else if (form.password.length < 6)
      next.password = "Password must be at least 6 characters.";
    if (!form.phone.trim()) next.phone = "Phone is required.";
    if (!form.specialization.trim())
      next.specialization = "Specialization is required.";
    if (!form.licenseNumber.trim())
      next.licenseNumber = "License number is required.";
    const email = form.email.trim();
    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createMutation.mutate(
      {
        branchId: form.branchId,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        username: form.username.trim(),
        password: form.password,
        specialization: form.specialization.trim(),
        licenseNumber: form.licenseNumber.trim(),
        isVerified: form.isVerified,
        isActive: form.isActive,
      },
      {
        onSuccess: (res) => {
          toast.success(
            res?.message?.trim() || "Pathologist created successfully.",
          );
          onSuccess?.();
          onClose();
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      },
    );
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
        type="submit"
        form="pathologist-form"
        variant="gradient"
        className="flex-1 font-bold"
        disabled={pending}
      >
        {pending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} aria-hidden />
            Saving…
          </span>
        ) : (
          "Save pathologist"
        )}
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <FlaskConical className="text-white" size={22} />
          <span>
            Add <span className="text-violet-200">pathologist</span>
          </span>
        </div>
      }
      description="Register a new pathologist account"
      footer={footer}
      maxWidth="md"
    >
      <form id="pathologist-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Full name */}
        <div className="space-y-2">
          <Label
            htmlFor="fullName"
            className="text-xs font-bold text-slate-700 uppercase tracking-widest"
          >
            Full name *
          </Label>
          <Input
            id="fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Dr. Full Name"
            className={`border-slate-200 ${errors.fullName ? "border-rose-300" : ""}`}
            disabled={pending}
          />
          {errors.fullName && (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle size={12} aria-hidden /> {errors.fullName}
            </p>
          )}
        </div>

        {/* Branch */}
        <div className="space-y-2">
          <Label
            htmlFor="branchId"
            className="text-xs font-bold text-slate-700 uppercase tracking-widest"
          >
            Branch *
          </Label>
          {loadingBranches ? (
            <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
              <Loader2
                className="animate-spin text-violet-600"
                size={16}
                aria-hidden
              />
              Loading branches…
            </div>
          ) : (
            <select
              id="branchId"
              name="branchId"
              value={form.branchId || ""}
              onChange={handleChange}
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.branchId ? "border-rose-300" : "border-input"
              }`}
              disabled={pending || branches.length === 0}
            >
              <option value="" disabled>
                Select branch
              </option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branchName}
                </option>
              ))}
            </select>
          )}
          {errors.branchId && (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle size={12} aria-hidden /> {errors.branchId}
            </p>
          )}
          {!loadingBranches && branches.length === 0 && (
            <p className="text-xs text-amber-700 flex items-center gap-1">
              <AlertCircle size={12} aria-hidden /> No branches found. Create a
              branch first.
            </p>
          )}
        </div>

        {/* Username + Password */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest"
            >
              Username *
            </Label>
            <Input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              autoComplete="username"
              className={`border-slate-200 ${errors.username ? "border-rose-300" : ""}`}
              disabled={pending}
            />
            {errors.username && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.username}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest"
            >
              Password *
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              className={`border-slate-200 ${errors.password ? "border-rose-300" : ""}`}
              disabled={pending}
            />
            {errors.password && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.password}
              </p>
            )}
          </div>
        </div>

        {/* Phone + Email */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest"
            >
              Phone *
            </Label>
            <Input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91-XX-XXXX-XXXX"
              className={`border-slate-200 ${errors.phone ? "border-rose-300" : ""}`}
              disabled={pending}
            />
            {errors.phone && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.phone}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest"
            >
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              autoComplete="email"
              className={`border-slate-200 ${errors.email ? "border-rose-300" : ""}`}
              disabled={pending}
            />
            {errors.email && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Specialization + License number */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="specialization"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest"
            >
              Specialization *
            </Label>
            <Input
              id="specialization"
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              placeholder="e.g. Histopathology"
              className={`border-slate-200 ${errors.specialization ? "border-rose-300" : ""}`}
              disabled={pending}
            />
            {errors.specialization && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.specialization}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="licenseNumber"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest"
            >
              License number *
            </Label>
            <Input
              id="licenseNumber"
              name="licenseNumber"
              value={form.licenseNumber}
              onChange={handleChange}
              placeholder="e.g. MED-2024-12345"
              className={`border-slate-200 ${errors.licenseNumber ? "border-rose-300" : ""}`}
              disabled={pending}
            />
            {errors.licenseNumber && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.licenseNumber}
              </p>
            )}
          </div>
        </div>

        {/* Verified + Active toggles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
            <input
              id="isVerified"
              name="isVerified"
              type="checkbox"
              checked={form.isVerified === true}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              disabled={pending}
            />
            <Label
              htmlFor="isVerified"
              className="text-sm font-semibold text-slate-800 cursor-pointer mb-0"
            >
              Verified account
            </Label>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={form.isActive === true}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              disabled={pending}
            />
            <Label
              htmlFor="isActive"
              className="text-sm font-semibold text-slate-800 cursor-pointer mb-0"
            >
              Active account
            </Label>
          </div>
        </div>
      </form>
    </RightDrawer>
  );
}

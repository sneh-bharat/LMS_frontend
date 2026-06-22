"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RightDrawer } from "@/components/ui/right-drawer";
import Button from "@/components/ui/button";
import { Input, Label } from "@/components/ui";
import { branchApi, type Branch } from "@/app/Apis/branch/branchApi";
import {
  useUpdateBranchManager,
  useBranchManager,
} from "../services/branch-manager.service";

export interface EditBranchManagerModalProps {
  isOpen: boolean;
  managerId: number | null;
  onSuccess?: () => void;
  onClose: () => void;
}

const emptyForm = {
  branchId: 0,
  fullName: "",
  email: "",
  phone: "",
  username: "",
  isVerified: true,
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
  return "Failed to update branch manager.";
}

export default function EditBranchManagerModal({
  isOpen,
  managerId,
  onSuccess,
  onClose,
}: EditBranchManagerModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const { data: managerResponse, isLoading: isManagerLoading } =
    useBranchManager(managerId, {
      enabled: isOpen && managerId !== null,
    });

  const updateMutation = useUpdateBranchManager();

  // Populate form when manager data arrives
  useEffect(() => {
    const m = managerResponse?.data;
    if (m) {
      setForm({
        branchId: m.branchId ?? 0,
        fullName: m.fullName?.trim() ?? "",
        email: m.email?.trim() ?? "",
        phone: m.phone?.trim() ?? "",
        username: m.username?.trim() ?? "",
        isVerified: m.isVerified ?? false,
      });
    }
  }, [managerResponse]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setForm(emptyForm);
      setErrors({});
    }
  }, [isOpen]);

  // Load branches
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
        if (!cancelled) setBranches(list);
      } catch {
        if (!cancelled) toast.error("Failed to load branches.");
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
      setForm((prev) => ({ ...prev, [name as "isVerified"]: el.checked }));
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
    if (!form.phone.trim()) next.phone = "Phone is required.";
    const email = form.email.trim();
    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerId || !validate()) return;

    updateMutation.mutate(
      {
        id: managerId,
        payload: {
          branchId: form.branchId,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          username: form.username.trim(),
          isVerified: form.isVerified,
        },
      },
      {
        onSuccess: (res) => {
          toast.success(
            res?.message?.trim() || "Branch manager updated successfully.",
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

  const pending = updateMutation.isPending;
  const loading = isManagerLoading || loadingBranches;

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
        form="edit-branch-manager-form"
        variant="gradient"
        className="flex-1 font-bold"
        disabled={pending || loading}
      >
        {pending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} aria-hidden />
            Saving…
          </span>
        ) : (
          "Update manager"
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
          <Building2 className="text-white" size={22} />
          <span>
            Edit <span className="text-orange-200">branch manager</span>
          </span>
        </div>
      }
      description="Update branch manager account details"
      footer={footer}
      maxWidth="md"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <Loader2 className="animate-spin text-slate-400" size={28} />
          <p className="text-sm text-slate-500 font-medium">
            Loading manager details…
          </p>
        </div>
      ) : (
        <form
          id="edit-branch-manager-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Full name */}
          <div className="space-y-2">
            <Label
              htmlFor="edit-fullName"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest"
            >
              Full name *
            </Label>
            <Input
              id="edit-fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className={`border-slate-200 ${errors.fullName ? "border-rose-300" : ""}`}
              disabled={pending}
            />
            {errors.fullName && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.fullName}
              </p>
            )}
          </div>

          {/* Branch */}
          <div className="space-y-2">
            <Label
              htmlFor="edit-branchId"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest"
            >
              Branch *
            </Label>
            <select
              id="edit-branchId"
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
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branchName}
                </option>
              ))}
            </select>
            {errors.branchId && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.branchId}
              </p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label
              htmlFor="edit-username"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest"
            >
              Username *
            </Label>
            <Input
              id="edit-username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              className={`border-slate-200 ${errors.username ? "border-rose-300" : ""}`}
              disabled={pending}
            />
            {errors.username && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.username}
              </p>
            )}
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="edit-phone"
                className="text-xs font-bold text-slate-700 uppercase tracking-widest"
              >
                Phone *
              </Label>
              <Input
                id="edit-phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91-XX-XXXX-XXXX"
                className={`border-slate-200 ${errors.phone ? "border-rose-300" : ""}`}
                disabled={pending}
              />
              {errors.phone && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.phone}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="edit-email"
                className="text-xs font-bold text-slate-700 uppercase tracking-widest"
              >
                Email *
              </Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className={`border-slate-200 ${errors.email ? "border-rose-300" : ""}`}
                disabled={pending}
              />
              {errors.email && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Verified toggle */}
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
            <input
              id="edit-isVerified"
              name="isVerified"
              type="checkbox"
              checked={form.isVerified === true}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
              disabled={pending}
            />
            <Label
              htmlFor="edit-isVerified"
              className="text-sm font-semibold text-slate-800 cursor-pointer mb-0"
            >
              Verified account
            </Label>
          </div>
        </form>
      )}
    </RightDrawer>
  );
}

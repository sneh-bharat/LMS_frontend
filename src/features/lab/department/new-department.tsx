'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import {
  departmentApi,
  type Department,
  type CreateDepartmentInput,
} from '@/features/lab/services/lab.service';
import { departmentKeys } from '@/features/lab/services/lab.service';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';

interface AddDepartmentProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editData?: Department | null;
}

export default function AddDepartment({
  isOpen,
  onClose,
  onSubmit,
  editData,
}: AddDepartmentProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateDepartmentInput>({
    departmentCode: '',
    departmentName: '',
    departmentNameShort: '',
    description: '',
    displayOrder: 1,
    isActive: true,
    branchId: 1,
    location: '',
    tenantId: 2,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Load branches when drawer opens: GET /tenants/{tenantId}/branches/all
  useEffect(() => {
    if (!isOpen) return;
    loadBranches();
  }, [isOpen]);

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        departmentCode: editData.departmentCode,
        departmentName: editData.departmentName,
        departmentNameShort: editData.departmentNameShort || '',
        description: editData.description,
        isActive: editData.isActive,
        // branchId: editData.branchId,
        branchId: Number(editData.branchId), 
        location: editData.location || '',
        tenantId: editData.tenantId,
      });
      setErrors({});
    } else if (!isOpen) {
      setFormData({
        departmentCode: '',
        departmentName: '',
        departmentNameShort: '',
        description: '',
        isActive: true,
        branchId: 1,
        location: '',
        tenantId: 2,
      });
      setErrors({});
    }
  }, [editData, isOpen]);

  const branchOptions = useMemo(() => {
    const options = [...branches];

    if (
      editData?.branchId &&
      !options.some((branch) => branch.id === editData.branchId)
    ) {
      options.unshift({
        id: editData.branchId,
        branchCode: '',
        branchName: editData.branchName || `Branch ${editData.branchId}`,
        branchType: '',
        address: null,
        city: null,
        state: null,
        country: null,
        postalCode: null,
        contactEmail: null,
        contactPhone: null,
        isActive: true,
        tenantId: editData.tenantId,
      });
    }

    return options;
  }, [branches, editData]);

  const loadBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await branchApi.listBranchesAll({
        page: 0,
        size: 100,
      });
      setBranches(response.data.content ?? []);
    } catch (error) {
      console.error('Failed to load branches:', error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.departmentCode.trim()) {
      newErrors.departmentCode = 'Department code is required';
    }

    if (!formData.departmentName.trim()) {
      newErrors.departmentName = 'Department name is required';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number' || name === 'branchId'
          ? Number(value) || 0
          : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    const payload: CreateDepartmentInput = {
      departmentCode: formData.departmentCode.trim(),
      departmentName: formData.departmentName.trim(),
      departmentNameShort: formData.departmentNameShort?.trim() || '',
      description: formData.description || '',
      displayOrder: formData.displayOrder ?? 1,
      isActive: formData.isActive,
      branchId: Number(formData.branchId),
      location: formData.location || '',
    
    };

    setLoading(true);
    try {
      if (editData) {
        const response = await departmentApi.updateDepartment(editData.id, payload);
        
        // Validate API response - check both response flag and status
        if (!response.response && response.status !== 'success') {
          toast.error(response.message || 'Failed to update department');
          setLoading(false);
          return;
        }
        
        toast.success(response.message || 'Department updated successfully!');
      } else {
        const response = await departmentApi.createDepartment(payload);
        
    
        if (!response.response && response.status !== 'success') {
          toast.error(response.message || 'Failed to create department');
          setLoading(false);
          return;
        }
        
        toast.success(response.message || 'Department created successfully!');
      }

      await queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: departmentKeys.active() });
      if (editData?.id) {
        await queryClient.invalidateQueries({ queryKey: departmentKeys.detail(editData.id) });
      }
      onSubmit();
      onClose();
    } catch (error: any) {
      console.error('Failed to save department:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message ||
                          'Failed to save department. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="flex-1"
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="department-form"
        variant="gradient"
        className="flex-1"
        disabled={loading}
      >
        {loading ? 'Saving...' : editData ? 'Update Department' : 'Create Department'}
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          {editData ? 'Edit' : 'Create'}{' '}
          <span className="text-emerald-200">Department</span>
        </>
      }
      description={editData ? 'Update department details' : 'Add a new test department'}
      footer={footer}
      maxWidth="md"
    >
      <div className="space-y-6">
        <form id="department-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Department Code *
              </label>
              <input
                type="text"
                name="departmentCode"
                value={formData.departmentCode}
                onChange={handleChange}
                placeholder="Enter Department Code"
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                  errors.departmentCode
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
              {errors.departmentCode && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.departmentCode}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Department Name *
              </label>
              <input
                type="text"
                name="departmentName"
                value={formData.departmentName}
                onChange={handleChange}
                placeholder="Enter Department Name"
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                  errors.departmentName
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
              {errors.departmentName && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.departmentName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
              Short Name
            </label>
            <input
              type="text"
              name="departmentNameShort"
              value={formData.departmentNameShort || ''}
              onChange={handleChange}
              placeholder="Enter Short Name"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Enter Description"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Branch *
              </label>
              {loadingBranches ? (
                <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2">
                  <Loader size={16} className="animate-spin text-slate-400" />
                  <span className="text-sm text-slate-400">
                    {editData?.branchName
                      ? `Loading branches (${editData.branchName})...`
                      : 'Loading branches...'}
                  </span>
                </div>
              ) : (
                <select
                  name="branchId"
                  value={formData.branchId || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none bg-white cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Select a branch
                  </option>
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              )}
              {branchOptions.length === 0 && !loadingBranches && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> No branches available.
                </p>
              )}
            </div>

            {/* <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder || 1}
                onChange={handleChange}
                placeholder="1"
                min="0"
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                  errors.displayOrder
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
              {errors.displayOrder && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.displayOrder}
                </p>
              )}
            </div> */}
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                placeholder="e.g., Building A, Floor 2"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div> */}

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }))
              }
              className="w-5 h-5 accent-emerald-600 rounded border-slate-300 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">
              Active Department
            </label>
          </div>
        </form>
      </div>
    </RightDrawer>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  departmentApi,
  type Department,
  type CreateDepartmentInput,
} from '@/app/Apis/lab/departmentApi';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';

interface AddDepartmentProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDepartmentInput) => void;
  editData?: Department | null;
}

export default function AddDepartment({
  isOpen,
  onClose,
  onSubmit,
  editData,
}: AddDepartmentProps) {
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
  const [selectedBranchId, setSelectedBranchId] = useState<string>('1');

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (editData && isOpen) {
      console.log('Edit mode - Department data:', editData);
      console.log('Edit mode - Branch ID:', editData.branchId);
      setFormData({
        departmentCode: editData.departmentCode,
        departmentName: editData.departmentName,
        departmentNameShort: editData.departmentNameShort || '',
        description: editData.description,
        displayOrder: editData.displayOrder || 1,
        isActive: editData.isActive,
        branchId: editData.branchId,
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
        displayOrder: 1,
        isActive: true,
        branchId: 1,
        location: '',
        tenantId: 2,
      });
      setSelectedBranchId('1');
      setErrors({});
    }
  }, [editData, isOpen]);

  // Set selected branch ID after branches are loaded
  useEffect(() => {
    if (editData && isOpen && branches.length > 0 && editData.branchId) {
      const branchIdStr = editData.branchId.toString();
      setSelectedBranchId(branchIdStr);
      console.log('Set selected branch ID to:', branchIdStr);
      const foundBranch = branches.find(b => b.id === editData.branchId);
      console.log('Found branch:', foundBranch);
    }
  }, [branches, editData, isOpen]);

  const loadBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await branchApi.getAllBranches({
        pageNo: 0,
        pageSize: 100,
      });
      console.log('Loaded branches:', response.data.content);
      setBranches(response.data.content);
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

    if (formData.displayOrder !== undefined && formData.displayOrder < 0) {
      newErrors.displayOrder = 'Display order must be non-negative';
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
      [name]: type === 'number' ? parseInt(value) || 0 : value,
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

    setLoading(true);
    try {
      if (editData) {
        console.log('Updating department with data:', formData);
       
        await departmentApi.updateDepartment(editData.id, formData);
        toast.success('Department updated successfully!');
      } else {
        console.log('Creating department with data:', formData);
        await departmentApi.createDepartment(formData);
        toast.success('Department created successfully!');
      }
      onSubmit(formData);
      onClose();
    } catch (error: any) {
      console.error('Failed to save department:', error);
      const errorMessage = error?.response?.data?.message || 
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
                placeholder="e.g., HEM"
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
                placeholder="e.g., Hematology"
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
              placeholder="e.g., HEM"
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
              placeholder="e.g., Blood-related tests and analysis"
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
                  <span className="text-sm text-slate-400">Loading branches...</span>
                </div>
              ) : (
                <Select
                  value={selectedBranchId}
                  onValueChange={(value) => {
                    if (value) {
                      const branchId = parseInt(value);
                      console.log('Selected branch ID:', branchId);
                      setSelectedBranchId(value);
                      setFormData((prev) => ({
                        ...prev,
                        branchId: branchId,
                      }));
                    }
                  }}
                >
                  <SelectTrigger id={`branchId-${selectedBranchId}`} className="w-full">
                    <SelectValue placeholder="Select a branch">
                      {(() => {
                        const selectedBranch = branches.find(b => b.id.toString() === selectedBranchId);
                        if (selectedBranch) {
                          return selectedBranch.branchName;
                        }
                        return 'Select a branch';
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {branches.length > 0 ? (
                      branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {branch.branchName}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-slate-400">No branches available</div>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
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
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

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
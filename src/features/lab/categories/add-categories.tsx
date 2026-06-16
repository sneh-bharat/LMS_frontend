'use client';

import { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { createTestCategory, updateTestCategory, type TestCategory, type CreateCategoryInput } from '@/features/lab/services/lab.service';
import { departmentApi, type Department } from '@/features/lab/services/lab.service';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';

interface AddCategoryProps { 
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryInput) => void;
  editData?: TestCategory | null;
}

export default function AddCategory({
  isOpen,
  onClose,
  onSubmit,
  editData,
}: AddCategoryProps) {
  const [formData, setFormData] = useState({
    categoryCode: '',
    categoryName: '',
    description: '',
    departmentId: 1,
    branchId: 1,
    displayOrder: 1,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        categoryCode: editData.categoryCode,
        categoryName: editData.categoryName,
        description: editData.description,
        departmentId: editData.departmentId,
        branchId: (editData as any).branchId || 1,
        displayOrder: editData.displayOrder,
        isActive: editData.isActive,
      });
      setErrors({});
    } else if (!isOpen) {
      setFormData({
        categoryCode: '',
        categoryName: '',
        description: '',
        departmentId: 1,
        branchId: 1,
        displayOrder: 1,
        isActive: true,
      });
      setErrors({});
    }
  }, [editData, isOpen]);

  // Fetch departments and branches when drawer opens
  useEffect(() => {
    if (isOpen) {
      if (departments.length === 0) {
        fetchDepartments();
      }
      if (branches.length === 0) {
        fetchBranches();
      }
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await departmentApi.getAllDepartments({ pageNo: 0, pageSize: 100 });
      if (response?.data?.content) {
        setDepartments(response.data.content);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await branchApi.getAllBranches({ pageNo: 0, pageSize: 100 });
      if (response?.data?.content) {
        setBranches(response.data.content);
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.categoryCode.trim()) {
      newErrors.categoryCode = 'Category code is required';
    }

    if (!formData.categoryName.trim()) {
      newErrors.categoryName = 'Category name is required';
    }

    if (formData.displayOrder < 0) {
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
      [name]: type === 'number' || name === 'departmentId' ? (parseInt(value) || 0) : value,
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
      return;
    }

    setLoading(true);
    try {
      if (editData) {
        await updateTestCategory(editData.id, formData);
      } else {
        await createTestCategory(formData);
      }
      onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save category:', error);
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
        form="category-form"
        variant="gradient"
        className="flex-1"
        disabled={loading}
      >
        {loading ? 'Saving...' : editData ? 'Update Category' : 'Create Category'}
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
          <span className="text-emerald-200">Category</span>
        </>
      }
      description={editData ? 'Update category details' : 'Add a new test category'}
      footer={footer}
      maxWidth="md"
    >
      <div className="space-y-6">
        <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Category Code *
              </label>
              <input
                type="text"
                name="categoryCode"
                value={formData.categoryCode}
                onChange={handleChange}
                placeholder="e.g., HEM001"
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                  errors.categoryCode
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
              {errors.categoryCode && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.categoryCode}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Category Name *
              </label>
              <input
                type="text"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                placeholder="Enter Category Name"
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                  errors.categoryName
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
              {errors.categoryName && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.categoryName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
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
                <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                  <span className="ml-2 text-xs text-slate-500">Loading branches...</span>
                </div>
              ) : (
                <select
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none bg-white cursor-pointer"
                  required
                >
                  <option value="" disabled>Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              )}
              {branches.length === 0 && !loadingBranches && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> No branches available. Please create a branch first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Department *
              </label>
              {loadingDepartments ? (
                <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                  <span className="ml-2 text-xs text-slate-500">Loading departments...</span>
                </div>
              ) : (
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none bg-white cursor-pointer"
                  required
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              )}
              {departments.length === 0 && !loadingDepartments && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> No departments available. Please create a department first.
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 self-end">
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
                Active Category
              </label>
            </div>

          {/* <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="isActiveHidden"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }))
              }
              className="w-5 h-5 accent-emerald-600 rounded border-slate-300 cursor-pointer hidden"
              tabIndex={-1}
            />
          </div> */}
        </form>
      </div>
    </RightDrawer>
  );
}
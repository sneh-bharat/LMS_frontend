'use client';

import { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { createTestCategory, updateTestCategory, type TestCategory, type CreateCategoryInput } from '@/app/Apis/lab/TestCategories';

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
    displayOrder: 1,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        categoryCode: editData.categoryCode,
        categoryName: editData.categoryName,
        description: editData.description,
        departmentId: editData.departmentId,
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
        displayOrder: 1,
        isActive: true,
      });
      setErrors({});
    }
  }, [editData, isOpen]);

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
                placeholder="e.g., Hematology"
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
              placeholder="e.g., Blood-related tests"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Department ID
              </label>
              <input
                type="number"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                placeholder="1"
                min="1"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
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
              Active Category
            </label>
          </div>
        </form>
      </div>
    </RightDrawer>
  );
}
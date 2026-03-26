'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { UrineSensitivityItem } from './page';

interface AddNewUrineSensitivityProps {
  isOpen?: boolean;
  onClose: () => void;
  onSave: (item: Omit<UrineSensitivityItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editData?: UrineSensitivityItem;
  isEditMode?: boolean;
}

export default function AddNewUrineSensitivity({
  isOpen = false,
  onClose,
  onSave,
  editData,
  isEditMode = false,
}: AddNewUrineSensitivityProps) {
  const [formData, setFormData] = useState({
    name: editData?.name || '',
    resistantMin: editData?.resistantMin || 0,
    resistantMax: editData?.resistantMax || 0,
    intermediateMin: editData?.intermediateMin || 0,
    intermediateMax: editData?.intermediateMax || 0,
    susceptibleMin: editData?.susceptibleMin || 0,
    susceptibleMax: editData?.susceptibleMax || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Antibiotic name is required';
    }

    if (formData.resistantMax <= 0) {
      newErrors.resistantMax = 'Resistant max range is required';
    }

    if (formData.susceptibleMax <= 0) {
      newErrors.susceptibleMax = 'Susceptible max range is required';
    }

    // Validate ranges logic
    if (formData.resistantMin >= formData.resistantMax && formData.resistantMax > 0) {
      newErrors.resistantMin = 'Min must be less than Max';
    }

    if (formData.intermediateMin >= formData.intermediateMax && formData.intermediateMax > 0) {
      newErrors.intermediateMin = 'Min must be less than Max';
    }

    if (formData.susceptibleMin >= formData.susceptibleMax && formData.susceptibleMax > 0) {
      newErrors.susceptibleMin = 'Min must be less than Max';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value : Number(value),
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        name: formData.name,
        resistantMin: formData.resistantMin,
        resistantMax: formData.resistantMax,
        intermediateMin: formData.intermediateMin,
        intermediateMax: formData.intermediateMax,
        susceptibleMin: formData.susceptibleMin,
        susceptibleMax: formData.susceptibleMax,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      resistantMin: 0,
      resistantMax: 0,
      intermediateMin: 0,
      intermediateMax: 0,
      susceptibleMin: 0,
      susceptibleMax: 0,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <>
          {isEditMode ? 'Edit Antibiotic' : 'Add New Antibiotic'}{' '}
          <span className="text-emerald-200">Urine Sensitivity</span>
        </>
      }
      description={isEditMode ? 'Update antibiotic sensitivity ranges' : 'Add a new antibiotic for urine sensitivity testing'}
      footer={
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="gradient"
            onClick={handleSubmit}
            className="flex-1"
          >
            {isEditMode ? 'Update' : 'Save'} Antibiotic
          </Button>
        </div>
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Antibiotic Name */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Antibiotic Name <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Amikacin"
            className={`w-full px-4 py-2.5 rounded-lg border font-bold text-sm transition-colors ${
              errors.name
                ? 'border-rose-500 bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500'
                : 'border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500'
            }`}
          />
          {errors.name && (
            <p className="text-rose-600 text-xs font-bold mt-1">{errors.name}</p>
          )}
        </div>

        {/* Range Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Resistant Min <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.resistantMin}
                onChange={(e) => handleInputChange('resistantMin', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.resistantMin && (
                <p className="text-rose-600 text-xs font-bold mt-1">{errors.resistantMin}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Resistant Max <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.resistantMax}
                onChange={(e) => handleInputChange('resistantMax', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-2.5 rounded-lg border font-bold text-sm transition-colors ${
                  errors.resistantMax
                    ? 'border-rose-500 bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500'
                }`}
              />
              {errors.resistantMax && (
                <p className="text-rose-600 text-xs font-bold mt-1">{errors.resistantMax}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Intermediate Min
              </label>
              <input
                type="number"
                min="0"
                value={formData.intermediateMin}
                onChange={(e) => handleInputChange('intermediateMin', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.intermediateMin && (
                <p className="text-rose-600 text-xs font-bold mt-1">{errors.intermediateMin}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Intermediate Max
              </label>
              <input
                type="number"
                min="0"
                value={formData.intermediateMax}
                onChange={(e) => handleInputChange('intermediateMax', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.intermediateMax && (
                <p className="text-rose-600 text-xs font-bold mt-1">{errors.intermediateMax}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Susceptible Min <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.susceptibleMin}
                onChange={(e) => handleInputChange('susceptibleMin', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.susceptibleMin && (
                <p className="text-rose-600 text-xs font-bold mt-1">{errors.susceptibleMin}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Susceptible Max <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.susceptibleMax}
                onChange={(e) => handleInputChange('susceptibleMax', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-2.5 rounded-lg border font-bold text-sm transition-colors ${
                  errors.susceptibleMax
                    ? 'border-rose-500 bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500'
                }`}
              />
              {errors.susceptibleMax && (
                <p className="text-rose-600 text-xs font-bold mt-1">{errors.susceptibleMax}</p>
              )}
            </div>
          </div>
        </div>
      </form>
    </RightDrawer>
  );
}
'use client';

import { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Database,
  Activity,
  ChevronDown,
  AlertCircle,
  FlaskConical,
  Edit2,
  Search,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer'; 
import {
  Input,
  Button,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui';

interface TestItem {
  id: string;
  testCode: string;
  testName: string;
  description?: string;
  category: string;
  sample: string;
  price: number | string;
  isActive: boolean;
  createdAt?: string;
}

interface NewTestProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TestItem) => void;
  editData?: TestItem | null;
  isEditMode?: boolean;
}

const CATEGORIES = ['Hematology', 'Pathology', 'Biochemistry', 'Serology', 'Microbiology', 'Immunology', 'Endocrinology'];
const SAMPLE_TYPES = ['Blood', 'Urine', 'Serum', 'Plasma', 'CSF', 'Stool', 'Saliva', 'Nasal Swab', 'Throat Swab'];

export default function NewTest({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
  isEditMode = false
}: NewTestProps) {
  const [formData, setFormData] = useState<TestItem>({
    id: editData?.id || '',
    testCode: editData?.testCode || '',
    testName: editData?.testName || '',
    description: editData?.description || '',
    category: editData?.category || '',
    sample: editData?.sample || '',
    price: editData?.price ?? '',
    isActive: editData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [parameters, setParameters] = useState([
    { name: '', unit: '', min: '', max: '' }
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'price' ? (value === '' ? '' : Number(value)) : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  const handleParameterChange = (
    index: number,
    field: string,
    value: string
  ) => {
  const updated = [...parameters];
  updated[index][field as keyof typeof updated[0]] = value;
  setParameters(updated);
};

const addParameter = () => {
  setParameters([
    ...parameters,
    { name: '', unit: '', min: '', max: '' }
  ]);
};

const removeParameter = (index: number) => {
  const updated = [...parameters];
  updated.splice(index, 1);
  setParameters(updated);
};

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.testCode.trim()) newErrors.testCode = 'Test Code is required';
    if (!formData.testName.trim()) newErrors.testName = 'Test Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.sample) newErrors.sample = 'Sample Type is required';
    if (formData.price === '' || Number(formData.price) <= 0) newErrors.price = 'Valid price is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData as TestItem);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      id: '',
      testCode: '',
      testName: '',
      description: '',
      category: '',
      sample: '',
      price: '',
      isActive: true,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const footer = (
    <div className="flex gap-3 justify-end w-full">
      <Button
        variant="outline"
        onClick={handleClose}
        className="px-6 py-2 rounded-lg font-bold transition-all text-sm border-slate-300 text-slate-700"
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-600 hover:to-teal-600 transition-all text-sm shadow-md"
      >
        {isEditMode ? 'Update' : 'Create'} Test
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <>
          {isEditMode ? 'Edit' : 'Create'}{' '}
          <span className="text-emerald-200">Test</span>
        </>
      }
      description={isEditMode ? 'Update diagnostic test details' : 'Add a new diagnostic test'}
      footer={footer}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Test Code and Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
              Test Code *
            </Label>
            <Input
              type="text"
              name="testCode"
              placeholder="T001"
              value={formData.testCode}
              onChange={handleInputChange}
              disabled={isEditMode}
              className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 disabled:bg-slate-100 disabled:text-slate-500 font-mono ${errors.testCode
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
            />
            {errors.testCode && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.testCode}
              </p>
            )}
          </div>

          <div>
            <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
              Test Name *
            </Label>
            <Input
              type="text"
              name="testName"
              placeholder="Complete Blood Count"
              value={formData.testName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${errors.testName
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
            />
            {errors.testName && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.testName}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
            Description
          </Label>
          <textarea
            name="description"
            placeholder="Enter test description..."
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 resize-none shadow-sm"
          />
        </div>

        {/* Category and Sample Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
              Category *
            </Label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 appearance-none bg-right ${errors.category
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="">Select category</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.category}
              </p>
            )}
          </div>

          <div>
            <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
              Sample Type *
            </Label>
            <select
              name="sample"
              value={formData.sample}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 appearance-none bg-right ${errors.sample
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="">Select sample type</option>
              {SAMPLE_TYPES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.sample && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.sample}
              </p>
            )}
          </div>
        </div>
        {/* Parameters */}
     
<div>
      <div className="flex items-center justify-between mb-3">
        <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
          Parameters
        </Label>

        <Button
          type="button"
          onClick={addParameter}
          className="flex items-center gap-1 px-3 py-1 text-xs bg-emerald-500 text-white rounded-lg"
        >
          <Plus size={14} /> Add
        </Button>
      </div>

  <div className="space-y-4">
    {parameters.map((param, index) => (
      <div
        key={index}
        className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50"
      >
        {/* Name */}
        <Input
          placeholder="Parameter Name (e.g. Hemoglobin)"
          value={param.name}
          onChange={(e) =>
            handleParameterChange(index, 'name', e.target.value)
          }
        />

        {/* Unit */}
        <Input
          placeholder="Unit (e.g. g/dL)"
          value={param.unit}
          onChange={(e) =>
            handleParameterChange(index, 'unit', e.target.value)
          }
        />

        {/* Min */}
        <Input
          type="number"
          placeholder="Min"
          value={param.min}
          onChange={(e) =>
            handleParameterChange(index, 'min', e.target.value)
          }
        />

        {/* Max */}
        <Input
          type="number"
          placeholder="Max"
          value={param.max}
          onChange={(e) =>
            handleParameterChange(index, 'max', e.target.value)
          }
        />

        {/* Delete */}
        <Button
          type="button"
          variant="outline"
          onClick={() => removeParameter(index)}
          className="flex items-center justify-center"
        >
          <Trash2 size={16} className="text-rose-500" />
        </Button>
      </div>
    ))}
  </div>
</div>


        {/* Price and Status */}
        <div className="grid grid-cols-1  gap-6">
          <div>
            <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
              Price (₹) *
            </Label>
            <Input
              type="number"
              name="price"
              placeholder="500"
              value={formData.price}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${errors.price
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
            />
            {errors.price && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.price}
              </p>
            )}
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all w-full">
              <Input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Active Test
              </span>
            </label>
          </div>
        </div>
      </div>
    </RightDrawer>
  );
}
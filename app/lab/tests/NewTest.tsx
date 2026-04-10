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

import { TestItem, TestVersion, TestParameter, SampleRequirement, ReferenceRange } from './types';

interface NewTestProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TestItem) => void;
  editData?: TestItem | null;
  isEditMode?: boolean;
}

const DEPARTMENTS = [
  { id: 1, name: 'Biochemistry' },
  { id: 2, name: 'Hematology' },
  { id: 3, name: 'Microbiology' },
  { id: 4, name: 'Pathology' },
];

const CATEGORIES = [
  { id: 5, name: 'Lipid Profile' },
  { id: 6, name: 'Liver Function' },
  { id: 7, name: 'Kidney Function' },
  { id: 8, name: 'Thyroid Profile' },
];

const RESULT_TYPES = ['Numeric', 'Text', 'Qualitative', 'Semi_quantitative', 'Structured'];
const GENDER_STATUS = ['Male', 'Female', 'Other', 'All'];
const SAMPLE_TYPES = [
  'Blood_EDTA',
  'Blood_Serum',
  'Urine',
  'Stool',
  'Swab',
  'Sputum',
  'CSF',
  'Biopsy',
  'FNAC',
  'Fluid'
];

export default function NewTest({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
  isEditMode = false
}: NewTestProps) {
  const initialFormData: TestItem = {
    testCode: '',
    testName: '',
    departmentId: '',
    categoryId: '',
    loincCode: '',
    tatHours: '',
    isActive: true,
    version: {
      versionNo: 1,
      method: '',
      unit: '',
      price: '',
      cghsPrice: '',
      criticalLow: '',
      criticalHigh: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: null,
    },
    parameters: [],
    sampleRequirements: [],
  };

  const [formData, setFormData] = useState<TestItem>(editData || initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name.startsWith('version.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        version: {
          ...prev.version,
          [field]: type === 'number' ? (value === '' ? '' : Number(value)) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value === '' ? '' : Number(value)) :
          type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Array handlers
  const addArrayItem = (key: keyof TestItem, defaultItem: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: [...(prev[key] as any[]), defaultItem]
    }));
  };

  const updateArrayItem = (key: keyof TestItem, index: number, field: string, value: any) => {
    setFormData(prev => {
      const updated = [...(prev[key] as any[])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [key]: updated };
    });
  };

  const removeArrayItem = (key: keyof TestItem, index: number) => {
    setFormData(prev => ({
      ...prev,
      [key]: (prev[key] as any[]).filter((_, i) => i !== index)
    }));
  };

  const addNestedArrayItem = (paramIndex: number, defaultItem: any) => {
    setFormData(prev => {
      const updatedParams = [...prev.parameters];
      updatedParams[paramIndex] = {
        ...updatedParams[paramIndex],
        referenceRanges: [...updatedParams[paramIndex].referenceRanges, defaultItem]
      };
      return { ...prev, parameters: updatedParams };
    });
  };

  const updateNestedArrayItem = (paramIndex: number, rangeIndex: number, field: string, value: any) => {
    setFormData(prev => {
      const updatedParams = [...prev.parameters];
      const updatedRanges = [...updatedParams[paramIndex].referenceRanges];
      updatedRanges[rangeIndex] = { ...updatedRanges[rangeIndex], [field]: value };
      updatedParams[paramIndex] = { ...updatedParams[paramIndex], referenceRanges: updatedRanges };
      return { ...prev, parameters: updatedParams };
    });
  };

  const removeNestedArrayItem = (paramIndex: number, rangeIndex: number) => {
    setFormData(prev => {
      const updatedParams = [...prev.parameters];
      updatedParams[paramIndex] = {
        ...updatedParams[paramIndex],
        referenceRanges: updatedParams[paramIndex].referenceRanges.filter((_, i) => i !== rangeIndex)
      };
      return { ...prev, parameters: updatedParams };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.testCode.trim()) newErrors.testCode = 'Test Code is required';
    if (!formData.testName.trim()) newErrors.testName = 'Test Name is required';
    if (formData.departmentId === '') newErrors.departmentId = 'Department is required';
    if (formData.categoryId === '') newErrors.categoryId = 'Category is required';
    if (formData.version.price === '' || Number(formData.version.price) <= 0)
      newErrors['version.price'] = 'Valid price is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
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
      <div className="space-y-10 pb-10">
        {/* SECTION: GENERAL INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Database size={18} className="text-emerald-500" /> General Information
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Test Code *</Label>
                <Input
                  name="testCode"
                  value={formData.testCode}
                  onChange={handleInputChange}
                  placeholder="LIPID_001"
                  className={errors.testCode ? 'border-rose-300 ring-rose-50' : ''}
                />
                {errors.testCode && <p className="text-[10px] font-bold text-rose-500 pl-1 uppercase">{errors.testCode}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Test Name *</Label>
                <Input
                  name="testName"
                  value={formData.testName}
                  onChange={handleInputChange}
                  placeholder="Lipid Profile"
                  className={errors.testName ? 'border-rose-300 ring-rose-50' : ''}
                />
                {errors.testName && <p className="text-[10px] font-bold text-rose-500 pl-1 uppercase">{errors.testName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Department *</Label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.departmentId ? 'border-rose-300' : ''}`}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.departmentId && <p className="text-[10px] font-bold text-rose-500 pl-1 uppercase">{errors.departmentId}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Category *</Label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.categoryId ? 'border-rose-300' : ''}`}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <p className="text-[10px] font-bold text-rose-500 pl-1 uppercase">{errors.categoryId}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">LOINC Code</Label>
              <Input name="loincCode" value={formData.loincCode} onChange={handleInputChange} placeholder="24331-1" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">TAT (Hours)</Label>
              <Input type="number" name="tatHours" value={formData.tatHours} onChange={handleInputChange} placeholder="24" />
            </div>
          </div>
        </div>

        {/* SECTION: VERSIONING & PRICING */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity size={18} className="text-teal-500" /> Version & Pricing details
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Method</Label>
                <Input name="version.method" value={formData.version.method} onChange={handleInputChange} placeholder="Enzymatic Colorimetric" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Default Unit</Label>
                <Input name="version.unit" value={formData.version.unit} onChange={handleInputChange} placeholder="mg/dL" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Standard Price (₹) *</Label>
                <Input
                  type="number"
                  name="version.price"
                  value={formData.version.price}
                  onChange={handleInputChange}
                  placeholder="500.00"
                  className={errors['version.price'] ? 'border-rose-300 ring-rose-50' : ''}
                />
                {errors['version.price'] && <p className="text-[10px] font-bold text-rose-500 pl-1 uppercase">{errors['version.price']}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">CGHS Price (₹)</Label>
                <Input type="number" name="version.cghsPrice" value={formData.version.cghsPrice} onChange={handleInputChange} placeholder="350.00" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Test Critical Low</Label>
                <Input type="number" name="version.criticalLow" value={formData.version.criticalLow} onChange={handleInputChange} placeholder="40.0" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Test Critical High</Label>
                <Input type="number" name="version.criticalHigh" value={formData.version.criticalHigh} onChange={handleInputChange} placeholder="300.0" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Effective From</Label>
                <Input type="date" name="version.effectiveFrom" value={formData.version.effectiveFrom} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: PARAMETERS */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Plus size={18} className="text-blue-500" /> Test Parameters
            </h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => addArrayItem('parameters', { parameterName: '', unit: '', criticalLow: null, criticalHigh: null, resultType: 'Numeric', isCalculated: false, referenceRanges: [] })}
              className="h-8 gap-1.5 text-[10px] font-black border-slate-200 text-slate-600 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 transition-all uppercase tracking-widest"
            >
              <Plus size={14} /> Add Parameter
            </Button>
          </div>
          <div className="p-6">
            {formData.parameters.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl">
                <p className="text-slate-400 text-sm font-medium">No parameters added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.parameters.map((param, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-4 relative group">
                    <button
                      onClick={() => removeArrayItem('parameters', idx)}
                      className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-10">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Parameter Name</Label>
                        <Input
                          value={param.parameterName}
                          onChange={(e) => updateArrayItem('parameters', idx, 'parameterName', e.target.value)}
                          placeholder="Total Cholesterol"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Unit</Label>
                        <Input
                          value={param.unit}
                          onChange={(e) => updateArrayItem('parameters', idx, 'unit', e.target.value)}
                          placeholder="mg/dL"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Result Type</Label>
                        <select
                          value={param.resultType}
                          onChange={(e) => updateArrayItem('parameters', idx, 'resultType', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {RESULT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`calc-${idx}`}
                          checked={param.isCalculated}
                          onChange={(e) => updateArrayItem('parameters', idx, 'isCalculated', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <Label htmlFor={`calc-${idx}`} className="text-xs font-bold text-slate-600 uppercase cursor-pointer">Calculated</Label>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Critical:</Label>
                        <Input
                          type="number"
                          placeholder="Low"
                          className="h-8 w-20 text-xs text-center p-1"
                          value={param.criticalLow || ''}
                          onChange={(e) => updateArrayItem('parameters', idx, 'criticalLow', e.target.value === '' ? null : Number(e.target.value))}
                        />
                        <Input
                          type="number"
                          placeholder="High"
                          className="h-8 w-20 text-xs text-center p-1"
                          value={param.criticalHigh || ''}
                          onChange={(e) => updateArrayItem('parameters', idx, 'criticalHigh', e.target.value === '' ? null : Number(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* NESTED REFERENCE RANGES */}
                    <div className="mt-6 pt-6 border-t border-slate-200/60">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Search size={14} className="text-indigo-400" /> Reference Ranges
                        </h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addNestedArrayItem(idx, { gender: 'All', ageMin: 0, ageMax: 100, minValue: '', maxValue: '', unit: param.unit })}
                          className="h-7 px-2 text-[9px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 uppercase tracking-wider"
                        >
                          <Plus size={12} className="mr-1" /> Add Range
                        </Button>
                      </div>

                      {param.referenceRanges.length === 0 ? (
                        <div className="text-center py-4 bg-white/50 border border-dashed border-slate-200 rounded-lg">
                          <p className="text-[10px] text-slate-400 font-medium italic">No ranges defined</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {param.referenceRanges.map((range, rangeIdx) => (
                            <div key={rangeIdx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-white p-3 rounded-lg border border-slate-100 shadow-sm relative group/range">
                              <div className="md:col-span-3 space-y-1">
                                <Label className="text-[9px] font-bold text-slate-400 uppercase">Gender</Label>
                                <select
                                  value={range.gender}
                                  onChange={(e) => updateNestedArrayItem(idx, rangeIdx, 'gender', e.target.value)}
                                  className="h-8 w-full rounded border border-slate-200 bg-slate-50 px-2 text-[11px]"
                                >
                                  {GENDER_STATUS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                              </div>
                              <div className="md:col-span-3 space-y-1">
                                <Label className="text-[9px] font-bold text-slate-400 uppercase">Age (Min-Max)</Label>
                                <div className="flex gap-1">
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    className="h-8 text-[11px] p-1 shadow-none"
                                    value={range.ageMin}
                                    onChange={(e) => updateNestedArrayItem(idx, rangeIdx, 'ageMin', e.target.value === '' ? '' : Number(e.target.value))}
                                  />
                                  <Input
                                    type="number"
                                    placeholder="100"
                                    className="h-8 text-[11px] p-1 shadow-none"
                                    value={range.ageMax}
                                    onChange={(e) => updateNestedArrayItem(idx, rangeIdx, 'ageMax', e.target.value === '' ? '' : Number(e.target.value))}
                                  />
                                </div>
                              </div>
                              <div className="md:col-span-3 space-y-1">
                                <Label className="text-[9px] font-bold text-slate-400 uppercase">Values (Min-Max)</Label>
                                <div className="flex gap-1">
                                  <Input
                                    placeholder="Min"
                                    className="h-8 text-[11px] p-1 shadow-none"
                                    value={range.minValue}
                                    onChange={(e) => updateNestedArrayItem(idx, rangeIdx, 'minValue', e.target.value)}
                                  />
                                  <Input
                                    placeholder="Max"
                                    className="h-8 text-[11px] p-1 shadow-none"
                                    value={range.maxValue}
                                    onChange={(e) => updateNestedArrayItem(idx, rangeIdx, 'maxValue', e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="md:col-span-2 space-y-1">
                                <Label className="text-[9px] font-bold text-slate-400 uppercase">Unit</Label>
                                <Input
                                  placeholder="unit"
                                  className="h-8 text-[11px] p-1 shadow-none"
                                  value={range.unit}
                                  onChange={(e) => updateNestedArrayItem(idx, rangeIdx, 'unit', e.target.value)}
                                />
                              </div>
                              <div className="md:col-span-1 pb-1">
                                <button
                                  onClick={() => removeNestedArrayItem(idx, rangeIdx)}
                                  className="p-1.5 text-slate-300 hover:text-rose-500 rounded transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION: SAMPLE REQUIREMENTS */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FlaskConical size={18} className="text-amber-500" /> Sample Requirements
            </h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => addArrayItem('sampleRequirements', { sampleType: '', volumeMl: '', containerColor: '', storageCondition: '', transportCondition: '' })}
              className="h-8 gap-1.5 text-[10px] font-black border-slate-200 text-slate-600 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 transition-all uppercase tracking-widest"
            >
              <Plus size={14} /> Add Requirement
            </Button>
          </div>
          <div className="p-6">
            {formData.sampleRequirements.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl">
                <p className="text-slate-400 text-sm font-medium">No sample requirements added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.sampleRequirements.map((req, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-4 relative group">
                    <button
                      onClick={() => removeArrayItem('sampleRequirements', idx)}
                      className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pr-10">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Sample Type</Label>
                        <select
                          value={req.sampleType}
                          onChange={(e) => updateArrayItem('sampleRequirements', idx, 'sampleType', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Select Sample Type</option>
                          {SAMPLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Vol (ml)</Label>
                        <Input
                          type="number"
                          value={req.volumeMl}
                          onChange={(e) => updateArrayItem('sampleRequirements', idx, 'volumeMl', e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="5.0"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Container Color</Label>
                        <Input
                          value={req.containerColor}
                          onChange={(e) => updateArrayItem('sampleRequirements', idx, 'containerColor', e.target.value)}
                          placeholder="Yellow"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-10">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Storage Condition</Label>
                        <Input
                          value={req.storageCondition}
                          onChange={(e) => updateArrayItem('sampleRequirements', idx, 'storageCondition', e.target.value)}
                          placeholder="Refrigerated"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Transport Condition</Label>
                        <Input
                          value={req.transportCondition}
                          onChange={(e) => updateArrayItem('sampleRequirements', idx, 'transportCondition', e.target.value)}
                          placeholder="Cold Chain"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>



        {/* SECTION: STATUS */}
        <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <input
            type="checkbox"
            id="is-active"
            checked={formData.isActive}
            name="isActive"
            onChange={handleInputChange}
            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <Label htmlFor="is-active" className="text-sm font-black text-slate-700 uppercase tracking-widest cursor-pointer">
            This test is currently active and available for selection
          </Label>
        </div>
      </div>
    </RightDrawer>
  );
}
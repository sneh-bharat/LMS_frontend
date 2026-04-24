'use client';

import { useState, useEffect } from 'react';
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
import { createTest, updateTest, createSampleRequirement, updateSampleRequirement, createTestVersion, createTestParameter, type CreateTestInput, type UpdateTestInput, type Test } from '@/app/Apis/lab/TestApis';
import type { TestVersion, SampleRequirement, ReferenceRange, Parameter as TestParameter } from '@/app/Apis/lab/TestApis';

// Define TestItem locally as it's the form data structure
interface TestItem {
  testCode: string;
  testName: string;
  departmentId: string;
  categoryId: string;
  loincCode: string;
  tatHours: string;
  isActive: boolean;
  version: {
    versionNo: number;
    method: string;
    unit: string;
    price: string;
    cghsPrice: string;
    criticalLow: string;
    criticalHigh: string;
    effectiveFrom: string;
    effectiveTo: string | null;
  };
  parameters: TestParameter[];
  sampleRequirements: SampleRequirement[];
}

interface NewTestProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TestItem) => void;
  editData?: Test | null;
  isEditMode?: boolean;
  activeTab?: 'test' | 'sample' | 'parameters' | 'pricing';
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

// ─── Tab Configuration ───────────────────────────────────────────────────────
const TAB_CONFIG = {
  test: {
    label: 'Full Test',
    color: 'slate',
    icon: Database,
    description: 'Complete test setup'
  },
  sample: {
    label: 'Sample',
    color: 'amber',
    icon: FlaskConical,
    description: 'Sample requirements'
  },
  parameters: {
    label: 'Parameters',
    color: 'blue',
    icon: Activity,
    description: 'Test parameters'
  },
  pricing: {
    label: 'Pricing',
    color: 'orange',
    icon: Edit2,
    description: 'Pricing information'
  }
};

export default function NewTest({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
  isEditMode = false,
  activeTab = 'test'
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

  const [formData, setFormData] = useState<TestItem>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Populate form with edit data when in edit mode
  useEffect(() => {
    if (editData && isEditMode && isOpen) {
      console.log('=== EDIT MODE - POPULATING FORM ===');
      console.log('Edit data received:', editData);
      console.log('Active tab:', activeTab);
      
      // Set sample requirements if in sample mode or if they exist
      if (activeTab === 'sample' && editData.sampleRequirements) {
        console.log('Populating sample requirements:', editData.sampleRequirements);
      }
      
      setFormData({
        testCode: editData.testCode || '',
        testName: editData.testName || '',
        departmentId: editData.departmentId?.toString() || '',
        categoryId: editData.categoryId?.toString() || '',
        loincCode: editData.loincCode || '',
        tatHours: editData.tatHours?.toString() || '',
        isActive: editData.isActive !== undefined ? editData.isActive : true,
        version: {
          versionNo: editData.version?.versionNo || 1,
          method: editData.version?.method || '',
          unit: editData.version?.unit || '',
          price: editData.version?.price?.toString() || '',
          cghsPrice: editData.version?.cghsPrice?.toString() || '',
          criticalLow: '',
          criticalHigh: '',
          effectiveFrom: editData.version?.effectiveFrom || new Date().toISOString().split('T')[0],
          effectiveTo: editData.version?.effectiveTo || null,
        },
        parameters: editData.parameters || [],
        sampleRequirements: editData.sampleRequirements || [],
      });
    } else if (!isOpen) {
      // Reset form when drawer closes
      setFormData(initialFormData);
      setErrors({});
    }
  }, [editData, isEditMode, isOpen, activeTab]);

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
        referenceRanges: [...(updatedParams[paramIndex].referenceRanges || []), defaultItem]
      };
      return { ...prev, parameters: updatedParams };
    });
  };

  const updateNestedArrayItem = (paramIndex: number, rangeIndex: number, field: string, value: any) => {
    setFormData(prev => {
      const updatedParams = [...prev.parameters];
      const updatedRanges = [...(updatedParams[paramIndex].referenceRanges || [])];
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
        referenceRanges: updatedParams[paramIndex].referenceRanges?.filter((_, i) => i !== rangeIndex) || []
      };
      return { ...prev, parameters: updatedParams };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    console.log('=== VALIDATION - ACTIVE TAB ===', activeTab);

    // Only validate General Information in 'test' or 'sample' mode
    if (activeTab === 'test' || activeTab === 'sample') {
      if (!formData.testCode.trim()) newErrors.testCode = 'Test Code is required';
      if (!formData.testName.trim()) newErrors.testName = 'Test Name is required';
      if (formData.departmentId === '') newErrors.departmentId = 'Department is required';
      if (formData.categoryId === '') newErrors.categoryId = 'Category is required';
    }

    // Only validate Version/Pricing fields in 'test' or 'pricing' mode
    if (activeTab === 'test' || activeTab === 'pricing') {
      if (formData.version.price === '' || Number(formData.version.price) <= 0)
        newErrors['version.price'] = 'Valid price is required';
      if (!formData.version.method.trim()) newErrors['version.method'] = 'Method is required';
      if (!formData.version.unit.trim()) newErrors['version.unit'] = 'Unit is required';
      if (!formData.version.effectiveFrom) newErrors['version.effectiveFrom'] = 'Effective date is required';
    }

    // Always validate these if they have data (regardless of mode)
    // These are only relevant when editing those specific sections
    if (activeTab === 'test') {
      // Full edit mode - validate everything
    }

    setErrors(newErrors);
    console.log('Validation errors:', newErrors);
    console.log('Validation result:', Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      console.error('❌ FORM VALIDATION FAILED');
      console.error('Errors:', errors);
      return;
    }

    console.log('=== HANDLE SUBMIT CALLED ===');
    console.log('isEditMode:', isEditMode);
    console.log('editData:', editData);
    console.log('editData?.id:', editData?.id);
    console.log('formData:', formData);

    setLoading(true);
    try {
      // HANDLE SAMPLE REQUIREMENT UPDATE (dedicated API)
      if (isEditMode && editData?.id && activeTab === 'sample') {
        console.log('=== UPDATING SAMPLE REQUIREMENT VIA DEDICATED API ===');
        console.log('Test ID:', editData.id);
        console.log('Active tab:', activeTab);

        const sampleReq = formData.sampleRequirements[0];
        
        if (!sampleReq) {
          throw new Error('No sample requirement data found');
        }

        const sampleData = {
          sampleType: sampleReq.sampleType,
          volumeMl: Number(sampleReq.volumeMl),
          containerColor: sampleReq.containerColor,
          storageCondition: sampleReq.storageCondition,
        };

        console.log('Sample requirement data:', JSON.stringify(sampleData, null, 2));

        let response;
        
        // Check if we're updating existing or creating new
        if (sampleReq.id && sampleReq.id > 0) {
          // UPDATE existing sample requirement using specific ID
          console.log('📡 Updating existing sample requirement (ID:', sampleReq.id, ')');
          response = await updateSampleRequirement(editData.id, sampleReq.id, sampleData);
        } else {
          // CREATE new sample requirement
          console.log('📡 Creating new sample requirement');
          response = await createSampleRequirement(editData.id, sampleData);
        }
        
        console.log('✅ Sample requirement saved successfully:', response);
        
        // Notify parent to reload the list
        onSubmit(formData as any);
        
        // Reset form and close
        setFormData(initialFormData);
        setErrors({});
        onClose();
      }
      // HANDLE FULL TEST UPDATE
      else if (isEditMode && editData?.id) {
        // UPDATE EXISTING TEST
        console.log('=== UPDATING EXISTING TEST ===');
        console.log('Test ID:', editData.id);

        // Transform formData to match API UpdateTestInput
        const testData: UpdateTestInput = {
          testCode: formData.testCode,
          testName: formData.testName,
          description: '',
          departmentId: Number(formData.departmentId),
          categoryId: Number(formData.categoryId),
          loincCode: formData.loincCode || undefined,
          tatHours: Number(formData.tatHours),
          isActive: formData.isActive,
          version: {
            versionNo: Number(formData.version.versionNo),
            method: formData.version.method,
            unit: formData.version.unit,
            price: Number(formData.version.price),
            cghsPrice: formData.version.cghsPrice ? Number(formData.version.cghsPrice) : undefined,
            effectiveFrom: formData.version.effectiveFrom,
            effectiveTo: formData.version.effectiveTo || '',
          },
          parameters: formData.parameters.map(param => ({
            id: param.id,
            parameterName: param.parameterName,
            unit: param.unit,
            criticalLow: param.criticalLow || 0,
            criticalHigh: param.criticalHigh || 0,
            resultType: param.resultType,
            isCalculated: param.isCalculated,
            calculationFormula: param.isCalculated ? param.calculationFormula : undefined,
            sortOrder: param.sortOrder,
            referenceRanges: param.referenceRanges?.map(range => ({
              id: range.id,
              gender: range.gender,
              ageMin: Number(range.ageMin),
              ageMax: Number(range.ageMax),
              minValue: Number(range.minValue),
              maxValue: Number(range.maxValue),
              unit: range.unit,
            })),
          })),
          sampleRequirements: formData.sampleRequirements.map(req => ({
            id: req.id,
            sampleType: req.sampleType,
            volumeMl: Number(req.volumeMl),
            containerColor: req.containerColor,
            storageCondition: req.storageCondition,
          })),
        };

        console.log('Transformed API data for UPDATE:', JSON.stringify(testData, null, 2));

        const response = await updateTest(editData.id, testData);
        
        console.log('✅ Test updated successfully:', response);
        
        // Notify parent to reload the list
        onSubmit(formData);
        
        // Reset form and close
        setFormData(initialFormData);
        setErrors({});
        onClose();
      } else {
        // CREATE NEW TEST - CALL ALL API ENDPOINTS SEQUENTIALLY
        console.log('=== CREATING NEW TEST WITH ALL ENDPOINTS ===');

        // Step 1: Create basic test details
        console.log('Step 1: Creating basic test details...');
        
        // Build version object, handling nullable effectiveTo properly
        const versionData = {
          versionNo: Number(formData.version.versionNo),
          method: formData.version.method,
          unit: formData.version.unit,
          price: Number(formData.version.price),
          ...(formData.version.cghsPrice && { cghsPrice: Number(formData.version.cghsPrice) }),
          effectiveFrom: formData.version.effectiveFrom,
          ...(formData.version.effectiveTo && { effectiveTo: formData.version.effectiveTo }),
        };
        
        const testData: CreateTestInput = {
          testCode: formData.testCode,
          testName: formData.testName,
          departmentId: Number(formData.departmentId),
          categoryId: Number(formData.categoryId),
          loincCode: formData.loincCode || undefined,
          tatHours: Number(formData.tatHours),
          isActive: formData.isActive,
          version: versionData,
        };

        console.log('Basic test data:', JSON.stringify(testData, null, 2));

        const testResponse = await createTest(testData);
        console.log('✅ Test created successfully:', testResponse);
        console.log('Test response data:', testResponse.data);
        console.log('Test response type:', typeof testResponse);
        console.log('Test response keys:', Object.keys(testResponse || {}));
        
        // Handle different response structures
        const testId = testResponse?.data?.id || (testResponse as any)?.id;
        
        if (!testId) {
          console.error('❌ No test ID in response:', testResponse);
          throw new Error('Test creation failed: No test ID returned from API');
        }
        
        console.log('🆔 New Test ID:', testId);

        // Step 2: Create sample requirements (if any)
        if (formData.sampleRequirements.length > 0) {
          console.log('Step 3: Creating sample requirements...');
          for (const req of formData.sampleRequirements) {
            const sampleData = {
              sampleType: req.sampleType,
              volumeMl: Number(req.volumeMl),
              containerColor: req.containerColor,
              storageCondition: req.storageCondition,
            };

            console.log('Creating sample requirement:', sampleData);
            const sampleResponse = await createSampleRequirement(testId, sampleData);
            console.log('✅ Sample requirement created:', sampleResponse);
          }
        }

        // Step 4: Create parameters (if any)
        if (formData.parameters.length > 0) {
          console.log('Step 4: Creating test parameters...');
          for (const param of formData.parameters) {
            const parameterData = {
              parameterName: param.parameterName,
              unit: param.unit,
              criticalLow: param.criticalLow || 0,
              criticalHigh: param.criticalHigh || 0,
              resultType: param.resultType,
              isCalculated: param.isCalculated,
              calculationFormula: param.isCalculated ? param.calculationFormula : undefined,
              sortOrder: param.sortOrder,
              referenceRanges: param.referenceRanges?.map(range => ({
                gender: range.gender,
                ageMin: Number(range.ageMin),
                ageMax: Number(range.ageMax),
                minValue: Number(range.minValue),
                maxValue: Number(range.maxValue),
                unit: range.unit,
              })) || [],
            };

            console.log('Creating parameter:', parameterData);
            const parameterResponse = await createTestParameter(testId, parameterData);
            console.log('✅ Parameter created:', parameterResponse);
          }
        }

        console.log('🎉 Full test creation completed successfully!');
        console.log('Test ID:', testId);
        console.log('Sample Requirements:', formData.sampleRequirements.length);
        console.log('Parameters:', formData.parameters.length);
        
        // Notify parent to reload the list
        onSubmit(formData);
        
        // Reset form and close
        setFormData(initialFormData);
        setErrors({});
        onClose();
      }
    } catch (error) {
      console.error(`❌ Failed to ${isEditMode ? 'update' : 'create'} test:`, error);
      console.error('Error details:', error);
      setErrors({
        submit: error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} test. Please try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  // Get tab config for current activeTab
  const currentTabConfig = TAB_CONFIG[activeTab as keyof typeof TAB_CONFIG] || TAB_CONFIG.test;
  const IconComponent = currentTabConfig.icon;

  const footer = (
    <div className="flex gap-3 justify-end w-full">
      <Button
        variant="outline"
        onClick={handleClose}
        className="px-6 py-2 rounded-lg font-bold transition-all text-sm border-slate-300 text-slate-700"
        disabled={loading}
        suppressHydrationWarning
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-600 hover:to-teal-600 transition-all text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
        suppressHydrationWarning
      >
        {loading ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            {isEditMode ? (activeTab === 'sample' ? 'Updating Sample...' : 'Updating...') : 'Creating...'}
          </>
        ) : (
          isEditMode ? (activeTab === 'sample' ? 'Update Sample' : 'Update Test') : 'Create Test'
        )}
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
          <span className="text-[#00AC80]">Test</span>
          {activeTab !== 'test' && (
            <span className="text-xs font-semibold text-slate-400 ml-2">
              • {currentTabConfig.label}
            </span>
          )}
        </>
      }
      description={
        activeTab === 'sample' ? 'Edit sample requirements and specifications' :
        activeTab === 'parameters' ? 'Edit test parameters and reference ranges' :
        activeTab === 'pricing' ? 'Edit pricing and critical value information' :
        isEditMode ? 'Update diagnostic test details' : 'Add a new diagnostic test'
      }
      footer={footer}
      maxWidth="xl"
    >
      {/* Tab Indicator Badge */}
      {activeTab !== 'test' && (
        <div className="mb-6 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
          <IconComponent size={16} className={`text-${currentTabConfig.color}-500`} />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            Editing: {currentTabConfig.label} Section
          </span>
        </div>
      )}

      <div className="space-y-10 pb-10">
        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION: General Information (shows ONLY in test mode) */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'test' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Database size={18} className="text-[#006D77]" /> General Information
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
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">TAT (Hours)</Label>
                <Input type="number" name="tatHours" value={formData.tatHours} onChange={handleInputChange} placeholder="24" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Effective From</Label>
                <Input type="date" name="version.effectiveFrom" value={formData.version.effectiveFrom} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION: Test Configuration & Pricing (test or pricing mode) */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {(activeTab === 'test' || activeTab === 'pricing') && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Activity size={18} className="text-[#00AC80]" />Test Configuration & Pricing
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Method</Label>
                  <Input name="version.method" value={formData.version.method} onChange={handleInputChange} placeholder="Enzymatic Colorimetric" disabled={activeTab === 'pricing'} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Default Unit</Label>
                  <Input name="version.unit" value={formData.version.unit} onChange={handleInputChange} placeholder="mg/dL" disabled={activeTab === 'pricing'} />
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
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION: Test Parameters (test or parameters mode) */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {(activeTab === 'test' || activeTab === 'parameters') && (
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
                suppressHydrationWarning
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
                        suppressHydrationWarning
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
                            suppressHydrationWarning
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
                            suppressHydrationWarning
                          >
                            <Plus size={12} className="mr-1" /> Add Range
                          </Button>
                        </div>

                        {(() => {
                          const ranges = param.referenceRanges || [];
                          return ranges.length === 0 ? (
                            <div className="text-center py-4 bg-white/50 border border-dashed border-slate-200 rounded-lg">
                              <p className="text-[10px] text-slate-400 font-medium italic">No ranges defined</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {ranges.map((range, rangeIdx) => (
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
                                    suppressHydrationWarning
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION: Sample Requirements (ONLY in sample mode) */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'sample' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FlaskConical size={18} className="text-amber-500" /> Sample Requirements
              </h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addArrayItem('sampleRequirements', { sampleType: '', volumeMl: '', containerColor: '', storageCondition: '' })}
                className="h-8 gap-1.5 text-[10px] font-black border-slate-200 text-slate-600 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 transition-all uppercase tracking-widest"
                suppressHydrationWarning
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
                        suppressHydrationWarning
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
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Storage Condition</Label>
                        <Input
                          value={req.storageCondition}
                          onChange={(e) => updateArrayItem('sampleRequirements', idx, 'storageCondition', e.target.value)}
                          placeholder="Refrigerated"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION: Sample Requirements (test or sample mode) */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'test' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FlaskConical size={18} className="text-amber-500" /> Sample Requirements
              </h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addArrayItem('sampleRequirements', { sampleType: '', volumeMl: '', containerColor: '', storageCondition: '' })}
                className="h-8 gap-1.5 text-[10px] font-black border-slate-200 text-slate-600 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 transition-all uppercase tracking-widest"
                suppressHydrationWarning
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
                        suppressHydrationWarning
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle size={18} />
            <span className="text-sm font-bold">{errors.submit}</span>
          </div>
        )}

        {/* SECTION: STATUS - Only show in test mode */}
        {activeTab === 'test' && (
          <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <input
              type="checkbox"
              id="is-active"
              checked={formData.isActive}
              name="isActive"
              onChange={handleInputChange}
              className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              suppressHydrationWarning
            />
            <Label htmlFor="is-active" className="text-sm font-black text-slate-700 uppercase tracking-widest cursor-pointer">
              This test is currently active and available for selection
            </Label>
          </div>
        )}
      </div>
    </RightDrawer>
  );
}
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
import { createTest, updateTest, createSampleRequirement, updateSampleRequirement, createTestParameter, updateTestParameter, fetchTests, type CreateTestInput, type UpdateTestInput, type Test } from '@/app/Apis/lab/TestApis';
import type { TestVersion, SampleRequirement, ReferenceRange, Parameter as TestParameter } from '@/app/Apis/lab/TestApis';
import { departmentApi, type Department } from '@/app/Apis/lab/departmentApi';
import { fetchTestCategories, type TestCategory } from '@/app/Apis/lab/TestCategories';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';

// Define TestItem locally as it's the form data structure
interface TestItem {
  testName: string;
  testNameShort?: string;
  testDescription?: string;
  departmentId: string;
  branchId: string;
  categoryId: string;
  loincCode: string;
  tatHours: string;
  tatMinutes?: string;
  isActive: boolean;
  // Flat structure (no nested version object)
  method: string;
  unit: string;
  price: string;
  cghsPrice: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  parameters: Array<{
    id?: number;
    parameterCode?: string;
    parameterName: string;
    displayOrder?: number;
    unit: string;
    decimalPlaces?: number;
    criticalLow?: number;
    criticalHigh?: number;
    isCalculated: boolean;
    resultType: string;
    calculationFormula?: string;
    referenceRanges?: Array<{
      id?: number;
      gender: string;
      ageMin: number;
      ageMax: number;
      minValue: number;
      maxValue: number;
      unit: string;
    }>;
  }>;
  sampleRequirements: Array<{
    id?: number;
    sampleType: string;
    volumeMl: number;
    containerColor: string;
    storageCondition: string;
    isMandatory?: boolean;
  }>;
}

interface NewTestProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TestItem) => void;
  editData?: Test | null;
  isEditMode?: boolean;
  activeTab?: 'test' | 'sample' | 'parameters' | 'pricing';
}

// ─── State for Dropdowns ─────────────────────────────────────────────────────
const DEPARTMENTS_PLACEHOLDER: Department[] = [];
const CATEGORIES_PLACEHOLDER: TestCategory[] = [];

const RESULT_TYPES = ['NUMERIC', 'TEXT', 'QUALITATIVE', 'SEMI_QUANTITATIVE', 'STRUCTURED'];
const GENDER_STATUS = ['MALE', 'FEMALE', 'OTHER', 'ALL'];
const UNIT_TYPES = [
  'mg/dL',
  'g/dL',
  'mmol/L',
  'μmol/L',
  'cells/mcL',
  'cells/μL',
  'x10^9/L',
  '%',
  'hours',
  'minutes',
  'IU/L',
  'U/L',
  'ng/mL',
  'pg/mL',
  'mmHg',
  'mEq/L',
  'mL',
  'L',
  'g',
  'mg',
  'μg',
  'ratio',
  'positive',
  'negative',
  'present',
  'absent',
  'seen',
  'not seen'
];
const SAMPLE_TYPES = [
  'BLOOD_EDTA',
  'BLOOD_SERUM',
  'BLOOD_PLASMA',
  'WHOLE_BLOOD',
  'URINE',
  'STOOL',
  'CSF',
  'SPUTUM',
  'FNAC',
  'FLUID',
  'SWAB',
  'CSF',
  'BIOPSY',
  'FNAC',
  'BODY_FLUID',
  'SALIVA'

];

const normalizeSampleType = (value?: string | null): string => {
  if (!value) return '';
  const normalizedIncoming = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  const matched = SAMPLE_TYPES.find(
    (type) => type.toLowerCase() === normalizedIncoming
  );
  return matched || value;
};

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

function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function NewTest({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
  isEditMode = false,
  activeTab = 'test'
}: NewTestProps) {
  const initialFormData: TestItem = {
    testName: '',
    testNameShort: '',
    testDescription: '',
    departmentId: '',
    branchId: '',
    categoryId: '',
    loincCode: '',
    tatHours: '',
    tatMinutes: '',
    isActive: true,
    method: '',
    unit: '',
    price: '',
    cghsPrice: '',
    effectiveFrom: getTodayDateString(),
    effectiveTo: null,
    parameters: [],
    sampleRequirements: [],
  };

  const [formData, setFormData] = useState<TestItem>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>(DEPARTMENTS_PLACEHOLDER);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<TestCategory[]>(CATEGORIES_PLACEHOLDER);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const todayDate = getTodayDateString();
  const effectiveToMinDate =
    formData.effectiveFrom && formData.effectiveFrom > todayDate
      ? formData.effectiveFrom
      : todayDate;

  // Load dropdowns (departments and categories)
  useEffect(() => {
    const loadDropdowns = async () => {
      if (!isOpen) return;
      
      setLoadingDropdowns(true);
      try {
        // Load branches
        const branchResponse = await branchApi.getAllBranches({ pageNo: 0, pageSize: 100 });
        if (branchResponse?.data?.content) {
          setBranches(branchResponse.data.content);
        }
        
        // Load departments
        const deptResponse = await departmentApi.getAllDepartments({ pageNo: 0, pageSize: 100 });
        if (deptResponse?.data?.content) {
          setDepartments(deptResponse.data.content);
        }
        
        // Load categories using fetchTestCategories
        const catResponse = await fetchTestCategories(0, 1000);
        
        // The structure should be: { data: { content: [...] }, message, response, status, timestamp }
        if (catResponse?.data?.content && Array.isArray(catResponse.data.content)) {
          setCategories(catResponse.data.content);
        } else {
          console.warn('⚠️ No categories found or invalid structure');
          console.warn('Full response:', JSON.stringify(catResponse, null, 2));
          
          // Fallback: try accessing content directly if structure is different
          if ((catResponse as any)?.content && Array.isArray((catResponse as any).content)) {
            setCategories((catResponse as any).content);
          }
        }
      } catch (error) {
        console.error('❌ Failed to load dropdowns:', error);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadDropdowns();
  }, [isOpen]);

  // Populate form with edit data when in edit mode
  useEffect(() => {
    if (editData && isEditMode && isOpen) {
      
      // Set sample requirements if in sample mode or if they exist
      if (activeTab === 'sample' && editData.sampleRequirements) {
      }
      
      setFormData({
        testName: editData.testName || '',
        testNameShort: editData.testNameShort || '',
        testDescription: editData.testDescription || '',
        departmentId: editData.departmentId?.toString() || '',
        branchId: editData.branchId?.toString() || '',
        categoryId: editData.categoryId?.toString() || '',
        loincCode: editData.loincCode || '',
        tatHours: editData.tatHours?.toString() || '',
        tatMinutes: editData.tatMinutes?.toString() || '',
        isActive: editData.isActive !== undefined ? editData.isActive : true,
        // Flat structure from API response
        method: editData.method || '',
        unit: editData.unit || '',
        price: editData.price?.toString() || '',
        cghsPrice: editData.cghsPrice?.toString() || '',
        effectiveFrom: editData.effectiveFrom || getTodayDateString(),
        effectiveTo: editData.effectiveTo || null,
        parameters: editData.parameters || [],
        sampleRequirements: (editData.sampleRequirements || []).map((req) => ({
          ...req,
          sampleType: normalizeSampleType(req.sampleType),
        })),
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
  
    // Handle select elements - ensure value is treated as string
    if (name === 'departmentId' || name === 'categoryId') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toString()
      }));
    } else if (name === 'effectiveFrom' || name === 'effectiveTo') {
      const today = getTodayDateString();

      if (value && value < today) {
        setErrors((prev) => ({
          ...prev,
          [name]: 'Date cannot be in the past',
        }));
        return;
      }

      if (name === 'effectiveTo' && value && formData.effectiveFrom && value < formData.effectiveFrom) {
        setErrors((prev) => ({
          ...prev,
          effectiveTo: 'Effective To must be on or after Effective From',
        }));
        return;
      }

      setFormData((prev) => {
        const next = { ...prev, [name]: value || null };
        if (
          name === 'effectiveFrom' &&
          next.effectiveTo &&
          next.effectiveTo < (value || today)
        ) {
          next.effectiveTo = value || today;
        }
        return next;
      });
    } else if (name === 'method' || name === 'unit' || name === 'price' || name === 'cghsPrice' || name === 'testNameShort' || name === 'testDescription' || name === 'tatMinutes') {
      // Flat structure fields
      setFormData(prev => ({
        ...prev,
        [name]: name === 'price' || name === 'cghsPrice' ? (value === '' ? '' : Number(value)) : value
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

    // Only validate General Information in 'test' or 'sample' mode
    if (activeTab === 'test' || activeTab === 'sample') {
      if (!formData.testName.trim()) newErrors.testName = 'Test Name is required';
      if (formData.departmentId === '') newErrors.departmentId = 'Department is required';
      if (formData.branchId === '') newErrors.branchId = 'Branch is required';
      if (formData.categoryId === '') {
        newErrors.categoryId = 'Category is required';
        console.error('❌ VALIDATION ERROR: Category is empty!');
      }
    }

    // Only validate Version/Pricing fields in 'test' or 'pricing' mode
    if (activeTab === 'test' || activeTab === 'pricing') {
      if (formData.price === '' || Number(formData.price) <= 0)
        newErrors['price'] = 'Valid price is required';
      if (!formData.method.trim()) newErrors['method'] = 'Method is required';
      if (!formData.effectiveFrom) {
        newErrors['effectiveFrom'] = 'Effective date is required';
      } else if (formData.effectiveFrom < todayDate) {
        newErrors['effectiveFrom'] = 'Effective From cannot be in the past';
      }
      if (formData.effectiveTo && formData.effectiveTo < todayDate) {
        newErrors['effectiveTo'] = 'Effective To cannot be in the past';
      } else if (
        formData.effectiveTo &&
        formData.effectiveFrom &&
        formData.effectiveTo < formData.effectiveFrom
      ) {
        newErrors['effectiveTo'] = 'Effective To must be on or after Effective From';
      }
    }
    // These are only relevant when editing those specific sections
    if (activeTab === 'test') {
      // Full edit mode - validate everything
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    
    const isValid = validateForm();
    
    if (!isValid) {
      // Scroll to first error or show a toast/alert
      return;
    }
    setLoading(true);
    try {
      // HANDLE SAMPLE REQUIREMENT UPDATE (dedicated API)
      if (isEditMode && editData?.id && activeTab === 'sample') {
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


        let response;
        
        // Check if we're updating existing or creating new
        if (sampleReq.id && sampleReq.id > 0) {
          // UPDATE existing sample requirement using specific ID
          response = await updateSampleRequirement(editData.id, sampleReq.id, sampleData);
        } else {
          // CREATE new sample requirement
          response = await createSampleRequirement(editData.id, sampleData);
        }
        
        
        // Notify parent to reload the list
        onSubmit(formData as any);
        
        // Reset form and close
        setFormData(initialFormData);
        setErrors({});
        onClose();
      }
      // HANDLE PARAMETERS UPDATE (dedicated API)
      else if (isEditMode && editData?.id && activeTab === 'parameters') {

        // Check if we're editing a single parameter or all parameters
        const isSingleParameterEdit = (editData as any).editingParameterId;
        const parameterIdToEdit = (editData as any).editingParameterId;

        if (isSingleParameterEdit && formData.parameters.length === 1) {
          // SINGLE PARAMETER UPDATE - Use the specific endpoint
          const param = formData.parameters[0];

          const parameterData = {
            parameterName: param.parameterName,
            unit: param.unit,
            criticalLow: param.criticalLow || 0,
            criticalHigh: param.criticalHigh || 0,
            resultType: param.resultType,
            isCalculated: param.isCalculated,
            calculationFormula: param.isCalculated ? param.calculationFormula : undefined,
            referenceRanges: param.referenceRanges || [],
          };


          try {
            await updateTestParameter(parameterIdToEdit, parameterData, editData.branchId);
            onSubmit(formData as any);
            setFormData(initialFormData);
            setErrors({});
            onClose();
          } catch (error) {
            console.error('❌ Failed to update parameter:', error);
            throw error;
          }
        } else {
          // MULTIPLE PARAMETERS UPDATE - Loop through all parameters
          
          for (const param of formData.parameters) {
            const parameterData = {
              parameterName: param.parameterName,
              unit: param.unit,
              criticalLow: param.criticalLow || 0,
              criticalHigh: param.criticalHigh || 0,
              resultType: param.resultType,
              isCalculated: param.isCalculated,
              calculationFormula: param.isCalculated ? param.calculationFormula : undefined,
              referenceRanges: param.referenceRanges || [],
            };

            if (param.id && param.id > 0) {
              await updateTestParameter(param.id, parameterData, editData.branchId);
            } else {
              await createTestParameter(editData.id, parameterData, editData.branchId);
            }
          }

          onSubmit(formData as any);
          setFormData(initialFormData);
          setErrors({});
          onClose();
        }
      }
      // HANDLE FULL TEST UPDATE
      else if (isEditMode && editData?.id) {
        // UPDATE EXISTING TEST

        // Transform formData to match API UpdateTestInput
        const testData: UpdateTestInput = {
          testCode: editData.testCode,
          testName: formData.testName,
          testDescription: '',
          departmentId: Number(formData.departmentId),
          categoryId: Number(formData.categoryId),
          loincCode: formData.loincCode || undefined,
          tatHours: Number(formData.tatHours),
          isActive: formData.isActive,
          method: formData.method,
          unit: formData.unit,
          price: Number(formData.price),
          cghsPrice: formData.cghsPrice ? Number(formData.cghsPrice) : undefined,
          effectiveFrom: formData.effectiveFrom,
          effectiveTo: formData.effectiveTo || undefined,
          branchId: Number(formData.branchId) || editData.branchId || 1,
          parameters: formData.parameters.map(param => ({
            id: param.id,
            parameterName: param.parameterName,
            unit: param.unit,
            criticalLow: param.criticalLow || 0,
            criticalHigh: param.criticalHigh || 0,
            resultType: param.resultType,
            isCalculated: param.isCalculated,
            calculationFormula: param.isCalculated ? param.calculationFormula : undefined,
            displayOrder: param.displayOrder,
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


        const response = await updateTest(editData.id, testData);
        
        
        // Notify parent to reload the list
        onSubmit(formData);
        
        // Reset form and close
        setFormData(initialFormData);
        setErrors({});
        onClose();
      } else {
        // Create test WITH embedded parameters and sample requirements in single API call
        const testData: CreateTestInput = {
          testName: formData.testName,
          departmentId: Number(formData.departmentId),
          categoryId: Number(formData.categoryId),
          loincCode: formData.loincCode || undefined,
          tatHours: Number(formData.tatHours),
          method: formData.method,
          unit: formData.unit || undefined,
          price: Number(formData.price),
          cghsPrice: formData.cghsPrice ? Number(formData.cghsPrice) : undefined,
          effectiveFrom: formData.effectiveFrom,
          effectiveTo: formData.effectiveTo || undefined,
          branchId: Number(formData.branchId) || 1,
          isActive: formData.isActive,
          // Embed parameters directly in the request body
          parameters: formData.parameters.length > 0 ? formData.parameters.map(param => ({
            parameterCode: param.parameterCode || `PARAM_${param.parameterName.toUpperCase().replace(/\s+/g, '_')}`,
            parameterName: param.parameterName,
            displayOrder: param.displayOrder || 0,
            unit: param.unit,
            decimalPlaces: param.decimalPlaces || 0,
            criticalLow: param.criticalLow || 0,
            criticalHigh: param.criticalHigh || 0,
            isCalculated: param.isCalculated,
            resultType: param.resultType,
            calculationFormula: param.isCalculated ? param.calculationFormula : undefined,
            referenceRanges: param.referenceRanges?.map(range => ({
              gender: range.gender,
              ageMin: Number(range.ageMin),
              ageMax: Number(range.ageMax),
              minValue: Number(range.minValue),
              maxValue: Number(range.maxValue),
              unit: range.unit,
            })) || [],
          })) : undefined,
          // Embed sample requirements directly in the request body
          sampleRequirements: formData.sampleRequirements.length > 0 ? formData.sampleRequirements.map(req => ({
            sampleType: req.sampleType,
            volumeMl: Number(req.volumeMl),
            containerColor: req.containerColor,
            storageCondition: req.storageCondition,
            isMandatory: req.isMandatory || false,
          })) : undefined,
        };


        // Single API call - creates test, parameters, and sample requirements together
        const testResponse = await createTest(testData);
        
        // Notify parent to reload the list
        onSubmit(formData);
        
        // Reset form and close
        setFormData(initialFormData);
        setErrors({});
        onClose();
      }
    } catch (error) {
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
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Test Name *</Label>
                  <Input
                    name="testName"
                    value={formData.testName}
                    onChange={handleInputChange}
                    placeholder="Enter Test Name"
                    className={errors.testName ? 'border-rose-300 ring-rose-50' : ''}
                  />
                  {errors.testName && <p className="text-[10px] font-bold text-rose-500 pl-1 uppercase">{errors.testName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Test Name Short</Label>
                  <Input
                    name="testNameShort"
                    value={formData.testNameShort || ''}
                    onChange={handleInputChange}
                    placeholder="Enter Test Name Short"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Test Description</Label>
                <textarea
                  name="testDescription"
                  value={formData.testDescription || ''}
                  onChange={handleInputChange}
                  placeholder="Enter Test Description"
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Department *</Label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    disabled={loadingDropdowns}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.departmentId ? 'border-rose-300' : ''}`}
                  >
                    <option value="">{loadingDropdowns ? 'Loading...' : 'Select Department'}</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.departmentName}</option>
                    ))}
                  </select>
                  {errors.departmentId && <p className="text-[10px] font-bold text-rose-500 pl-1 uppercase">{errors.departmentId}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Branch *</Label>
                  <select
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleInputChange}
                    disabled={loadingDropdowns}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.branchId ? 'border-rose-300' : ''}`}
                  >
                    <option value="">{loadingDropdowns ? 'Loading...' : branches.length === 0 ? 'No branches available' : 'Select Branch'}</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.branchName}</option>
                    ))}
                  </select>
                  {errors.branchId && <p className="text-[10px] font-bold text-rose-500 pl-1 uppercase">{errors.branchId}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Category *</Label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    disabled={loadingDropdowns}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.categoryId ? 'border-rose-300' : ''}`}
                  >
                    <option value="">{loadingDropdowns ? 'Loading...' : categories.length === 0 ? 'No categories available' : 'Select Category'}</option>
                    {categories.length === 0 && !loadingDropdowns && (
                      <option disabled>Loading categories... Please refresh if this persists</option>
                    )}
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.categoryName}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-[10px] font-bold text-rose-500 pl-1 uppercase">{errors.categoryId}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">LOINC Code</Label>
                  <Input name="loincCode" value={formData.loincCode} onChange={handleInputChange} placeholder="Enter LOINC Code" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">TAT (Hours)</Label>
                  <Input type="number" name="tatHours" value={formData.tatHours} onChange={handleInputChange} placeholder="Enter TAT (Hours)" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">TAT (Minutes)</Label>
                  <Input type="number" name="tatMinutes" value={formData.tatMinutes || ''} onChange={handleInputChange} placeholder="Enter TAT (Minutes)" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Effective From</Label>
                <Input
                  type="date"
                  name="effectiveFrom"
                  value={formData.effectiveFrom}
                  min={todayDate}
                  onChange={handleInputChange}
                  className={errors.effectiveFrom ? 'border-rose-300 ring-rose-50' : ''}
                />
                {errors.effectiveFrom && (
                  <p className="text-[10px] font-bold text-rose-500 pl-1 uppercase">{errors.effectiveFrom}</p>
                )}
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
                  <Input name="method" value={formData.method} onChange={handleInputChange} placeholder="Enter Method" disabled={activeTab === 'pricing'} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Standard Price () *</Label>
                  <Input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter Standard Price (₹)"
                    className={errors['price'] ? 'border-rose-300 ring-rose-50' : ''}
                  />
                  {errors['price'] && <p className="text-[10px] font-bold text-rose-500 pl-1 uppercase">{errors['price']}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Central Government Health Scheme approved rate Price (₹)</Label>
                  <Input type="text" name="cghsPrice" value={formData.cghsPrice} onChange={handleInputChange} placeholder="Enter CGHS approved rate (₹)" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Effective From</Label>
                  <Input
                  type="date"
                  name="effectiveFrom"
                  value={formData.effectiveFrom}
                  min={todayDate}
                  onChange={handleInputChange}
                  className={errors.effectiveFrom ? 'border-rose-300 ring-rose-50' : ''}
                />
                {errors.effectiveFrom && (
                  <p className="text-[10px] font-bold text-rose-500 pl-1 uppercase">{errors.effectiveFrom}</p>
                )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Effective To</Label>
                <Input
                  type="date"
                  name="effectiveTo"
                  value={formData.effectiveTo || ''}
                  min={effectiveToMinDate}
                  onChange={handleInputChange}
                  className={errors.effectiveTo ? 'border-rose-300 ring-rose-50' : ''}
                />
                {errors.effectiveTo && (
                  <p className="text-[10px] font-bold text-rose-500 pl-1 uppercase">{errors.effectiveTo}</p>
                )}
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
                onClick={() => addArrayItem('parameters', { parameterCode: '', parameterName: '', displayOrder: 0, unit: '', decimalPlaces: 0, criticalLow: 0, criticalHigh: 0, resultType: 'NUMERIC', isCalculated: false, referenceRanges: [] })}
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
                          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Parameter Code</Label>
                          <Input
                            value={param.parameterCode || ''}
                            onChange={(e) => updateArrayItem('parameters', idx, 'parameterCode', e.target.value)}
                            placeholder="Enter Parameter Code"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Parameter Name</Label>
                          <Input
                            value={param.parameterName}
                            onChange={(e) => updateArrayItem('parameters', idx, 'parameterName', e.target.value)}
                            placeholder="Enter Parameter Name"
                          />
                        </div>
                        <div className="space-y-1.5"> 
                          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Unit</Label>
                         <select 
                          value={param.unit}
                          onChange={(e) => updateArrayItem('parameters', idx, 'unit', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Select Unit</option>
                          {UNIT_TYPES.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                        </div>
                       
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-10">
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
                            onClick={() => addNestedArrayItem(idx, { gender: 'ALL', ageMin: 0, ageMax: 100, minValue: '', maxValue: '', unit: param.unit || '' })}
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
                                  <input
                                    type="text"
                                    className="h-8 w-full rounded border border-slate-200 bg-slate-50 px-2 text-[11px] text-slate-700 font-medium"
                                    value={param.unit || '-'}
                                    readOnly
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
                          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Volume</Label>
                          <Input
                            type="number"
                            value={req.volumeMl}
                            onChange={(e) => updateArrayItem('sampleRequirements', idx, 'volumeMl', e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="Enter Volume"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Container Color</Label>
                          <Input
                            value={req.containerColor}
                            onChange={(e) => updateArrayItem('sampleRequirements', idx, 'containerColor', e.target.value)}
                            placeholder="Enter Container Color"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Storage Condition</Label>
                        <Input
                          value={req.storageCondition}
                          onChange={(e) => updateArrayItem('sampleRequirements', idx, 'storageCondition', e.target.value)}
                          placeholder="Enter Storage Condition"
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
'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import {
  type ReflexRule,
  type UpdateReflexRuleInput,
} from '@/app/Apis/lab/ReflexRules';
import { useUpdateReflexRule } from '@/app/Apis/lab/useReflexRules';
import { fetchTests, fetchTestParameters, type Test, type ParameterResponse } from '@/app/Apis/lab/TestApis';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';

interface EditReflexRuleProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData: ReflexRule | null;
}

export default function EditReflexRule({
  isOpen,
  onClose,
  onSuccess,
  editData,
}: EditReflexRuleProps) {
  const [formData, setFormData] = useState({
    testId: 0,
    testCode: '',
    testName: '',
    parameterId: null as number | null,
    parameterName: '',
    reflexTestId: 0,
    reflexTestCode: '',
    reflexTestName: '',
    conditionType: 'ALWAYS' as 'ABOVE' | 'BELOW' | 'BETWEEN' | 'EQUALS' | 'NOT_EQUALS' | 'POSITIVE' | 'NEGATIVE' | 'ABNORMAL' | 'CRITICAL' | 'ALWAYS',
    thresholdValue: '',
    thresholdLow: '',
    thresholdHigh: '',
    logicOperator: 'AND' as 'AND' | 'OR',
    priority: 10,
    autoOrder: true,
    notifyPhysician: false,
    gender: null as 'MALE' | 'FEMALE' | 'OTHER' | null,
    ageMin: '' as string | '',
    ageMax: '' as string | '',
    branchId: null as number | null,
    clinicalRationale: '',
    technicianNotes: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tests, setTests] = useState<Test[]>([]);
  const [parameters, setParameters] = useState<ParameterResponse[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [loadingParameters, setLoadingParameters] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [reflexSearchTerm, setReflexSearchTerm] = useState('');
  const [parameterSearchTerm, setParameterSearchTerm] = useState('');
  const [branchSearchTerm, setBranchSearchTerm] = useState('');

  // Use the update mutation hook
  const updateMutation = useUpdateReflexRule();

  // Load form data when editData changes
  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        testId: editData.testId,
        testCode: editData.testCode,
        testName: editData.testName,
        parameterId: editData.parameterId,
        parameterName: editData.parameterName || '',
        reflexTestId: editData.reflexTestId,
        reflexTestCode: editData.reflexTestCode,
        reflexTestName: editData.reflexTestName,
        conditionType: editData.conditionType,
        thresholdValue: editData.thresholdValue?.toString() || '',
        thresholdLow: editData.thresholdLow?.toString() || '',
        thresholdHigh: editData.thresholdHigh?.toString() || '',
        logicOperator: editData.logicOperator,
        priority: editData.priority,
        autoOrder: editData.autoOrder,
        notifyPhysician: editData.notifyPhysician,
        gender: editData.gender,
        ageMin: editData.ageMin?.toString() || '',
        ageMax: editData.ageMax?.toString() || '',
        branchId: editData.branchId,
        clinicalRationale: editData.clinicalRationale || '',
        technicianNotes: editData.technicianNotes || '',
        isActive: editData.isActive,
      });
      setErrors({});
      // Fetch parameters for the selected test in edit mode
      if (editData.testId) {
        fetchParametersByTest(editData.testId);
      }
    } else if (!isOpen) {
      resetForm();
    }
  }, [editData, isOpen]);

  // Load tests and branches when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTestsData();
      fetchBranches();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      testId: 0,
      testCode: '',
      testName: '',
      parameterId: null,
      parameterName: '',
      reflexTestId: 0,
      reflexTestCode: '',
      reflexTestName: '',
      conditionType: 'ABOVE',
      thresholdValue: '',
      thresholdLow: '',
      thresholdHigh: '',
      logicOperator: 'AND',
      priority: 10,
      autoOrder: true,
      notifyPhysician: false,
      gender: null,
      ageMin: '',
      ageMax: '',
      branchId: null,
      clinicalRationale: '',
      technicianNotes: '',
      isActive: true,
    });
    setErrors({});
  };

  const fetchTestsData = async (search?: string) => {
    setLoadingTests(true);
    try {
      const response = await fetchTests(0, 1000, search || undefined);
      if (response?.data?.content) {
        setTests(response.data.content);
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoadingTests(false);
    }
  };

  const fetchParametersByTest = async (testId: number) => {
    if (!testId || testId <= 0) {
      setParameters([]);
      return;
    }
    setLoadingParameters(true);
    try {
      const response = await fetchTestParameters(testId);
      if (response?.data) {
        setParameters(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch parameters for test:', error);
      setParameters([]);
    } finally {
      setLoadingParameters(false);
    }
  };

  const fetchBranches = async (search?: string) => {
    setLoadingBranches(true);
    try {
      const response = await branchApi.getAllBranches({
        pageNo: 0,
        pageSize: 1000,
        search: search || undefined,
      });
      if (response?.data?.content) {
        setBranches(response.data.content);
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleTestSearch = (value: string) => {
    setSearchTerm(value);
    fetchTestsData(value);
  };

  const handleReflexTestSearch = (value: string) => {
    setReflexSearchTerm(value);
    fetchTestsData(value);
  };

  const handleParameterSearch = (value: string) => {
    setParameterSearchTerm(value);
    const filtered = parameters.filter(p => 
      p.parameterName.toLowerCase().includes(value.toLowerCase())
    );
    setParameters(filtered);
  };

  const handleBranchSearch = (value: string) => {
    setBranchSearchTerm(value);
    fetchBranches(value);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.testId) {
      newErrors.testId = 'Test is required';
    }

    if (!formData.reflexTestId) {
      newErrors.reflexTestId = 'Reflex test is required';
    }

    if (formData.conditionType === 'BETWEEN') {
      if (!formData.thresholdLow) {
        newErrors.thresholdLow = 'Threshold low is required';
      }
      if (!formData.thresholdHigh) {
        newErrors.thresholdHigh = 'Threshold high is required';
      }
    } else if (formData.conditionType === 'CRITICAL') {
      if (!formData.thresholdLow || !formData.thresholdHigh) {
        newErrors.thresholdLow = 'Both threshold values are required for CRITICAL';
      }
    }

    if (formData.priority < 0) {
      newErrors.priority = 'Priority must be non-negative';
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
      [name]: type === 'number' || name === 'priority' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleTestSelect = (test: Test) => {
    setFormData((prev) => ({
      ...prev,
      testId: test.id,
      testCode: test.testCode,
      testName: test.testName,
      parameterId: null,
      parameterName: '',
    }));
    fetchParametersByTest(test.id);
    if (errors.testId) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.testId;
        return newErrors;
      });
    }
  };

  const handleReflexTestSelect = (test: Test) => {
    setFormData((prev) => ({
      ...prev,
      reflexTestId: test.id,
      reflexTestCode: test.testCode,
      reflexTestName: test.testName,
    }));
    if (errors.reflexTestId) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.reflexTestId;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!editData?.id) {
      return;
    }

    const payload: UpdateReflexRuleInput = {
      testId: formData.testId,
      parameterId: formData.parameterId || undefined,
      reflexTestId: formData.reflexTestId,
      conditionType: formData.conditionType,
      thresholdLow: formData.thresholdLow !== '' ? parseFloat(formData.thresholdLow as string) : undefined,
      thresholdHigh: formData.thresholdHigh !== '' ? parseFloat(formData.thresholdHigh as string) : undefined,
      logicOperator: formData.logicOperator,
      priority: formData.priority,
      autoOrder: formData.autoOrder,
      notifyPhysician: formData.notifyPhysician,
      gender: formData.gender,
      ageMin: formData.ageMin !== '' ? parseInt(formData.ageMin as string) : undefined,
      ageMax: formData.ageMax !== '' ? parseInt(formData.ageMax as string) : undefined,
      branchId: formData.branchId || undefined,
      clinicalRationale: formData.clinicalRationale || undefined,
      technicianNotes: formData.technicianNotes || undefined,
      isActive: formData.isActive,
    };

    updateMutation.mutate(
      { ruleId: editData.id, data: payload },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="flex-1"
        disabled={updateMutation.isPending}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="reflex-rule-form"
        variant="gradient"
        className="flex-1"
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? 'Saving...' : 'Update Rule'}
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Edit{' '}
          <span className="text-emerald-200">Reflex Rule</span>
        </>
      }
      description="Update reflex rule configuration"
      footer={footer}
      maxWidth="lg"
    >
      <div className="space-y-6">
        <form id="reflex-rule-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Test Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Test *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm || (formData.testId ? (tests.find(t => t.id === formData.testId)?.testName || '') : '')}
                  onChange={(e) => handleTestSearch(e.target.value)}
                  onFocus={() => {
                    if (tests.length === 0) fetchTestsData();
                  }}
                  placeholder="Search and select test..."
                  className={`w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${
                    errors.testId ? 'border-rose-300' : ''
                  }`}
                />
                {tests.length > 0 && searchTerm && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {tests
                      .filter(test => 
                        test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        test.testCode.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .slice(0, 50)
                      .map((test) => (
                        <div
                          key={test.id}
                          onClick={() => {
                            handleTestSelect(test);
                            setSearchTerm('');
                          }}
                          className="px-4 py-3 hover:bg-emerald-50 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0"
                        >
                          <div className="font-medium text-slate-900 text-sm">{test.testName}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{test.testCode}</div>
                        </div>
                      ))}
                  </div>
                )}
                {loadingTests && searchTerm && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl p-4">
                    <p className="text-xs text-slate-500 text-center">Loading tests...</p>
                  </div>
                )}
              </div>
              {errors.testId && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.testId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Parameter (Optional)
              </label>
              <select
                value={formData.parameterId || ''}
                onChange={(e) => {
                  const param = parameters.find(p => p.id === parseInt(e.target.value));
                  setFormData((prev) => ({
                    ...prev,
                    parameterId: param ? (param.id as number) : null,
                    parameterName: param?.parameterName || '',
                  }));
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none bg-white cursor-pointer"
              >
                <option value="" disabled>Select Parameter</option>
                {parameters.map((param) => (
                  <option key={param.id} value={param.id}>
                    {param.parameterName} ({param.unit})
                  </option>
                ))}
              </select>
              {loadingParameters && (
                <p className="text-xs text-slate-500 mt-1">Loading parameters...</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Reflex Test *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={reflexSearchTerm || (formData.reflexTestId ? (tests.find(t => t.id === formData.reflexTestId)?.testName || '') : '')}
                  onChange={(e) => handleReflexTestSearch(e.target.value)}
                  onFocus={() => {
                    if (tests.length === 0) fetchTestsData();
                  }}
                  placeholder="Search and select reflex test..."
                  className={`w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${
                    errors.reflexTestId ? 'border-rose-300' : ''
                  }`}
                />
                {tests.length > 0 && reflexSearchTerm && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {tests
                      .filter(test => 
                        test.testName.toLowerCase().includes(reflexSearchTerm.toLowerCase()) ||
                        test.testCode.toLowerCase().includes(reflexSearchTerm.toLowerCase())
                      )
                      .slice(0, 50)
                      .map((test) => (
                        <div
                          key={test.id}
                          onClick={() => {
                            handleReflexTestSelect(test);
                            setReflexSearchTerm('');
                          }}
                          className="px-4 py-3 hover:bg-emerald-50 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0"
                        >
                          <div className="font-medium text-slate-900 text-sm">{test.testName}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{test.testCode}</div>
                        </div>
                      ))}
                  </div>
                )}
                {loadingTests && reflexSearchTerm && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl p-4">
                    <p className="text-xs text-slate-500 text-center">Loading tests...</p>
                  </div>
                )}
              </div>
              {errors.reflexTestId && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.reflexTestId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Branch (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={branchSearchTerm || (formData.branchId ? (branches.find(b => b.id === formData.branchId)?.branchName || '') : '')}
                  onChange={(e) => handleBranchSearch(e.target.value)}
                  onFocus={() => {
                    if (branches.length === 0) fetchBranches();
                  }}
                  placeholder="Search and select branch..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
                {branches.length > 0 && branchSearchTerm && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {branches
                      .filter(branch => 
                        branch.branchName.toLowerCase().includes(branchSearchTerm.toLowerCase()) ||
                        branch.branchCode.toLowerCase().includes(branchSearchTerm.toLowerCase())
                      )
                      .slice(0, 50)
                      .map((branch) => (
                        <div
                          key={branch.id}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              branchId: branch.id,
                            }));
                            setBranchSearchTerm('');
                          }}
                          className="px-4 py-3 hover:bg-emerald-50 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0"
                        >
                          <div className="font-medium text-slate-900 text-sm">{branch.branchName}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{branch.branchCode}</div>
                        </div>
                      ))}
                  </div>
                )}
                {loadingBranches && branchSearchTerm && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl p-4">
                    <p className="text-xs text-slate-500 text-center">Loading branches...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Condition Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Condition Type *
              </label>
              <select
                name="conditionType"
                value={formData.conditionType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none bg-white cursor-pointer"
              >
                <option value="ABOVE">ABOVE</option>
                <option value="BELOW">BELOW</option>
                <option value="BETWEEN">BETWEEN</option>
                <option value="EQUALS">EQUALS</option>
                <option value="NOT_EQUALS">NOT_EQUALS</option>
                <option value="POSITIVE">POSITIVE</option>
                <option value="NEGATIVE">NEGATIVE</option>
                <option value="ABNORMAL">ABNORMAL</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="ALWAYS">ALWAYS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Logic Operator
              </label>
              <select
                name="logicOperator"
                value={formData.logicOperator}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none bg-white cursor-pointer"
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
            </div>
          </div>

          {/* Threshold Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Threshold Low {formData.conditionType === 'BETWEEN' || formData.conditionType === 'CRITICAL' ? '*' : ''}
              </label>
              <input
                type="number"
                step="0.01"
                name="thresholdLow"
                value={formData.thresholdLow}
                onChange={handleChange}
                placeholder="e.g., 50"
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                  errors.thresholdLow
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
              {errors.thresholdLow && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.thresholdLow}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Threshold High {formData.conditionType === 'BETWEEN' || formData.conditionType === 'CRITICAL' ? '*' : ''}
              </label>
              <input
                type="number"
                step="0.01"
                name="thresholdHigh"
                value={formData.thresholdHigh}
                onChange={handleChange}
                placeholder="e.g., 200"
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                  errors.thresholdHigh
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
              {errors.thresholdHigh && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.thresholdHigh}
                </p>
              )}
            </div>
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Priority
              </label>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                placeholder="e.g., 10"
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                  errors.priority
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
              {errors.priority && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.priority}
                </p>
              )}
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
                Active Rule
              </label>
            </div>
          </div>

          {/* Auto Order and Notify Physician */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="autoOrder"
                checked={formData.autoOrder}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    autoOrder: e.target.checked,
                  }))
                }
                className="w-5 h-5 accent-emerald-600 rounded border-slate-300 cursor-pointer"
              />
              <label htmlFor="autoOrder" className="text-sm font-bold text-slate-700 cursor-pointer">
                Auto Order Reflex Test
              </label>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="notifyPhysician"
                checked={formData.notifyPhysician}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    notifyPhysician: e.target.checked,
                  }))
                }
                className="w-5 h-5 accent-emerald-600 rounded border-slate-300 cursor-pointer"
              />
              <label htmlFor="notifyPhysician" className="text-sm font-bold text-slate-700 cursor-pointer">
                Notify Physician
              </label>
            </div>
          </div>

          {/* Gender and Age Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Gender (Optional)
              </label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gender: (e.target.value as 'MALE' | 'FEMALE' | 'OTHER' | null) || null,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none bg-white cursor-pointer"
              >
                <option value="">All</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Age Min (Optional)
              </label>
              <input
                type="number"
                name="ageMin"
                value={formData.ageMin || ''}
                onChange={handleChange}
                placeholder="e.g., 18"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Age Max (Optional)
              </label>
              <input
                type="number"
                name="ageMax"
                value={formData.ageMax || ''}
                onChange={handleChange}
                placeholder="e.g., 65"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          {/* Clinical Rationale */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
              Clinical Rationale
            </label>
            <textarea
              name="clinicalRationale"
              value={formData.clinicalRationale}
              onChange={handleChange}
              placeholder="e.g., Critical values require immediate reflex testing"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 resize-none"
            />
          </div>

          {/* Technician Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
              Technician Notes
            </label>
            <textarea
              name="technicianNotes"
              value={formData.technicianNotes}
              onChange={handleChange}
              placeholder="e.g., Review results before auto-ordering"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 resize-none"
            />
          </div>
        </form>
      </div>
    </RightDrawer>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Loader,
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

// ─── API Service Imports ──────────────────────────────────────────────────────


import {
  CreateTestPackageInput,
  UpdateTestPackageInput,
  TestPackageDetail,
} from '@/app/Apis/lab/TestPackage';
import {
  fetchTests,
  Test
} from '@/app/Apis/lab/TestApis';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface AvailableTest {
  id: number;
  testId: number;
  testName: string;
  testCode: string;
  category: string;
  price?: number;
}

interface TestWithDiscount {
  testId: number;
  testName?: string;
  testCode?: string;
  category?: string;
  displayOrder?: number;
}

interface FormData {
  packageCode: string;
  packageName: string;
  description: string;
  packagePrice: number | '';
  specialInstructions: string;
  isActive: boolean;
  branchId: number;
  tests: TestWithDiscount[];
}

interface NewTestProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTestPackageInput | UpdateTestPackageInput) => Promise<void> | void;
  editData?: TestPackageDetail | null;
  isEditMode?: boolean;
}

function resolveBranchId(
  editData: TestPackageDetail | null | undefined,
  branches: Branch[],
  fallback = 1
): number {
  if (editData?.branchId && editData.branchId > 0) {
    return editData.branchId;
  }

  if (editData?.branchName && branches.length > 0) {
    const normalizedName = editData.branchName.trim().toLowerCase();
    const match = branches.find((branch) => {
      const branchName = branch.branchName.trim().toLowerCase();
      return (
        branchName === normalizedName ||
        branchName.includes(normalizedName) ||
        normalizedName.includes(branchName)
      );
    });
    if (match) {
      return match.id;
    }
  }

  if (branches.length > 0) {
    return branches[0].id;
  }

  return fallback;
}

function cloneFormData(data: FormData): FormData {
  return {
    ...data,
    tests: data.tests.map((test) => ({ ...test })),
  };
}

function testsAreEqual(
  current: TestWithDiscount[],
  original: TestWithDiscount[]
): boolean {
  if (current.length !== original.length) return false;

  return current.every(
    (test, index) => Number(test.testId) === Number(original[index]?.testId)
  );
}

function buildUpdatedFields(
  current: FormData,
  original: FormData
): UpdateTestPackageInput {
  const updates: UpdateTestPackageInput = {
    packageName: current.packageName.trim(),
  };

  const currentDescription = current.description.trim();
  const originalDescription = original.description.trim();
  if (currentDescription !== originalDescription) {
    updates.description = currentDescription;
  }

  const currentPrice = Number(current.packagePrice);
  const originalPrice = Number(original.packagePrice);
  if (currentPrice !== originalPrice) {
    updates.packagePrice = currentPrice;
  }

  const currentInstructions = current.specialInstructions.trim();
  const originalInstructions = original.specialInstructions.trim();
  if (currentInstructions !== originalInstructions) {
    updates.specialInstructions = currentInstructions;
  }

  if (current.isActive !== original.isActive) {
    updates.isActive = current.isActive;
  }

  if (current.branchId !== original.branchId) {
    updates.branchId = current.branchId;
  }

  if (!testsAreEqual(current.tests, original.tests)) {
    updates.tests = current.tests
      .map((test, index) => ({
        testId: Number(test.testId),
        displayOrder: index + 1,
      }))
      .filter((test) => Number.isFinite(test.testId) && test.testId > 0);
  }

  return updates;
}

function hasNonNameChanges(
  current: FormData,
  original: FormData
): boolean {
  if (current.description.trim() !== original.description.trim()) return true;
  if (Number(current.packagePrice) !== Number(original.packagePrice)) return true;
  if (current.specialInstructions.trim() !== original.specialInstructions.trim()) return true;
  if (current.isActive !== original.isActive) return true;
  if (current.branchId !== original.branchId) return true;
  if (!testsAreEqual(current.tests, original.tests)) return true;
  return false;
}

// ─── NewTest Component ────────────────────────────────────────────────────────

export default function NewTest({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
  isEditMode = false,
}: NewTestProps) {
  // ─── State Management ───────────────────────────────────────────────────

  const [formData, setFormData] = useState<FormData>(() => {
    if (editData) {
      return {
        packageCode: editData.packageCode || '',
        packageName: editData.packageName || '',
        description: editData.description || '',
        packagePrice:
          editData.packagePrice !== undefined && editData.packagePrice !== null
            ? editData.packagePrice
            : '',
        specialInstructions: editData.specialInstructions || '',
        isActive: editData.isActive !== undefined ? editData.isActive : true,
        branchId: editData.branchId && editData.branchId > 0 ? editData.branchId : 1,
        tests: editData.tests?.map((t, index) => ({
          testId: t.testId,
          testName: t.testName,
          testCode: t.testCode,
          category: t.category,
          displayOrder: index + 1,
        })) || [],
      };
    }

    return {
      packageCode: '',
      packageName: '',
      description: '',
      packagePrice: '',
      specialInstructions: '',
      isActive: true,
      branchId: 1,
      tests: [],
    };
  });

  const [showTestModal, setShowTestModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiTests, setApiTests] = useState<AvailableTest[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('1');
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);

  // ─── Effects ───────────────────────────────────────────────────────────

  // Load branches on component mount
  useEffect(() => {
    const loadBranches = async () => {
      setLoadingBranches(true);
      try {
        const response = await branchApi.getAllBranches({
          pageNo: 0,
          pageSize: 100,
        });
        console.log('Loaded branches for test package:', response.data.content);
        setBranches(response.data.content);
      } catch (error) {
        console.error('Failed to load branches:', error);
      } finally {
        setLoadingBranches(false);
      }
    };

    loadBranches();
  }, []);

  // Fetch tests from API when component opens
  useEffect(() => {
    const loadTests = async () => {
      if (isOpen && apiTests.length === 0) {
        setIsLoadingTests(true);
        try {
          const response = await fetchTests(0, 1000);
          const mappedTests: AvailableTest[] = response.data.content.map((test: Test) => ({
            id: test.id,
            testId: test.id,
            testName: test.testName,
            testCode: test.testCode,
            category: test.departmentId?.toString() || 'General',
            price: test.price,
          }));
          setApiTests(mappedTests);
        } catch (error) {
          console.error('Error loading tests from API:', error);
        } finally {
          setIsLoadingTests(false);
        }
      }
    };

    loadTests();
  }, [isOpen, apiTests.length]);

  // Update form when editData changes
  useEffect(() => {
    if (isOpen && editData) {
      const mappedTests = editData.tests?.map((t, index) => ({
        testId: t.testId,
        testName: t.testName,
        testCode: t.testCode,
        category: t.category,
        displayOrder: index + 1,
      })) || [];
      const branchId = resolveBranchId(editData, branches);

      setSelectedBranchId(branchId.toString());
      const nextFormData: FormData = {
        packageCode: editData.packageCode || '',
        packageName: editData.packageName || '',
        description: editData.description || '',
        packagePrice:
          editData.packagePrice !== undefined && editData.packagePrice !== null
            ? editData.packagePrice
            : '',
        specialInstructions: editData.specialInstructions || '',
        isActive: editData.isActive !== undefined ? editData.isActive : true,
        branchId,
        tests: mappedTests,
      };
      setFormData(nextFormData);
      setOriginalFormData(cloneFormData(nextFormData));
    } else if (isOpen && !editData && !isEditMode) {
      setSelectedBranchId('1');
      setOriginalFormData(null);
      setFormData({
        packageCode: '',
        packageName: '',
        description: '',
        packagePrice: '',
        specialInstructions: '',
        isActive: true,
        branchId: branches[0]?.id ?? 1,
        tests: [],
      });
    }
  }, [isOpen, editData, isEditMode, branches]);

  // ─── Event Handlers ────────────────────────────────────────────────────

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'packagePrice'
            ? value === ''
              ? ''
              : Number(value)
            : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.packageCode.trim()) {
      newErrors.packageCode = 'Package Code is required';
    } else if (formData.packageCode.length > 20) {
      newErrors.packageCode = 'Package Code must be 20 characters or less';
    }

    if (!formData.packageName.trim()) {
      newErrors.packageName = 'Package Name is required';
    } else if (formData.packageName.length > 100) {
      newErrors.packageName = 'Package Name must be 100 characters or less';
    }

    if (formData.packagePrice === '' || Number(formData.packagePrice) <= 0) {
      newErrors.packagePrice = 'Valid price (greater than 0) is required';
    }

    if (formData.tests.length === 0) {
      newErrors.tests = 'At least one test must be added';
    }

    if (!formData.branchId || formData.branchId <= 0) {
      newErrors.branchId = 'Branch is required';
    }

    // Check for duplicate tests
    const testIds = new Set<number>();
    formData.tests.forEach((test, index) => {
      if (testIds.has(test.testId)) {
        newErrors[`test_${index}`] = 'This test is already included';
      }
      testIds.add(test.testId);
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTest = (test: AvailableTest) => {
    if (!formData.tests.find(t => t.testId === test.testId)) {
      setFormData(prev => ({
        ...prev,
        tests: [
          ...prev.tests,
          {
            testId: test.testId,
            testName: test.testName,
            testCode: test.testCode,
            category: test.category,
            displayOrder: prev.tests.length + 1,
          },
        ],
      }));
    }
  };

  const handleRemoveTest = (testId: number) => {
    setFormData(prev => ({
      ...prev,
      tests: prev.tests.filter(t => t.testId !== testId),
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && editData && originalFormData) {
        const branchId =
          formData.branchId > 0
            ? formData.branchId
            : resolveBranchId(editData, branches);

        const currentFormData: FormData = {
          ...formData,
          branchId,
        };

        const updatedFields = buildUpdatedFields(currentFormData, originalFormData);
        const nameChanged =
          currentFormData.packageName.trim() !== originalFormData.packageName.trim();

        if (!nameChanged && !hasNonNameChanges(currentFormData, originalFormData)) {
          setErrors((prev) => ({
            ...prev,
            submit: 'No changes to save',
          }));
          return;
        }

        if (updatedFields.tests && updatedFields.tests.length === 0) {
          setErrors((prev) => ({
            ...prev,
            tests: 'At least one valid test must be included',
          }));
          return;
        }

        await onSubmit(updatedFields);
      } else {
        const branchId =
          formData.branchId > 0
            ? formData.branchId
            : resolveBranchId(editData, branches);

        const apiData: CreateTestPackageInput = {
          packageCode: formData.packageCode.trim(),
          packageName: formData.packageName.trim(),
          description: formData.description.trim() || undefined,
          packagePrice: Number(formData.packagePrice),
          specialInstructions: formData.specialInstructions.trim() || undefined,
          isActive: formData.isActive,
          branchId,
          tests: formData.tests
            .map((t, index) => ({
              testId: Number(t.testId),
              displayOrder: index + 1,
            }))
            .filter((t) => Number.isFinite(t.testId) && t.testId > 0),
        };

        if (apiData.tests.length === 0) {
          setErrors((prev) => ({
            ...prev,
            tests: 'At least one valid test must be included',
          }));
          return;
        }

        await onSubmit(apiData);
      }

      handleClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save package';
      setErrors((prev) => ({ ...prev, submit: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      packageCode: '',
      packageName: '',
      description: '',
      packagePrice: '',
      specialInstructions: '',
      isActive: true,
      branchId: 1,
      tests: [],
    });
    setErrors({});
    setShowTestModal(false);
    setOriginalFormData(null);
    onClose();
  };

  if (!isOpen) return null;

  const footer = (
    <div className="flex gap-3 justify-end w-full">
      <Button
        variant="outline"
        onClick={handleClose}
        disabled={isSubmitting}
        className="px-6 py-2 rounded-lg font-bold transition-all text-sm border-slate-300 text-slate-700 disabled:opacity-50"
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-600 hover:to-teal-600 transition-all text-sm shadow-md disabled:opacity-50 flex items-center gap-2"
      >
        {isSubmitting && <Loader size={14} className="animate-spin" />}
        {isEditMode ? 'Update' : 'Create'} Package
      </Button>
    </div>
  );

  return (
    <>
      <RightDrawer
        isOpen={isOpen}
        onClose={handleClose}
        title={
          <>
            {isEditMode ? 'Edit Test' : 'Create Test'}{' '}
            <span className="text-emerald-200">Package</span>
          </>
        }
        description={
          isEditMode
            ? 'Update diagnostic test package details'
            : 'Add a new diagnostic test package'
        }
        footer={footer}
        maxWidth="xl"
      >
        <div className="space-y-6">
          {errors.submit && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-rose-700">{errors.submit}</p>
            </div>
          )}
          {/* Package Code and Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Package Code *
              </Label>
              <Input
                type="text"
                name="packageCode"
                placeholder={isEditMode ? 'Existing package code' : 'PKG001'}
                value={formData.packageCode}
                onChange={handleInputChange}
                disabled={isEditMode}
                maxLength={20}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 disabled:bg-slate-100 disabled:text-slate-500 ${
                  errors.packageCode
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
              {errors.packageCode && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.packageCode}
                </p>
              )}
            </div>
            <div>
            <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
              Package Name *
            </Label>
            <Input
              type="text"
              name="packageName"
              placeholder={isEditMode ? 'Existing package name' : 'Basic Health Checkup'}
              value={formData.packageName}
              onChange={handleInputChange}
              maxLength={100}
              className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                errors.packageName
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
              }`}
            />
            {errors.packageName && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.packageName}
              </p>
            )}
          </div>
          </div>

          
          <div>
              <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Branch *
              </Label>
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
              {errors.branchId && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.branchId}
                </p>
              )}
            </div>

          {/* Description */}
          <div>
            <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
              Description
            </Label>
            <textarea
              name="description"
              placeholder="Enter package description..."
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 resize-none shadow-sm"
            />
          </div>

          {/* Price and Active Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Price (₹) *
              </Label>
              <Input
                type="number"
                name="packagePrice"
                placeholder={isEditMode ? 'Existing price' : '2500'}
                value={formData.packagePrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                  errors.packagePrice
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
              {errors.packagePrice && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.packagePrice}
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
                  aria-label="Mark package as active"
                />
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Active Package
                </span>
              </label>
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
              Special Instructions
            </Label>
            <textarea
              name="specialInstructions"
              placeholder="e.g., Fasting required for 12 hours, avoid alcohol 24 hours before..."
              value={formData.specialInstructions}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 resize-none shadow-sm"
            />
          </div>

          {/* Tests Section */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FlaskConical size={16} className="text-emerald-600" />
                Included Tests *
              </h3>
              <Button
                variant="outline"
                onClick={() => setShowTestModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all font-bold text-sm border border-emerald-200"
              >
                <Plus size={16} /> Add Tests
              </Button>
            </div>

            {formData.tests.length > 0 ? (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                {formData.tests.map((test, index) => (
                  <div
                    key={test.testId}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-100 hover:border-slate-200 transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <Activity size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">{test.testName}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          {test.testCode} • {test.category}
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      onClick={() => handleRemoveTest(test.testId)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 w-8 h-8 p-0 shrink-0"
                      aria-label={`Remove ${test.testName}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                <Database size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-500">No tests added yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click "Add Tests" to include tests in this package
                </p>
              </div>
            )}

            {errors.tests && (
              <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.tests}
              </p>
            )}
          </div>
        </div>
      </RightDrawer>

      {/* Test Selection Modal */}
      {showTestModal && (
        <TestSelectionModal
          isOpen={showTestModal}
          onClose={() => setShowTestModal(false)}
          onAdd={handleAddTest}
          selectedTestIds={formData.tests.map(t => t.testId)}
          availableTests={apiTests}
          isLoading={isLoadingTests}
        />
      )}
    </>
  );
}

// ─── Test Selection Modal Component ──────────────────────────────────────────

interface TestSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (test: AvailableTest) => void;
  selectedTestIds: number[];
  availableTests: AvailableTest[];
  isLoading?: boolean;
}

function TestSelectionModal({
  isOpen,
  onClose,
  onAdd,
  selectedTestIds,
  availableTests,
  isLoading = false,
}: TestSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleCategoryChange = (value: string | null) => {
    setSelectedCategory(value ?? 'All');
  };

  const categories = ['All', ...new Set(availableTests.map(t => t.category))];

  const filteredTests = availableTests.filter(test => {
    const matchesSearch =
      test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.testCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const footer = (
    <div className="flex justify-end w-full">
      <Button
        variant="outline"
        onClick={onClose}
        className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold transition-all text-sm w-full sm:w-auto"
      >
        Done
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Select Tests"
      description="Add diagnostic tests to the package"
      footer={footer}
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <Input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 h-[42px] rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              aria-label="Search tests by name or code"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              <Search size={16} />
            </span>
          </div>

          {/* Category Select */}
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger
              className="w-full sm:w-[180px] px-4 py-2.5 h-[42px] rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              aria-label="Filter by category"
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>

            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tests List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <Loader size={32} className="mx-auto text-slate-300 mb-2 animate-spin" />
              <p className="text-sm font-bold text-slate-500">Loading tests...</p>
              <p className="text-xs text-slate-400 mt-1">
                Please wait while we fetch the test list
              </p>
            </div>
          ) : filteredTests.length > 0 ? (
            filteredTests.map(test => {
              const isSelected = selectedTestIds.includes(test.testId);
              return (
                <button
                  key={test.testId}
                  onClick={() => !isSelected && onAdd(test)}
                  disabled={isSelected}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all group ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                      : 'bg-white border-slate-100 hover:border-emerald-300 hover:bg-slate-50 hover:shadow-sm'
                  } ${isSelected ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                        {test.testName}
                      </div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {test.testCode} • {test.category}
                      </div>
                      {test.price && (
                        <div className="text-xs text-emerald-600 font-bold mt-1">
                          ₹{test.price.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-slate-300 group-hover:border-emerald-400'
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && (
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <p className="text-sm font-bold text-slate-500">No tests found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search or category filter
              </p>
            </div>
          )}
        </div>
      </div>
    </RightDrawer>
  );
}




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
  id: number;
  testName: string;
  testCode: string;
  category: string;
}

interface FormData {
  packageCode: string;
  packageName: string;
  description: string;
  price: number | '';
  isActive: boolean;
  tests: TestItem[];
}

interface TestPackage {
  id: number;
  packageCode: string;
  packageName: string;
  description: string;
  price: number;
  isActive: boolean;
  tests: TestItem[];
  createdAt: string;
}

const AVAILABLE_TESTS = [
  { id: 1, testName: 'Complete Blood Count', testCode: 'CBC', category: 'Hematology' },
  { id: 2, testName: 'Lipid Profile', testCode: 'LP', category: 'Biochemistry' },
  { id: 3, testName: 'Liver Function Test', testCode: 'LFT', category: 'Biochemistry' },
  { id: 4, testName: 'Troponin T', testCode: 'TNT', category: 'Cardiology' },
  { id: 5, testName: 'NT-proBNP', testCode: 'NTBNP', category: 'Cardiology' },
  { id: 6, testName: 'Homocysteine', testCode: 'HCY', category: 'Biochemistry' },
  { id: 7, testName: 'HbA1c', testCode: 'HBA1C', category: 'Biochemistry' },
  { id: 8, testName: 'Fasting Insulin', testCode: 'FINS', category: 'Endocrinology' },
  { id: 9, testName: 'Microalbuminuria', testCode: 'MAU', category: 'Urinalysis' },
  { id: 10, testName: 'T3 Total', testCode: 'T3', category: 'Endocrinology' },
  { id: 11, testName: 'T4 Total', testCode: 'T4', category: 'Endocrinology' },
  { id: 12, testName: 'TSH', testCode: 'TSH', category: 'Endocrinology' },
  { id: 13, testName: 'Anti-TPO', testCode: 'ATPO', category: 'Immunology' },
];

interface NewTestProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  editData?: TestPackage | null;
  isEditMode?: boolean;
}

export default function NewTest({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
  isEditMode = false
}: NewTestProps) {
  const [formData, setFormData] = useState<FormData>({
    packageCode: editData?.packageCode || '',
    packageName: editData?.packageName || '',
    description: editData?.description || '',
    price: editData?.price || '',
    isActive: editData?.isActive || true,
    tests: editData?.tests || [],
  });

  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTests, setSelectedTests] = useState<TestItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'price' ? (value === '' ? '' : Number(value)) : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.packageCode.trim()) newErrors.packageCode = 'Package Code is required';
    if (!formData.packageName.trim()) newErrors.packageName = 'Package Name is required';
    if (formData.price === '' || Number(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (formData.tests.length === 0) newErrors.tests = 'At least one test must be added';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTests = (test: TestItem) => {
    if (!formData.tests.find(t => t.id === test.id)) {
      setFormData(prev => ({
        ...prev,
        tests: [...prev.tests, test],
      }));
    }
  };

  const handleRemoveTest = (testId: number) => {
    setFormData(prev => ({
      ...prev,
      tests: prev.tests.filter(t => t.id !== testId),
    }));
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      packageCode: '',
      packageName: '',
      description: '',
      price: '',
      isActive: true,
      tests: [],
    });
    setErrors({});
    setShowTestModal(false);
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
        description={isEditMode ? 'Update diagnostic test package details' : 'Add a new diagnostic test package'}
        footer={footer}
        maxWidth="xl"
      >
        <div className="space-y-6">
          {/* Package Code and Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Package Code *
              </Label>
              <Input
                type="text"
                name="packageCode"
                placeholder="PKG001"
                value={formData.packageCode}
                onChange={handleInputChange}
                disabled={isEditMode}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 disabled:bg-slate-100 disabled:text-slate-500 ${errors.packageCode
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
                placeholder="Basic Health Checkup"
                value={formData.packageName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${errors.packageName
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
                name="price"
                placeholder="2500"
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
                  Active Package
                </span>
              </label>
            </div>
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
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
                {formData.tests.map(test => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 hover:border-slate-200 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                        <Activity size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{test.testName}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          {test.testCode} • {test.category}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => handleRemoveTest(test.id)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 w-8 h-8 p-0 shrink-0"
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
                <p className="text-xs text-slate-400 mt-1">Click "Add Tests" to include tests in this package</p>
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
          onAdd={handleAddTests}
          selectedTestIds={formData.tests.map(t => t.id)}
        />
      )}
    </>
  );
}

interface TestSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (test: TestItem) => void;
  selectedTestIds: number[];
}

function TestSelectionModal({
  isOpen,
  onClose,
  onAdd,
  selectedTestIds,
}: TestSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(AVAILABLE_TESTS.map(t => t.category))];

  const filteredTests = AVAILABLE_TESTS.filter(test => {
    const matchesSearch = test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

          {/* SEARCH INPUT */}
          <div className="relative w-full sm:flex-1">
            <Input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 h-[42px] rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />

            {/* ICON */}
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              <Search size={16} />
            </span>
          </div>

          {/* CATEGORY SELECT */}
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              if (value !== null) setSelectedCategory(value);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] px-4 py-2.5 h-[42px] rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              <SelectValue placeholder="Category" />
            </SelectTrigger>

            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={String(cat)}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>

        {/* Tests List */}
        <div className="space-y-3">
          {filteredTests.length > 0 ? (
            filteredTests.map(test => {
              const isSelected = selectedTestIds.includes(test.id);
              return (
                <button
                  key={test.id}
                  onClick={() => onAdd(test)}
                  disabled={isSelected}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all group ${isSelected
                    ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                    : 'bg-white border-slate-100 hover:border-blue-300 hover:bg-slate-50 hover:shadow-sm'
                    } ${isSelected ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{test.testName}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {test.testCode} • {test.category}
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-all ${isSelected
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-300 group-hover:border-blue-400'
                        }`}
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
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </div>
    </RightDrawer>
  );
}
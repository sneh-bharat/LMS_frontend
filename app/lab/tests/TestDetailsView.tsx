'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Edit2,
  Trash2,
  Calendar,
  Package,
  Hash,
  FileText,
  Beaker,
  Droplet,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  Share2,
  ListChecks,
  Loader2,
  AlertCircle,
} from 'lucide-react'; 
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import type { Test } from '@/app/Apis/lab/TestApis';
import {
  fetchTestParameters,
  fetchSampleRequirements,
  normalizeParameterForForm,
  unwrapParametersList,
} from '@/app/Apis/lab/TestApis';
import { branchApi } from '@/app/Apis/branch/branchApi';

interface TestDetailsViewProps {
  isOpen: boolean;
  onClose: () => void;
  testData: Test | null;
  onEdit?: (test: Test) => void;
  onDelete?: (testId: number) => void;
  onEditSample?: (test: Test) => void;
  onEditParameters?: (test: Test) => void;
  refreshKey?: number;
}

export default function TestDetailsView({
  isOpen,
  onClose,
  testData,
  onEdit,
  onDelete,
  onEditSample,
  onEditParameters,
  refreshKey = 0,
}: TestDetailsViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [parameters, setParameters] = useState<any[]>([]);
  const [sampleRequirements, setSampleRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string | null>(null);

  // Fetch test details when component opens
  useEffect(() => {
    if (isOpen && testData?.id) {
      fetchTestDetails();
      fetchBranchName();
    }
  }, [isOpen, testData?.id, refreshKey]);

  const fetchBranchName = async () => {
    if (!testData?.branchId) return;

    try {
      const response = await branchApi.getBranchById(testData.branchId);
      setBranchName(response.data.branchName);
    } catch (err: any) {
      console.error('❌ Error fetching branch name:', err);
      setBranchName(null);
    }
  };

  const fetchTestDetails = async () => {
    if (!testData?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching test details for test ID:', testData.id);

      // Fetch all data in parallel, but handle errors individually
      const promises = [
        fetchTestParameters(testData.id).catch((err: any) => {
          console.error('❌ Failed to fetch parameters:', err);
          return { data: [], message: 'Failed to fetch parameters', response: false, status: 'error', timestamp: new Date().toISOString() };
        }),
        fetchSampleRequirements(testData.id).catch((err: any) => {
          console.error('❌ Failed to fetch samples:', err);
          return { data: [], message: 'Failed to fetch samples', response: false, status: 'error', timestamp: new Date().toISOString() };
        }),
      ];

      const [parametersRes, samplesRes] = await Promise.all(promises);

      // Handle responses
      const parametersData = unwrapParametersList((parametersRes as any)?.data).map(
        normalizeParameterForForm
      );
      const samplesData = (samplesRes as any)?.data || [];

      setParameters(parametersData);
      setSampleRequirements(Array.isArray(samplesData) ? samplesData : []);


    } catch (err: any) {
      console.error('❌ Error fetching test details:', err);
      setError(err.message || 'Failed to fetch test details');
    } finally {
      setLoading(false);
    }
  };

  if (!testData) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(testData.testCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(testData.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(testData);
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Pre-calculate values to avoid hydration mismatch
  const formattedDate = formatDate(testData.createdAt);
  const formattedPrice = testData.price ? testData.price.toLocaleString('en-IN') : '0';

  const footer = (
    <div className="flex gap-3 justify-end w-full flex-wrap">
      <Button
        variant="outline"
        onClick={onClose}
        className="px-6 py-2 rounded-lg font-bold transition-all text-sm border-slate-300 text-slate-700"
        suppressHydrationWarning
      >
        Close
      </Button>
      {onEditSample && (
        <Button
          onClick={() => onEditSample(testData)}
          className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all text-sm gap-2 flex items-center"
          suppressHydrationWarning
        >
          <Beaker size={16} /> Edit Sample
        </Button>
      )}
      {onEditParameters && (
        <Button
          onClick={() => onEditParameters(testData)}
          className="px-6 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold transition-all text-sm gap-2 flex items-center"
          suppressHydrationWarning
        >
          <ListChecks size={16} /> Edit Parameters
        </Button>
      )}
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Test <span className="text-emerald-200">Details</span>
        </>
      }
      description="View complete test package information"
      footer={footer}
      maxWidth="xl"
    >
      <div className="space-y-8 pb-4">
        {/* ═══ HEADER SECTION ════════════════════════════════════════ */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Package size={32} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-1 line-clamp-2">
                  {testData.testName}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="primary" className="px-3 py-1 text-xs font-bold">
                    {testData.categoryName || 'N/A'}
                  </Badge>
                  <Badge variant="info" className="px-3 py-1 text-xs font-bold">
                    {testData.departmentName || 'N/A'}
                  </Badge>
                  <Badge variant="warning" className="px-3 py-1 text-xs font-bold">
                    {branchName || 'N/A'}
                  </Badge>
                  <Badge
                    variant={testData.isActive ? 'success' : 'secondary'}
                    className="text-xs font-bold"
                  >
                    {testData.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
            {showDeleteConfirm && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 shadow-2xl">
                  <p className="text-slate-700 font-semibold mb-4">
                    Delete this test package?
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-sm"
                      suppressHydrationWarning
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm"
                      suppressHydrationWarning
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ KEY INFORMATION GRID ═════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Test Code */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Hash size={16} className="text-emerald-600" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Test Code
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <code className="text-lg font-bold text-slate-900 font-mono">
                {testData.testCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-emerald-600"
                title="Copy code"
                suppressHydrationWarning
              >
                <Copy size={16} />
              </button>
            </div>
            {copied && (
              <p className="text-xs text-emerald-600 mt-1 font-semibold">Copied!</p>
            )}
          </div>

          {/* Sample Type */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Droplet size={16} className="text-emerald-600" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Sample Type
              </span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {testData.sampleRequirements?.[0]?.sampleType || 'N/A'}
            </p>
          </div>

          {/* Price */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Price
              </span>
            </div>
            <p className="text-lg font-bold text-slate-900 font-mono" suppressHydrationWarning>
              ₹{formattedPrice}
            </p>
          </div>

          {/* Created Date */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-emerald-600" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Created
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900" suppressHydrationWarning>
              {formattedDate}
            </p>
          </div>
        </div>



        {/* ═══ PARAMETERS SECTION ═════════════════════════════════ */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Beaker size={18} className="text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Test Parameters
              </h3>
            </div>
            <Badge variant="primary" className="px-3 py-1 text-xs font-bold">
              {parameters.length} parameter{parameters.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-emerald-600" />
              <span className="ml-3 text-slate-600">Loading parameters...</span>
            </div>
          ) : parameters.length === 0 ? (
            <div className="text-center py-8">
              <Beaker size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">No parameters available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200">
                  <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Parameter</th>
                    <th className="pb-3 pr-4">Unit</th>
                    <th className="pb-3 pr-4">Critical Low</th>
                    <th className="pb-3 pr-4">Critical High</th>
                    <th className="pb-3">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parameters.map((param: any, index: number) => (
                    <tr key={param.id || index} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-slate-900">
                        {param.parameterName}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{param.unit}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary" className="text-xs font-bold">
                          {param.criticalLow}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary" className="text-xs font-bold">
                          {param.criticalHigh}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={param.isCalculated ? 'primary' : 'success'}
                          className="text-xs font-bold"
                        >
                          {param.isCalculated ? 'Calculated' : 'Direct'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ═══ SAMPLE REQUIREMENTS SECTION ════════════════════════ */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplet size={18} className="text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Sample Requirements
              </h3>
            </div>
            <Badge variant="primary" className="px-3 py-1 text-xs font-bold">
              {sampleRequirements.length} sample{sampleRequirements.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-emerald-600" />
              <span className="ml-3 text-slate-600">Loading samples...</span>
            </div>
          ) : sampleRequirements.length === 0 ? (
            <div className="text-center py-8">
              <Droplet size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">No sample requirements available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleRequirements.map((sample: any, index: number) => (
                <div
                  key={sample.id || index}
                  className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white">
                      <Droplet size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{sample.sampleType}</h4>
                      <p className="text-xs text-slate-500">
                        Volume: {sample.volumeMl} ml
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Container</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-slate-300"
                          style={{ backgroundColor: sample.containerColor }}
                        />
                        <span className="font-semibold text-slate-900">
                          {sample.containerColor}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Storage</span>
                      <span className="font-semibold text-slate-900">
                        {sample.storageCondition}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══ DESCRIPTION SECTION ══════════════════════════════════ */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
              Description
            </h3>
          </div>
          <p className="text-slate-700 leading-relaxed text-sm">
            {testData.description || (
              <span className="text-slate-400 italic">No description provided</span>
            )}
          </p>
        </div>

        {/* ═══ METADATA SECTION ═════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Status Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Availability</span>
                <div className="flex items-center gap-2">
                  {testData.isActive ? (
                    <>
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-600">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={18} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-400">Inactive</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Classification
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Department</span>
                <Badge variant="primary" className="px-2.5 py-1 text-[10px] font-bold">
                  {testData.departmentName || 'N/A'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Branch</span>
                <Badge variant="warning" className="px-2.5 py-1 text-[10px] font-bold">
                  {branchName || 'N/A'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Category</span>
                <Badge variant="primary" className="px-2.5 py-1 text-[10px] font-bold">
                  {testData.categoryName || 'N/A'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RightDrawer>
  );
}
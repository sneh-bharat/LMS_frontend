'use client';

import { useState } from 'react';
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
  DollarSign,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  Share2,
  ListChecks,
  IndianRupee,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import type { Test } from '@/app/Apis/lab/TestApis';

interface TestDetailsViewProps {
  isOpen: boolean;
  onClose: () => void;
  testData: Test | null;
  onEdit?: (test: Test) => void;
  onDelete?: (testId: number) => void;
  onEditSample?: (test: Test) => void;
  onEditParameters?: (test: Test) => void;
  onEditPricing?: (test: Test) => void;
}

export default function TestDetailsView({
  isOpen,
  onClose,
  testData,
  onEdit,
  onDelete,
  onEditSample,
  onEditParameters,
  onEditPricing,
}: TestDetailsViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

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
  const formattedPrice = testData.version?.price ? testData.version.price.toLocaleString('en-IN') : '0';

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
      {onEditPricing && (
        <Button
          onClick={() => onEditPricing(testData)}
          className="px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all text-sm gap-2 flex items-center"
          suppressHydrationWarning
        >
          <IndianRupee size={16} /> Edit Pricing
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
                    {testData.categoryId ? `Category ${testData.categoryId}` : 'N/A'}
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
              <DollarSign size={16} className="text-emerald-600" />
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

          {/* Category Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Classification
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Department</span>
                <Badge variant="primary" className="px-2.5 py-1 text-[10px] font-bold">
                  {testData.departmentId ? `Dept ${testData.departmentId}` : 'N/A'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Category</span>
                <Badge variant="primary" className="px-2.5 py-1 text-[10px] font-bold">
                  {testData.categoryId ? `Cat ${testData.categoryId}` : 'N/A'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RightDrawer>
  );
}
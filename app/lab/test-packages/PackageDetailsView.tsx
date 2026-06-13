'use client';

import { useState } from 'react';
import {
  Edit2,
  Package,
  Hash,
  FileText,
  Beaker,
  CheckCircle2,
  XCircle,
  Copy,
  ListChecks,
  IndianRupee,
  Tag,
  Clock,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import type { TestPackageDetail } from '@/app/Apis/lab/TestPackage';

interface PackageDetailsViewProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: TestPackageDetail | null;
  onEdit?: (pkg: TestPackageDetail) => void;
  onDelete?: (packageId: number) => void;
  onManageTests?: (pkg: TestPackageDetail) => void;
  onEditPricing?: (pkg: TestPackageDetail) => void;
}

export default function PackageDetailsView({
  isOpen,
  onClose,
  packageData,
  onEdit,
  onDelete,
  onManageTests,
  onEditPricing,
}: PackageDetailsViewProps) {
  const [copied, setCopied] = useState(false);

  if (!packageData) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(packageData.packageCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(packageData);
      onClose();
    }
  };

  const formattedPrice = packageData.packagePrice.toLocaleString('en-IN');
  const testCount = packageData.tests?.length || 0;
 

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
      {onEdit && (
        <Button
          onClick={handleEdit}
          className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all text-sm gap-2 flex items-center"
          suppressHydrationWarning
        >
          <Edit2 size={16} /> Edit Package
        </Button>
      )}
      {onManageTests && (
        <Button
          onClick={() => onManageTests(packageData)}
          className="px-6 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold transition-all text-sm gap-2 flex items-center"
          suppressHydrationWarning
        >
          <ListChecks size={16} /> Manage Tests
        </Button>
      )}
      {onEditPricing && (
        <Button
          onClick={() => onEditPricing(packageData)}
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
          Package <span className="text-emerald-200">Details</span>
        </>
      }
      description="View complete test package information"
      footer={footer}
      maxWidth="xl"
    >
      <div className="space-y-8 pb-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF671F] to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Package size={32} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-1 line-clamp-2">
                  {packageData.packageName}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="primary" className="px-3 py-1 text-xs font-bold">
                    {testCount} Tests Included
                  </Badge>
                  <Badge
                    variant={packageData.isActive ? 'success' : 'secondary'}
                    className="text-xs font-bold"
                  >
                    {packageData.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-[#FF671F] transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Hash size={16} className="text-[#FF671F]" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Package Code
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <code className="text-lg font-bold text-slate-900 font-mono">
                {packageData.packageCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-[#FF671F]"
                title="Copy code"
                suppressHydrationWarning
              >
                <Copy size={16} />
              </button>
            </div>
            {copied && (
              <p className="text-xs text-[#FF671F] mt-1 font-semibold">Copied!</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-[#FF671F] transition-all">
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee size={16} className="text-[#FF671F]" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Package Price
              </span>
            </div>
            <p className="text-lg font-bold text-slate-900 font-mono" suppressHydrationWarning>
              ₹{formattedPrice}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-[#FF671F] transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Beaker size={16} className="text-[#FF671F]" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Total Tests
              </span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {testCount} Tests
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-[#FF671F] transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={16} className="text-[#FF671F]" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Branch Name
              </span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {packageData.branchName}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-[#FF671F]" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
              Description
            </h3>
          </div>
          <p className="text-slate-700 leading-relaxed text-sm">
            {packageData.description || (
              <span className="text-slate-400 italic">No description provided</span>
            )}
          </p>
        </div>

        {packageData.specialInstructions && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-amber-600" />
              <h3 className="text-sm font-bold text-amber-700 uppercase tracking-widest">
                Special Instructions
              </h3>
            </div>
            <p className="text-amber-800 leading-relaxed text-sm">
              {packageData.specialInstructions}
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListChecks size={18} className="text-[#FF671F]" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Tests Included
              </h3>
            </div>
            <Badge variant="primary" className="px-3 py-1 text-xs font-bold">
              {testCount} Tests
            </Badge>
          </div>

          {packageData.tests && packageData.tests.length > 0 ? (
            <div className="space-y-3">
              {packageData.tests.map((test, index) => (
                <div
                  key={test.testId}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-[#FF671F] transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-[#FF671F] bg-opacity-10 rounded-lg flex items-center justify-center text-[#FF671F] font-bold text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">{test.testName}</p>
                      <p className="text-xs text-slate-500 font-mono">{test.testCode}</p>
                    </div>

                  </div>
                  
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Beaker className="text-slate-300 mx-auto mb-3" size={32} />
              <p className="text-slate-500 font-medium">No tests included in this package</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Status Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Availability</span>
                <div className="flex items-center gap-2">
                  {packageData.isActive ? (
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

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Package Info
            </h3>
            <div className="space-y-3">

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Total Tests</span>
                <span className="text-sm font-bold text-slate-900">
                  {testCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RightDrawer>
  );
}
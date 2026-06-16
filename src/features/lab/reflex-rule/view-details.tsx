'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Zap,
  GitBranch,
  AlertCircle,
  CheckCircle,
  Copy,
  Calendar,
  User,
  Clock,
  FileText,
  Activity,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import type { ReflexRule } from '@/features/lab/services/lab.service';

interface ReflexRuleDetailsViewProps {
  isOpen: boolean;
  onClose: () => void;
  ruleData: ReflexRule | null;
}

export default function ReflexRuleDetailsView({
  isOpen,
  onClose,
  ruleData,
}: ReflexRuleDetailsViewProps) {

  const [copied, setCopied] = useState(false);

  // Pre-calculate values to avoid hydration mismatch
  const formattedCreatedAt = ruleData?.createdAt
    ? new Date(ruleData.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  const formattedUpdatedAt = ruleData?.updatedAt
    ? new Date(ruleData.updatedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never';

  if (!ruleData) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ruleData.testCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };



  // Helper function to get condition badge variant
  const getConditionBadgeVariant = (conditionType: string) => {
    switch (conditionType) {
      case 'CRITICAL':
        return 'destructive';
      case 'ABOVE':
      case 'BELOW':
      case 'EQUALS':
      case 'NOT_EQUALS':
        return 'warning';
      case 'BETWEEN':
        return 'primary';
      case 'POSITIVE':
      case 'NEGATIVE':
        return 'success';
      case 'ABNORMAL':
        return 'destructive';
      case 'ALWAYS':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Helper function to format threshold display
  const formatThreshold = (rule: ReflexRule) => {
    if (rule.conditionType === 'BETWEEN') {
      return `${rule.thresholdLow} - ${rule.thresholdHigh}`;
    }
    if (rule.conditionType === 'CRITICAL') {
      return `< ${rule.thresholdLow} or > ${rule.thresholdHigh}`;
    }
    if (rule.conditionType === 'ABOVE' || rule.conditionType === 'EQUALS') {
      return `> ${rule.thresholdValue}`;
    }
    if (rule.conditionType === 'BELOW' || rule.conditionType === 'NOT_EQUALS') {
      return `< ${rule.thresholdValue}`;
    }
    if (rule.conditionType === 'POSITIVE') {
      return 'Positive';
    }
    if (rule.conditionType === 'NEGATIVE') {
      return 'Negative';
    }
    if (rule.conditionType === 'ABNORMAL') {
      return 'Abnormal';
    }
    if (rule.conditionType === 'ALWAYS') {
      return 'Always trigger';
    }
    return rule.thresholdValue?.toString() || 'N/A';
  };

  const footer = (
    <div className="flex gap-3 justify-end w-full">
      <Button
        variant="outline"
        onClick={onClose}
        className="px-6 py-2 rounded-lg font-bold transition-all text-sm border-slate-300 text-slate-700"
      >
        Close
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Reflex Rule <span className="text-emerald-200">Details</span>
        </>
      }
      description="View complete reflex rule configuration"
      footer={footer}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* ═══ HEADER INFO ═════════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {ruleData.testName}
                  </h2>
                  <Badge
                    variant={ruleData.isActive ? 'success' : 'secondary'}
                    className="text-xs font-bold px-3 py-1"
                  >
                    {ruleData.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-mono font-bold">{ruleData.testCode}</span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 hover:bg-white rounded transition-all"
                  >
                    <Copy size={14} className={copied ? 'text-emerald-600' : 'text-slate-400'} />
                  </button>
                  <span className="text-slate-400">→</span>
                  <span className="font-mono font-bold">{ruleData.reflexTestCode}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                <Zap size={12} className="text-emerald-600" />
                <span>Priority</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{ruleData.priority}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                <GitBranch size={12} className="text-blue-600" />
                <span>Logic</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{ruleData.logicOperator}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                <CheckCircle size={12} className="text-purple-600" />
                <span>Auto Order</span>
              </div>
              <div className="text-lg font-bold text-slate-900">
                {ruleData.autoOrder ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                <User size={12} className="text-orange-600" />
                <span>Notify</span>
              </div>
              <div className="text-lg font-bold text-slate-900">
                {ruleData.notifyPhysician ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ CONDITION CONFIGURATION ════════════════════════════ */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-emerald-600" />
              Condition Configuration
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Condition Type
                </label>
                <Badge
                  variant={getConditionBadgeVariant(ruleData.conditionType)}
                  className="text-sm font-bold px-4 py-2"
                >
                  {ruleData.conditionType}
                </Badge>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Threshold Values
                </label>
                <div className="text-sm font-bold text-slate-900 font-mono bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  {formatThreshold(ruleData)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TEST INFORMATION ═══════════════════════════════════ */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              Test Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Primary Test
                </label>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-900">{ruleData.testName}</div>
                  <div className="text-xs text-slate-500 font-mono">{ruleData.testCode}</div>
                  {ruleData.parameterName && (
                    <div className="text-xs text-slate-600">
                      Parameter: {ruleData.parameterName} (ID: {ruleData.parameterId})
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Reflex Test
                </label>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-900">{ruleData.reflexTestName}</div>
                  <div className="text-xs text-slate-500 font-mono">{ruleData.reflexTestCode}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ DEMOGRAPHIC FILTERS ════════════════════════════════ */}
        {(ruleData.gender || ruleData.ageMin || ruleData.ageMax || ruleData.branchId) && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <User size={16} className="text-purple-600" />
                Demographic Filters
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {ruleData.gender && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      Gender
                    </label>
                    <div className="text-sm font-bold text-slate-900">{ruleData.gender}</div>
                  </div>
                )}
                {ruleData.ageMin && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      Min Age
                    </label>
                    <div className="text-sm font-bold text-slate-900">{ruleData.ageMin}</div>
                  </div>
                )}
                {ruleData.ageMax && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      Max Age
                    </label>
                    <div className="text-sm font-bold text-slate-900">{ruleData.ageMax}</div>
                  </div>
                )}
                {ruleData.branchId && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      Branch ID
                    </label>
                    <div className="text-sm font-bold text-slate-900 font-mono">{ruleData.branchId}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ CLINICAL NOTES ═════════════════════════════════════ */}
        {(ruleData.clinicalRationale || ruleData.technicianNotes) && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={16} className="text-orange-600" />
                Clinical Notes
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {ruleData.clinicalRationale && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Clinical Rationale
                  </label>
                  <div className="text-sm text-slate-700 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200">
                    {ruleData.clinicalRationale}
                  </div>
                </div>
              )}
              {ruleData.technicianNotes && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Technician Notes
                  </label>
                  <div className="text-sm text-slate-700 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
                    {ruleData.technicianNotes}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ METADATA ═══════════════════════════════════════════ */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={16} className="text-slate-600" />
              Metadata
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Rule ID
                </label>
                <div className="text-sm font-bold text-slate-900 font-mono">{ruleData.id}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Tenant ID
                </label>
                <div className="text-sm font-bold text-slate-900 font-mono">{ruleData.tenantId}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Created At
                </label>
                <div className="text-sm text-slate-700 flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  {formattedCreatedAt}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Updated At
                </label>
                <div className="text-sm text-slate-700 flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  {formattedUpdatedAt}
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </RightDrawer>
  );
}

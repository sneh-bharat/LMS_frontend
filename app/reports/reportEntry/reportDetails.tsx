"use client";

import type { ReactNode } from "react";
import {
  AlertCircle,
  Beaker,
  CheckCircle2,
  Clock,
  FlaskConical,
  History,
  Loader2,
  ShieldCheck,
  TestTube2,
} from "lucide-react";
import { RightDrawer } from "@/components/ui/right-drawer";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { useReportResultDetail } from "@/app/Apis/Report/useReportEntry";
import type { ResultParameterRecord } from "@/app/Apis/Report/reportApi";

export interface ReportDetailsContext {
  patientName?: string;
  testName?: string;
  orderNumber?: string;
}

interface ReportDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  resultId: number | null;
  context?: ReportDetailsContext | null;
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatRefRange(
  low: number | null,
  high: number | null,
): string {
  if (low != null && high != null) return `${low} – ${high}`;
  if (low != null) return `≥ ${low}`;
  if (high != null) return `≤ ${high}`;
  return "—";
}

function AbnormalFlagBadge({ flag }: { flag: string | null }) {
  if (!flag) return <span className="text-xs text-slate-400">—</span>;

  const normalized = flag.toUpperCase();
  const styles: Record<string, string> = {
    NORMAL: "bg-emerald-50 text-emerald-700 border-emerald-200",
    LOW: "bg-blue-50 text-blue-700 border-blue-200",
    HIGH: "bg-rose-50 text-rose-700 border-rose-200",
    CRITICAL: "bg-red-50 text-red-700 border-red-200 animate-pulse",
  };
  const tone = styles[normalized] ?? "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${tone}`}
    >
      {normalized}
    </span>
  );
}

function ResultStatusBadge({ status }: { status: string }) {
  const u = (status || "PENDING").toUpperCase();
  const config: Record<string, { variant: "warning" | "success" | "info" | "secondary"; label: string }> = {
    PENDING: { variant: "warning", label: "Pending" },
    DRAFT: { variant: "secondary", label: "Draft" },
    COMPLETED: { variant: "success", label: "Completed" },
    VERIFIED: { variant: "info", label: "Verified" },
  };
  const cfg = config[u] ?? { variant: "secondary" as const, label: status };

  return (
    <Badge variant={cfg.variant} className="text-[10px] font-bold uppercase">
      {cfg.label}
    </Badge>
  );
}

function DetailField({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 sm:p-4 bg-white">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
        {label}
      </p>
      <div
        className={`text-sm font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function ResultValueHero({ result }: { result: ResultParameterRecord }) {
  const flag = result.abnormalFlag?.toUpperCase() ?? null;
  const heroTone =
    flag === "CRITICAL" || result.isCritical
      ? "border-red-200 bg-red-50"
      : flag === "LOW"
        ? "border-blue-200 bg-blue-50"
        : flag === "HIGH"
          ? "border-rose-200 bg-rose-50"
          : "border-emerald-200 bg-emerald-50";

  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${heroTone}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
            Result Value
          </p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {result.resultValue || "—"}
            </span>
            {result.unit ? (
              <span className="text-sm font-bold text-slate-500">{result.unit}</span>
            ) : null}
          </div>
          <p className="text-xs font-semibold text-slate-600 mt-2">
            {result.parameterName}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <AbnormalFlagBadge flag={result.abnormalFlag} />
          <ResultStatusBadge status={result.resultStatus} />
        </div>
      </div>
    </div>
  );
}

export default function ReportDetails({
  isOpen,
  onClose,
  resultId,
  context,
}: ReportDetailsProps) {
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useReportResultDetail(resultId, { enabled: isOpen });

  const detail = response?.data;
  const result = detail?.result;
  const amendments = detail?.amendmentHistory ?? [];
  const approvals = detail?.approvalHistory ?? [];

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <FlaskConical size={20} />
          Result Details
        </span>
      }
      description={
        context?.patientName
          ? `${context.patientName}${context.testName ? ` — ${context.testName}` : ""}`
          : "Parameter result, reference ranges, and history"
      }
      maxWidth="lg"
      footer={
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 font-bold border-slate-200"
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-5 sm:space-y-6">
        {/* Context strip */}
        {context && (context.orderNumber || context.patientName) ? (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1">
            {context.patientName ? (
              <p className="text-sm font-bold text-slate-900">{context.patientName}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              {context.orderNumber ? (
                <span className="font-mono font-semibold">{context.orderNumber}</span>
              ) : null}
              {context.testName ? (
                <span className="flex items-center gap-1">
                  <TestTube2 size={12} className="text-emerald-500" />
                  {context.testName}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Loading */}
        {isLoading || (isFetching && !result) ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={28} className="animate-spin text-emerald-600" />
            <p className="text-sm font-semibold text-slate-500">Loading result details…</p>
          </div>
        ) : null}

        {/* Error */}
        {isError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-2 text-sm text-rose-800 flex-1">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span className="font-medium">
                {error instanceof Error ? error.message : "Failed to load result details."}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold shrink-0"
              onClick={() => void refetch()}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {/* Content */}
        {result && !isLoading ? (
          <>
            <ResultValueHero result={result} />

            {/* Status flags */}
            <div className="flex flex-wrap gap-2">
              {result.isVerified ? (
                <Badge variant="info" className="gap-1 text-[10px] font-bold">
                  <CheckCircle2 size={10} />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1 text-[10px] font-bold">
                  <Clock size={10} />
                  Not Verified
                </Badge>
              )}
              {result.autoVerified ? (
                <Badge variant="success" className="gap-1 text-[10px] font-bold">
                  <ShieldCheck size={10} />
                  Auto-Verified
                </Badge>
              ) : null}
              {result.isCritical ? (
                <Badge variant="danger" className="text-[10px] font-bold">
                  Critical Value
                </Badge>
              ) : null}
              {result.isCorrected ? (
                <Badge variant="warning" className="text-[10px] font-bold">
                  Corrected
                </Badge>
              ) : null}
            </div>

            {/* Reference & critical ranges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailField
                label="Reference Range"
                value={formatRefRange(result.referenceLow, result.referenceHigh)}
                mono
              />
              <DetailField
                label="Critical Range"
                value={formatRefRange(result.criticalLow, result.criticalHigh)}
                mono
              />
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <DetailField label="Result ID" value={`#${result.resultId}`} mono />
              <DetailField label="Parameter ID" value={result.parameterId} mono />
              <DetailField label="Order Item" value={result.orderItemId} mono />
              <DetailField label="Type" value={result.resultType} />
              <DetailField
                label="Numeric Value"
                value={result.numericValue ?? "—"}
                mono
              />
              <DetailField
                label="Instrument"
                value={result.instrumentName?.trim() || "—"}
              />
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailField label="Entered At" value={formatDateTime(result.enteredAt)} />
              <DetailField label="Verified At" value={formatDateTime(result.verifiedAt)} />
            </div>

            {/* Interpretation & comments */}
            {(result.clinicalInterpretation || result.comments) && (
              <div className="space-y-3">
                {result.clinicalInterpretation ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Clinical Interpretation
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {result.clinicalInterpretation}
                    </p>
                  </div>
                ) : null}
                {result.comments ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Comments
                    </p>
                    <p className="text-sm font-medium text-slate-700">{result.comments}</p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Correction */}
            {result.isCorrected && (result.correctedValue || result.correctionReason) ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                  Correction
                </p>
                {result.correctedValue ? (
                  <p className="text-sm font-semibold text-amber-900">
                    Corrected value:{" "}
                    <span className="font-mono">{result.correctedValue}</span>
                  </p>
                ) : null}
                {result.correctionReason ? (
                  <p className="text-xs text-amber-800">{result.correctionReason}</p>
                ) : null}
              </div>
            ) : null}

            {/* Amendment history */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <History size={16} className="text-emerald-600" />
                <span className="text-sm font-bold text-slate-800">Amendment History</span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {amendments.length}
                </span>
              </div>
              {amendments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
                  <Beaker size={24} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-xs font-medium text-slate-400">No amendments recorded</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[480px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            By
                          </th>
                          <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {amendments.map((row, idx) => (
                          <tr key={row.id ?? idx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-3 text-xs text-slate-600">
                              {formatDateTime(row.amendedAt)}
                            </td>
                            <td className="px-3 py-3 text-xs font-semibold text-slate-800">
                              {row.amendedBy ?? "—"}
                            </td>
                            <td className="px-3 py-3 text-xs text-slate-600">
                              {row.previousValue != null && row.newValue != null
                                ? `${row.previousValue} → ${row.newValue}`
                                : (row.reason ?? "—")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Approval history */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span className="text-sm font-bold text-slate-800">Approval History</span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {approvals.length}
                </span>
              </div>
              {approvals.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
                  <ShieldCheck size={24} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-xs font-medium text-slate-400">No approval history yet</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[480px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            By
                          </th>
                          <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {approvals.map((row, idx) => (
                          <tr key={row.id ?? idx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-3 text-xs text-slate-600">
                              {formatDateTime(row.approvedAt)}
                            </td>
                            <td className="px-3 py-3 text-xs font-semibold text-slate-800">
                              {row.approvedBy ?? "—"}
                            </td>
                            <td className="px-3 py-3">
                              <Badge variant="secondary" className="text-[9px] font-bold">
                                {row.status ?? "—"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </RightDrawer>
  );
}

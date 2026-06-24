"use client";

import type { ReactNode } from "react";
import {
  AlertCircle,
  Beaker,
  CheckCircle2,
  Clock,
  FlaskConical,
  Loader2,
  ShieldCheck,
  TestTube2,
} from "lucide-react";
import { RightDrawer } from "@/components/ui/right-drawer";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { useReportOrderResult } from "@/app/Apis/Report/useReportEntry";
import type { ResultParameterRecord } from "@/app/Apis/Report/reportApi";

export interface ReportDetailsContext {
  patientName?: string;
  testName?: string;
  orderNumber?: string;
  orderItemId?: number;
}

interface ReportDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
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

function ResultParameterCard({ result }: { result: ResultParameterRecord }) {
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
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
      <div className={`border-b p-4 sm:p-5 ${heroTone}`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              {result.parameterName}
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {result.resultValue || "—"}
              </span>
              {result.unit ? (
                <span className="text-sm font-bold text-slate-500">{result.unit}</span>
              ) : null}
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">
              Result #{result.resultId} · Item #{result.orderItemId}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <AbnormalFlagBadge flag={result.abnormalFlag} />
            <ResultStatusBadge status={result.resultStatus} />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <DetailField label="Parameter ID" value={result.parameterId} mono />
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
          <DetailField label="Entered At" value={formatDateTime(result.enteredAt)} />
          <DetailField label="Verified At" value={formatDateTime(result.verifiedAt)} />
        </div>

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
      </div>
    </div>
  );
}

export default function ReportDetails({
  isOpen,
  onClose,
  orderId,
  context,
}: ReportDetailsProps) {
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useReportOrderResult(orderId ?? 0, { enabled: isOpen && !!orderId });

  const orderData = response?.data;
  const focusedOrderItemId = context?.orderItemId;
  const results =
    focusedOrderItemId && focusedOrderItemId > 0
      ? (orderData?.content ?? []).filter(
          (row) => row.orderItemId === focusedOrderItemId,
        )
      : (orderData?.content ?? []);

  const patientName =
    context?.patientName || orderData?.patientName || undefined;
  const orderNumber =
    context?.orderNumber || orderData?.orderNumber || undefined;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <FlaskConical size={20} />
          Order Results
        </span>
      }
      description={
        patientName
          ? `${patientName}${context?.testName ? ` — ${context.testName}` : ""}`
          : "Retrieve all results for a specific order"
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
        {(patientName || orderNumber || orderData?.orderId) && (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            {patientName ? (
              <p className="text-sm font-bold text-slate-900">{patientName}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              {orderNumber ? (
                <span className="font-mono font-semibold">{orderNumber}</span>
              ) : null}
              {orderData?.orderId ? (
                <span className="font-mono">Order #{orderData.orderId}</span>
              ) : null}
              {context?.testName ? (
                <span className="flex items-center gap-1">
                  <TestTube2 size={12} className="text-emerald-500" />
                  {context.testName}
                </span>
              ) : null}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <DetailField
                label="Total Results"
                value={orderData?.totalElements ?? results.length}
              />
              <DetailField
                label="Flagged"
                value={orderData?.flaggedCount ?? 0}
              />
              <DetailField
                label="Critical"
                value={orderData?.criticalCount ?? 0}
              />
              <DetailField
                label="Page"
                value={
                  orderData
                    ? `${orderData.pageNo + 1} / ${orderData.totalPages}`
                    : "—"
                }
              />
            </div>
          </div>
        )}

        {isLoading || (isFetching && results.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={28} className="animate-spin text-emerald-600" />
            <p className="text-sm font-semibold text-slate-500">
              Loading order results…
            </p>
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-2 text-sm text-rose-800 flex-1">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span className="font-medium">
                {error instanceof Error
                  ? error.message
                  : "Failed to load order results."}
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

        {!isLoading && !isError && results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
            <Beaker size={28} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-semibold text-slate-500">
              No results found for this order
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Results will appear here once they are entered.
            </p>
          </div>
        ) : null}

        {!isLoading && !isError && results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <ResultParameterCard key={result.resultId} result={result} />
            ))}
          </div>
        ) : null}
      </div>
    </RightDrawer>
  );
}

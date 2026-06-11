"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  AlertCircle,
  FlaskConical,
  Loader2,
  Plus,
  Trash2,
  Beaker,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { RightDrawer } from "@/components/ui/right-drawer";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  enterBulkResults,
  fetchParametersWithReference,
  type ParameterResultEntry,
  type EnterBulkResultsPayload,
  type EnterBulkResultsData,
  type ParameterWithReference,
} from "@/app/Apis/Report/reportApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SelectedTest {
  orderItemId: number;
  testId: number;
  testName: string;
  testCode: string;
  testNameShort: string;
  sampleType: string;
  isCritical: boolean;
  remarks: string | null;
  resultStatus: string;
}

interface ResultEntryRow {
  id: number;
  patientId: string;
  patientName: string;
  gender: string;
  age: number;
  mobile: string;
  testName: string;
  sampleType: string;
  collectionDate: string;
  status: string;
  branchName?: string;
  /** Pass-through from API for submit */
  orderId?: number;
  orderItemId?: number;
  testId?: number;
  tests?: SelectedTest[];
}

interface EnterResultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  row: ResultEntryRow | null;
  selectedTest?: SelectedTest | null;
}

// ─── Empty parameter row factory ──────────────────────────────────────────────

let paramIdCounter = 0;
function emptyParam(): ParameterResultEntry & { _uid: string } {
  paramIdCounter += 1;
  return {
    _uid: `new-${paramIdCounter}`,
    parameterId: 0,
    parameterName: "",
    resultValue: "",
    numericValue: null,
    resultType: "NUMERIC",
    unit: "",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EnterResultDrawer({
  isOpen,
  onClose,
  row,
  selectedTest,
}: EnterResultDrawerProps) {
  const queryClient = useQueryClient();

  // ── Form state ────────────────────────────────────────────────────────────
  const [autoVerification, setAutoVerification] = useState(false);
  const [submitForVerification, setSubmitForVerification] = useState(false);
  const [params, setParams] = useState<
    (ParameterResultEntry & { _uid: string })[]
  >([emptyParam()]);

  // ── Derive test context from selectedTest or row ─────────────────────────
  const effectiveTestId = selectedTest?.testId ?? row?.testId ?? 0;
  const effectiveOrderItemId =
    selectedTest?.orderItemId ?? row?.orderItemId ?? 0;
  const effectiveTestName = selectedTest?.testName ?? row?.testName ?? "";
  const effectiveSampleType = selectedTest?.sampleType ?? row?.sampleType ?? "";
  const gender = (row?.gender ?? "").toUpperCase();
  const age = row?.age ?? 0;

  // ── Fetch parameters with reference when drawer opens ─────────────────────
  const { data: paramsQueryData, isLoading: isLoadingParams } = useQuery({
    queryKey: ["report-parameters", effectiveTestId, gender, age],
    queryFn: () => fetchParametersWithReference(effectiveTestId, gender, age),
    enabled: isOpen && effectiveTestId > 0 && !!gender && age > 0,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const items = paramsQueryData?.data ?? [];
    if (items.length > 0) {
      paramIdCounter = 0;
      const mapped = items.map((p: ParameterWithReference) => {
        paramIdCounter += 1;
        return {
          _uid: `ref-${p.parameterId}-${paramIdCounter}`,
          parameterId: p.parameterId,
          parameterName: p.parameterName,
          resultValue: "",
          numericValue: null,
          resultType: p.resultType,
          unit: p.unit,
          referenceLow: p.referenceMin,
          referenceHigh: p.referenceMax,
          referenceRange: p.referenceRange,
          criticalLow: p.criticalLow,
          criticalHigh: p.criticalHigh,
        };
      });
      setParams(mapped);
    } else if (isOpen && !isLoadingParams) {
      // No API data available — reset to single empty row
      paramIdCounter = 0;
      setParams([emptyParam()]);
    }
  }, [paramsQueryData, isOpen, isLoadingParams]);

  // Reset form when row changes
  const resetForm = useCallback(() => {
    setAutoVerification(false);
    setSubmitForVerification(false);
    paramIdCounter = 0;
    setParams([emptyParam()]);
  }, []);

  // ── Parameter row helpers ─────────────────────────────────────────────────

  /** Only resultValue is user-editable; everything else is read-only display */
  const updateResultValue = (uid: string, value: string) => {
    setParams((prev) =>
      prev.map((p) => {
        if (p._uid !== uid) return p;
        const n = parseFloat(value);
        return {
          ...p,
          resultValue: value,
          numericValue:
            p.resultType === "NUMERIC"
              ? Number.isNaN(n)
                ? null
                : n
              : p.numericValue,
        };
      }),
    );
  };

  const addParam = () => setParams((prev) => [...prev, emptyParam()]);

  const removeParam = (uid: string) => {
    setParams((prev) =>
      prev.length <= 1 ? prev : prev.filter((p) => p._uid !== uid),
    );
  };

  // ── Mutation ──────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (payload: EnterBulkResultsPayload) => enterBulkResults(payload),
    onSuccess: (res) => {
      if (res.response === false) {
        toast.error(res.message || "Failed to submit results.");
        return;
      }

      const d: EnterBulkResultsData | undefined = res.data;
      const summary = res.message || "Results submitted successfully.";

      if (d && d.criticalCount > 0) {
        toast.warning(summary, {
          description: `${d.criticalCount} critical value(s) detected — ${d.flaggedCount} flagged out of ${d.totalParameters} parameters.`,
          duration: 8000,
        });
      } else {
        toast.success(summary, {
          description: d
            ? `${d.flaggedCount} flagged out of ${d.totalParameters} parameters.`
            : undefined,
        });
      }

      if (d && d.skippedParameters.length > 0) {
        toast.info(`${d.skippedParameters.length} parameter(s) were skipped.`);
      }

      queryClient.invalidateQueries({ queryKey: ["report-result-list"] });
      onClose();
      resetForm();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit results.");
    },
  });

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const orderId = row?.orderId ?? 0;
    const orderItemId = effectiveOrderItemId;
    const submitTestId = effectiveTestId;

    if (!orderId || !orderItemId || !submitTestId) {
      toast.error(
        "Order ID, Order Item ID, and Test ID are missing from the selected row.",
      );
      return;
    }

    // Validate all parameters have a result value
    const invalid = params.some((p) => !p.resultValue.trim());
    if (invalid) {
      toast.error("All parameters must have a result value.");
      return;
    }

    const payload: EnterBulkResultsPayload = {
      orderId,
      orderItemId,
      testId: submitTestId,
      requestAutoVerification: autoVerification,
      submitForVerification,
      parameterResults: params.map(({ _uid, ...rest }) => rest),
    };

    mutation.mutate(payload);
  };

  // ── Abnormal flag helper ──────────────────────────────────────────────────
  function getAbnormalFlag(
    p: ParameterResultEntry,
  ): "LOW" | "HIGH" | "NORMAL" | "CRITICAL" | null {
    if (p.resultType !== "NUMERIC" || p.numericValue == null) return null;
    const val = p.numericValue;

    // Check reference range first to determine if out of range
    const isBelowRef = p.referenceLow != null && val < p.referenceLow;
    const isAboveRef = p.referenceHigh != null && val > p.referenceHigh;
    const isWithinRef =
      !isBelowRef &&
      !isAboveRef &&
      (p.referenceLow != null || p.referenceHigh != null);

    // CRITICAL: out of reference range AND beyond critical threshold
    if (isBelowRef && p.criticalLow != null && val < p.criticalLow)
      return "CRITICAL";
    if (isAboveRef && p.criticalHigh != null && val > p.criticalHigh)
      return "CRITICAL";

    // LOW / HIGH: out of reference range but not critical
    if (isBelowRef) return "LOW";
    if (isAboveRef) return "HIGH";

    // Within reference range
    if (isWithinRef) return "NORMAL";

    return null;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetForm();
      }}
      title={
        <span className="flex items-center gap-2">
          <FlaskConical size={20} />
          Enter Result
        </span>
      }
      description={
        row
          ? `${row.patientName} — ${effectiveTestName}`
          : "Enter parameter-level results"
      }
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="font-bold border-slate-200"
            onClick={() => {
              onClose();
              resetForm();
            }}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            onClick={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Submit Results
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ── Patient Summary (read-only) ── */}
        {row && (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1">
            <div className="text-sm font-bold text-slate-900">
              {row.patientName}
            </div>
            <div className="text-xs text-slate-500">
              {row.gender}, {row.age} yrs &middot; PID: {row.patientId} &middot;{" "}
              {row.mobile}
            </div>
            <div className="text-xs text-slate-500">
              Test:{" "}
              <span className="font-semibold text-slate-700">
                {effectiveTestName}
              </span>
              {effectiveSampleType && (
                <span> &middot; Sample: {effectiveSampleType}</span>
              )}
            </div>
            {selectedTest && (
              <div className="text-xs text-slate-500">
                Code:{" "}
                <span className="font-mono text-slate-600">
                  {selectedTest.testCode}
                </span>
                {selectedTest.isCritical && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold">
                    CRITICAL
                  </span>
                )}
              </div>
            )}
            {/* Hidden order context — submitted with payload but not shown as inputs */}
            <input type="hidden" name="orderId" value={row.orderId ?? ""} />
            <input
              type="hidden"
              name="orderItemId"
              value={effectiveOrderItemId}
            />
            <input type="hidden" name="testId" value={effectiveTestId} />
          </div>
        )}

        {/* ── Test selection info (when multiple tests exist) ── */}
        {row && row.tests && row.tests.length > 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-1">
            <div className="text-xs font-bold text-amber-800">
              This order has {row.tests.length} tests — currently entering
              result for:
            </div>
            <div className="text-sm font-bold text-amber-900">
              {effectiveTestName}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {row.tests.map((t) => (
                <span
                  key={t.orderItemId}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    t.testId === effectiveTestId
                      ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {t.testNameShort || t.testName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Error banner ── */}
        {mutation.isError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-rose-800">
            <AlertCircle size={16} className="shrink-0" />
            <span>{mutation.error?.message ?? "Submission failed."}</span>
          </div>
        )}

        {/* ── Loading parameters indicator ── */}
        {isLoadingParams && (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
            <Loader2 size={16} className="animate-spin text-emerald-600" />
            <span>Loading parameters…</span>
          </div>
        )}

        {/* ── Verification toggles ── */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoVerification}
              onChange={(e) => setAutoVerification(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-slate-700">
              Request Auto-Verification
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={submitForVerification}
              onChange={(e) => setSubmitForVerification(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-slate-700">
              Submit for Verification
            </span>
          </label>
        </div>

        {/* ── Parameter Results Table ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Beaker size={16} className="text-emerald-600" />
              <span className="text-sm font-bold text-slate-800">
                Parameter Results
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {params.length}
              </span>
            </div>
            {/* <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-1 text-xs"
              onClick={addParam}
            >
              <Plus size={14} />
              Add Parameter
            </Button> */}
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-10">
                      #
                    </th>
                    <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Parameter Name
                    </th>
                    <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[140px]">
                      Result Value <span className="text-rose-400">*</span>
                    </th>
                    <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                      Type
                    </th>
                    <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                      Unit
                    </th>
                    <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                      Ref. Range
                    </th>
                    <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                      Flag
                    </th>
                    <th className="px-3 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {params.map((p, idx) => {
                    const flag = getAbnormalFlag(p);
                    return (
                      <tr
                        key={p._uid}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        {/* # */}
                        <td className="px-3 py-3 text-xs font-bold text-slate-400">
                          {idx + 1}
                          {/* Parameter ID — hidden, submitted with payload */}
                          <input
                            type="hidden"
                            name={`parameterId-${idx}`}
                            value={p.parameterId ?? 0}
                          />
                        </td>

                        {/* Parameter Name — read-only, fetched from API */}
                        <td className="px-3 py-3">
                          {p.parameterName ? (
                            <span className="text-sm font-semibold text-slate-800">
                              {p.parameterName}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              —
                            </span>
                          )}
                        </td>

                        {/* Result Value — ONLY editable field */}
                        <td className="px-3 py-3">
                          <Input
                            value={p.resultValue}
                            onChange={(e) =>
                              updateResultValue(p._uid, e.target.value)
                            }
                            placeholder="Enter value…"
                            className="h-8 text-xs py-1 px-2 font-bold focus:ring-emerald-500 focus:border-emerald-500"
                            autoFocus={idx === 0}
                          />
                        </td>

                        {/* Type — read-only */}
                        <td className="px-3 py-3 text-center">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {p.resultType || "NUMERIC"}
                          </span>
                        </td>

                        {/* Unit — read-only, fetched from API */}
                        <td className="px-3 py-3 text-center">
                          {p.unit ? (
                            <span className="text-[10px] font-mono text-slate-500">
                              {p.unit}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Reference Range — read-only, fetched from API */}
                        <td className="px-3 py-3 text-center">
                          {p.referenceRange ? (
                            <span className="text-[10px] font-mono text-slate-500">
                              {p.referenceRange}
                            </span>
                          ) : p.referenceLow != null &&
                            p.referenceHigh != null ? (
                            <span className="text-[10px] font-mono text-slate-500">
                              {p.referenceLow} – {p.referenceHigh}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Abnormal Flag */}
                        <td className="px-3 py-3 text-center">
                          {flag === "CRITICAL" && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-red-50 text-red-600 border border-red-200 animate-pulse">
                              CRITICAL
                            </span>
                          )}
                          {flag === "LOW" && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-200">
                              LOW
                            </span>
                          )}
                          {flag === "HIGH" && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-200">
                              HIGH
                            </span>
                          )}
                          {flag === "NORMAL" && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200">
                              NORMAL
                            </span>
                          )}
                          {!flag && (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Delete */}
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeParam(p._uid)}
                            disabled={params.length <= 1}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </RightDrawer>
  );
}

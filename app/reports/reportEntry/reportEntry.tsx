"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  FlaskConical,
  Loader2,
  Trash2,
  Beaker,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { RightDrawer } from "@/components/ui/right-drawer";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useEnterSingleResultsBatch,
  useReportParameters,
  reportQueryKeys,
} from "@/app/Apis/Report/useReportEntry";
import type {
  ParameterResultEntry,
  EnterSingleResultsBatchResult,
  ParameterWithReference,
} from "@/app/Apis/Report/reportApi";
import { getCreatedByName } from "@/app/utils/loggedInUser";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectedTest {
  orderItemId: number;
  testId: number;
  resultId?: number | null;
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

export interface TestFormSectionHandle {
  validate: () => boolean;
  getSubmitData: () => {
    orderItemId: number;
    testId: number;
    parameters: ParameterResultEntry[];
    remarks: string | null;
  };
  isLoading: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function canEnterTest(test: SelectedTest): boolean {
  if (test.resultId != null && test.resultId > 0) return false;
  const status = (test.resultStatus || "").toUpperCase();
  if (status === "COMPLETED" || status === "VERIFIED") return false;
  return status === "PENDING" || status === "DRAFT";
}

function getAbnormalFlag(
  p: ParameterResultEntry,
): "LOW" | "HIGH" | "NORMAL" | "CRITICAL" | null {
  if (p.resultType !== "NUMERIC" || p.numericValue == null) return null;
  const val = p.numericValue;

  const isBelowRef = p.referenceLow != null && val < p.referenceLow;
  const isAboveRef = p.referenceHigh != null && val > p.referenceHigh;
  const isWithinRef =
    !isBelowRef &&
    !isAboveRef &&
    (p.referenceLow != null || p.referenceHigh != null);

  if (isBelowRef && p.criticalLow != null && val < p.criticalLow)
    return "CRITICAL";
  if (isAboveRef && p.criticalHigh != null && val > p.criticalHigh)
    return "CRITICAL";
  if (isBelowRef) return "LOW";
  if (isAboveRef) return "HIGH";
  if (isWithinRef) return "NORMAL";
  return null;
}

function getClinicalInterpretation(param: ParameterResultEntry): string | undefined {
  const flag = getAbnormalFlag(param);
  if (flag === "CRITICAL") return "Critical value — requires attention";
  if (flag === "LOW") return "Below reference range";
  if (flag === "HIGH") return "Above reference range";
  if (flag === "NORMAL") return "Within normal range";
  return undefined;
}

// ─── One form per test ────────────────────────────────────────────────────────

interface EnterTestFormSectionProps {
  test: SelectedTest;
  gender: string;
  age: number;
  isOpen: boolean;
  defaultExpanded?: boolean;
}

const EnterTestFormSection = forwardRef<
  TestFormSectionHandle,
  EnterTestFormSectionProps
>(function EnterTestFormSection(
  { test, gender, age, isOpen, defaultExpanded = true },
  ref,
) {
  const { data: paramsQueryData, isLoading: isLoadingParams } =
    useReportParameters(test.testId, gender, age, {
      enabled: isOpen && test.testId > 0,
    });

  const [params, setParams] = useState<
    (ParameterResultEntry & { _uid: string })[]
  >([emptyParam()]);

  useEffect(() => {
    const items = paramsQueryData?.data ?? [];
    if (items.length > 0) {
      paramIdCounter = 0;
      const mapped = items.map((p: ParameterWithReference) => {
        paramIdCounter += 1;
        return {
          _uid: `ref-${test.orderItemId}-${p.parameterId}-${paramIdCounter}`,
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
      paramIdCounter = 0;
      setParams([emptyParam()]);
    }
  }, [paramsQueryData, isOpen, isLoadingParams, test.orderItemId]);

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

  const removeParam = (uid: string) => {
    setParams((prev) =>
      prev.length <= 1 ? prev : prev.filter((p) => p._uid !== uid),
    );
  };

  useImperativeHandle(
    ref,
    () => ({
      isLoading: isLoadingParams,
      validate: () => !params.some((p) => !p.resultValue.trim()),
      getSubmitData: () => ({
        orderItemId: test.orderItemId,
        testId: test.testId,
        parameters: params.map(({ _uid, ...rest }) => rest),
        remarks: test.remarks,
      }),
    }),
    [isLoadingParams, params, test],
  );

  if (!defaultExpanded) return null;

  return (
    <div
      id={`test-form-${test.orderItemId}`}
      className="border border-slate-200 rounded-xl overflow-hidden"
    >
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <Beaker size={16} className="text-emerald-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-slate-900 truncate">
            {test.testName}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono text-slate-500">
              {test.testCode}
            </span>
            {test.sampleType && (
              <span className="text-[10px] text-slate-400">
                Sample: {test.sampleType}
              </span>
            )}
            {test.isCritical && (
              <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold">
                CRITICAL
              </span>
            )}
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
          {params.length} param{params.length === 1 ? "" : "s"}
        </span>
      </div>

      {isLoadingParams ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 px-4 py-6">
          <Loader2 size={16} className="animate-spin text-emerald-600" />
          <span>Loading parameters…</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-160">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-10">
                  #
                </th>
                <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Parameter
                </th>
                <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-30">
                  Result <span className="text-rose-400">*</span>
                </th>
                <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center hidden sm:table-cell">
                  Type
                </th>
                <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center hidden sm:table-cell">
                  Unit
                </th>
                <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center hidden md:table-cell">
                  Ref.
                </th>
                <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                  Flag
                </th>
                <th className="px-3 py-2.5 w-10" />
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
                    <td className="px-3 py-3 text-xs font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm font-semibold text-slate-800">
                        {p.parameterName || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Input
                        value={p.resultValue}
                        onChange={(e) =>
                          updateResultValue(p._uid, e.target.value)
                        }
                        placeholder="Enter value…"
                        className="h-8 text-xs py-1 px-2 font-bold focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {p.resultType || "NUMERIC"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
                      <span className="text-[10px] font-mono text-slate-500">
                        {p.unit || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center hidden md:table-cell">
                      <span className="text-[10px] font-mono text-slate-500">
                        {p.referenceRange ??
                          (p.referenceLow != null && p.referenceHigh != null
                            ? `${p.referenceLow} – ${p.referenceHigh}`
                            : "—")}
                      </span>
                    </td>
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
      )}
    </div>
  );
});

// ─── Drawer ───────────────────────────────────────────────────────────────────

export default function EnterResultDrawer({
  isOpen,
  onClose,
  row,
  selectedTest,
}: EnterResultDrawerProps) {
  const queryClient = useQueryClient();
  const sectionRefs = useRef<Record<number, TestFormSectionHandle | null>>({});

  const gender = (row?.gender ?? "").toUpperCase();
  const age = row?.age ?? 0;

  /** All tests on this order that still need result entry. */
  const enterableTests = useMemo(() => {
    const fromRow = (row?.tests ?? []).filter(canEnterTest);
    if (fromRow.length > 0) return fromRow;
    if (selectedTest && canEnterTest(selectedTest)) return [selectedTest];
    return [];
  }, [row?.tests, selectedTest]);

  const [autoVerification, setAutoVerification] = useState(false);
  const [submitForVerification, setSubmitForVerification] = useState(false);

  const resetForm = useCallback(() => {
    setAutoVerification(false);
    setSubmitForVerification(false);
    sectionRefs.current = {};
    paramIdCounter = 0;
  }, []);

  useEffect(() => {
    if (!isOpen || !selectedTest) return;
    const el = document.getElementById(`test-form-${selectedTest.orderItemId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isOpen, selectedTest, enterableTests.length]);

  const mutation = useEnterSingleResultsBatch();

  const handleMutationSuccess = (batch: EnterSingleResultsBatchResult) => {
    const summary = batch.lastMessage || "Results submitted successfully.";

    if (batch.criticalCount > 0) {
      toast.warning(summary, {
        description: `${batch.criticalCount} critical value(s) detected — ${batch.flaggedCount} flagged out of ${batch.totalParameters} parameters.`,
        duration: 8000,
      });
    } else {
      toast.success(summary, {
        description: `${batch.flaggedCount} flagged out of ${batch.totalParameters} parameters.`,
      });
    }

    onClose();
    resetForm();
  };

  const handleSubmit = async () => {
    const orderId = row?.orderId ?? 0;
    if (!orderId) {
      toast.error("Order ID is missing from the selected row.");
      return;
    }

    if (enterableTests.length === 0) {
      toast.error("No tests available for result entry.");
      return;
    }

    for (const test of enterableTests) {
      const section = sectionRefs.current[test.orderItemId];
      if (!section) {
        toast.error(`Form not ready for ${test.testName}.`);
        return;
      }
      if (section.isLoading) {
        toast.error(`Still loading parameters for ${test.testName}.`);
        return;
      }
      if (!section.validate()) {
        toast.error(`All parameters must have a value for ${test.testName}.`);
        return;
      }
    }

    try {
      let lastBatch: EnterSingleResultsBatchResult | undefined;

      for (const test of enterableTests) {
        const section = sectionRefs.current[test.orderItemId]!;
        const submitData = section.getSubmitData();

        lastBatch = await mutation.mutateAsync({
          options: {
            orderId,
            orderItemId: submitData.orderItemId,
            testId: submitData.testId,
            requestAutoVerification: autoVerification,
            submitForVerification,
            enteredBy: getCreatedByName(),
            comments: submitData.remarks ?? undefined,
          },
          parameters: submitData.parameters,
          getClinicalInterpretation,
        });
      }

      if (lastBatch) {
        handleMutationSuccess(lastBatch);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "message" in err
            ? String((err as { message: string }).message)
            : "Failed to submit results.";

      if (/already exists|use correction/i.test(msg)) {
        toast.error(msg, {
          description:
            "A parameter already has a result. Refresh the list, then use View or Edit/Correction.",
          duration: 8000,
        });
        void queryClient.invalidateQueries({ queryKey: reportQueryKeys.all });
        return;
      }

      toast.error(msg);
    }
  };

  const testCount = enterableTests.length;

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
          Enter Result{testCount > 1 ? "s" : ""}
        </span>
      }
      description={
        row
          ? `${row.patientName} — ${testCount} test${testCount === 1 ? "" : "s"} to enter`
          : "Enter parameter-level results"
      }
      maxWidth="xl"
      footer={
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
          {testCount > 1 && (
            <p className="text-xs font-semibold text-slate-500">
              Submitting {testCount} test forms
            </p>
          )}
          <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
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
              onClick={() => void handleSubmit()}
              disabled={mutation.isPending || enterableTests.length === 0}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  {testCount > 1 ? "Submit All Results" : "Submit Results"}
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {row && (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1">
            <div className="text-sm font-bold text-slate-900">
              {row.patientName}
            </div>
            <div className="text-xs text-slate-500">
              {row.gender}, {row.age} yrs &middot; PID: {row.patientId}{" "}
              &middot; {row.mobile}
            </div>
            {testCount > 1 && (
              <div className="text-xs text-amber-700 font-semibold pt-1">
                {testCount} tests require result entry — fill each form below.
              </div>
            )}
          </div>
        )}

        {mutation.isError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-rose-800">
            <AlertCircle size={16} className="shrink-0" />
            <span>{mutation.error?.message ?? "Submission failed."}</span>
          </div>
        )}

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

        <div className="space-y-4">
          {enterableTests.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500 font-medium">
              No pending tests available for result entry.
            </div>
          ) : (
            enterableTests.map((test) => (
              <EnterTestFormSection
                key={test.orderItemId}
                ref={(handle) => {
                  sectionRefs.current[test.orderItemId] = handle;
                }}
                test={test}
                gender={gender}
                age={age}
                isOpen={isOpen}
              />
            ))
          )}
        </div>
      </div>
    </RightDrawer>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  Eye,
  Loader2,
  Printer,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { RightDrawer } from "@/components/ui/right-drawer";
import Button from "@/components/ui/button";
import { useReportOrderResult } from "@/app/Apis/Report/useReportEntry";
import type {
  OrderResultTestGroup,
  ResultParameterRecord,
} from "@/app/Apis/Report/reportApi";

export interface ReportDetailsContext {
  patientName?: string;
  patientId?: string;
  gender?: string;
  age?: number;
  dob?: string;
  testName?: string;
  orderNumber?: string;
  orderItemId?: number;
  departmentName?: string;
  categoryName?: string;
  sampleType?: string;
  collectionDate?: string;
  collectionTime?: string;
  priority?: string;
  isCritical?: boolean;
  testMetaByOrderItem?: Record<
    number,
    {
      testName?: string;
      departmentName?: string;
      categoryName?: string;
      isCritical?: boolean;
      resultId?: number | null;
    }
  >;
}

interface ReportDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
  context?: ReportDetailsContext | null;
}

const STATUS_STYLES: Record<
  string,
  { label: string; className: string; dotClass: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-400",
  },
  DRAFT: {
    label: "Draft",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    dotClass: "bg-orange-400",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  VERIFIED: {
    label: "Verified",
    className: "bg-sky-50 text-sky-700 border-sky-200",
    dotClass: "bg-sky-500",
  },
};

function getStatusConfig(status: string) {
  const key = (status || "PENDING").toUpperCase();
  return STATUS_STYLES[key] ?? STATUS_STYLES.PENDING;
}

function toDisplayDate(raw: string | null | undefined) {
  if (!raw) return "—";
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return raw;
  return dt.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hasCriticalRecord(rows: ResultParameterRecord[]) {
  return rows.some(
    (row) =>
      row.isCritical || (row.abnormalFlag || "").toUpperCase() === "CRITICAL",
  );
}

function resolveResultId(
  test: OrderResultTestGroup,
  contextResultId?: number | null,
): number | null {
  if (contextResultId && contextResultId > 0) return contextResultId;
  if (test.resultId > 0) return test.resultId;
  const fromParam = test.parameters.find((p) => p.resultId > 0)?.resultId;
  return fromParam && fromParam > 0 ? fromParam : null;
}

export default function ReportDetails({
  isOpen,
  onClose,
  orderId,
  context,
}: ReportDetailsProps) {
  const router = useRouter();
  const {
    data: orderResult,
    isLoading,
    isFetching,
    isError,
    error,
  } = useReportOrderResult(orderId ?? 0, {
    enabled: isOpen && !!orderId && orderId > 0,
  });

  const tests = orderResult?.data?.tests ?? [];
  const resolvedOrderNo = context?.orderNumber || orderResult?.data?.orderNumber || "—";
  const resolvedPatient =
    context?.patientName || orderResult?.data?.patientName || "Unknown Patient";

  const overallStatus = useMemo(() => {
    if (tests.length === 0) return "PENDING";
    const statuses = tests.map((t) => (t.resultStatus || "PENDING").toUpperCase());
    if (statuses.every((s) => s === "VERIFIED")) return "VERIFIED";
    if (statuses.every((s) => s === "COMPLETED" || s === "VERIFIED")) return "COMPLETED";
    if (statuses.some((s) => s === "DRAFT")) return "DRAFT";
    return "PENDING";
  }, [tests]);

  const initialTest = useMemo(() => {
    if (!tests.length) return null;
    if (context?.orderItemId) {
      const match = tests.find((t) => t.orderItemId === context.orderItemId);
      if (match) return match;
    }
    return tests[0];
  }, [tests, context?.orderItemId]);

  const [activeTest, setActiveTest] = useState<OrderResultTestGroup | null>(null);

  useEffect(() => {
    setActiveTest(initialTest);
  }, [initialTest, orderId, isOpen]);

  const statusCfg = getStatusConfig(overallStatus);
  const totalCriticalTests = tests.filter((t) => hasCriticalRecord(t.parameters)).length;

  const getContextMeta = (orderItemId: number) =>
    context?.testMetaByOrderItem?.[orderItemId];

  const handleViewResult = (test: OrderResultTestGroup) => {
    if (!orderId || orderId <= 0) return;

    const contextMeta = getContextMeta(test.orderItemId);
    const resultId = resolveResultId(test, contextMeta?.resultId);
    if (!resultId) {
      toast.error("Result ID not available for this test yet.");
      return;
    }

    const params = new URLSearchParams({
      resultId: String(resultId),
      orderId: String(orderId),
      orderItemId: String(test.orderItemId),
      testName: contextMeta?.testName || test.testName,
      isCritical: String(
        contextMeta?.isCritical ??
          context?.isCritical ??
          hasCriticalRecord(test.parameters),
      ),
    });

    if (resolvedPatient) params.set("patientName", resolvedPatient);
    if (resolvedOrderNo) params.set("orderNumber", resolvedOrderNo);
    if (context?.patientId) params.set("patientId", context.patientId);
    if (context?.gender) params.set("gender", context.gender);
    if (context?.age != null) params.set("age", String(context.age));
    if (context?.dob) params.set("dob", context.dob);
    if (contextMeta?.departmentName || context?.departmentName) {
      params.set(
        "departmentName",
        contextMeta?.departmentName || context?.departmentName || "",
      );
    }
    if (contextMeta?.categoryName || context?.categoryName) {
      params.set(
        "categoryName",
        contextMeta?.categoryName || context?.categoryName || "",
      );
    }
    if (context?.sampleType) params.set("sampleType", context.sampleType);
    if (context?.collectionDate) params.set("collectionDate", context.collectionDate);
    if (context?.collectionTime) params.set("collectionTime", context.collectionTime);
    if (context?.priority) params.set("priority", context.priority);

    onClose();
    router.push(`/reports/report-result?${params.toString()}`);
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title="Order Test Details"
      description={resolvedOrderNo}
      footer={
        <div className="flex w-full flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="font-bold border-slate-200"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-4 md:px-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700">
                  <UserRound size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-xl font-black text-slate-900">
                      {resolvedPatient}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${statusCfg.className}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
                      {statusCfg.label}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      In Progress
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {resolvedOrderNo}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Age / Gender
                  </p>
                  <p className="mt-1 font-bold text-slate-700">—</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Collection
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 font-bold text-slate-700">
                    <Calendar size={13} className="text-slate-400" />
                    {toDisplayDate(activeTest?.parameters?.[0]?.enteredAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Referrer
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 font-bold text-slate-700">
                    <Stethoscope size={13} className="text-slate-400" />
                    —
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Tests In Order
                  </p>
                  <p className="mt-1 font-bold text-slate-700">
                    {tests.length} test{tests.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="font-bold border-slate-200 bg-white"
                onClick={() => toast.info("Print summary triggered")}
              >
                <Printer size={14} />
                Print Summary
              </Button>
              <Button
                type="button"
                variant="gradient"
                className="font-black"
                onClick={() => toast.success("Release workflow not connected yet")}
              >
                <ShieldCheck size={14} />
                Release Report
              </Button>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 md:px-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-base font-black text-slate-800">Ordered tests</h4>
              <div className="flex items-center gap-2 text-[11px] font-bold">
                {totalCriticalTests > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-red-600">
                    <AlertTriangle size={12} />
                    {totalCriticalTests} critical
                  </span>
                )}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
                  {tests.length} total
                </span>
              </div>
            </div>
          </div>

          {isLoading || isFetching ? (
            <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin text-emerald-600" />
              Loading order tests...
            </div>
          ) : isError ? (
            <div className="px-5 py-6 text-sm font-semibold text-rose-600">
              {(error as Error)?.message || "Unable to load order details."}
            </div>
          ) : tests.length === 0 ? (
            <div className="px-5 py-8 text-sm font-semibold text-slate-500">
              No tests found for this order.
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-225 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">
                        Test name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">
                        Critical
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((test) => {
                      const cfg = getStatusConfig(test.resultStatus);
                    const contextMeta = getContextMeta(test.orderItemId);
                    const displayTestName = contextMeta?.testName || test.testName;
                      const departmentName = contextMeta?.departmentName || context?.departmentName;
                      const categoryName = contextMeta?.categoryName || context?.categoryName;
                      const isCritical =
                        contextMeta?.isCritical ??
                        context?.isCritical ??
                        hasCriticalRecord(test.parameters);
                      return (
                        <tr
                          key={test.orderItemId}
                          className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                            activeTest?.orderItemId === test.orderItemId
                              ? "bg-emerald-50/40"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                            {displayTestName}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {departmentName || "Laboratory"}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {categoryName || test.testCode || "Routine Panel"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-black ${cfg.className}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {isCritical ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                                <AlertTriangle size={13} />
                                Yes
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleViewResult(test)}
                              className="inline-flex items-center gap-1 text-sm font-bold text-slate-700 hover:text-emerald-700"
                            >
                              <Eye size={14} />
                              View Result
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 p-3 md:hidden">
                {tests.map((test) => {
                  const cfg = getStatusConfig(test.resultStatus);
                  const contextMeta = getContextMeta(test.orderItemId);
                  const displayTestName = contextMeta?.testName || test.testName;
                  const departmentName = contextMeta?.departmentName || context?.departmentName;
                  const categoryName = contextMeta?.categoryName || context?.categoryName;
                  const isCritical =
                    contextMeta?.isCritical ??
                    context?.isCritical ??
                    hasCriticalRecord(test.parameters);
                  return (
                    <div
                      key={`m-${test.orderItemId}`}
                      className={`rounded-xl border p-3 ${
                        activeTest?.orderItemId === test.orderItemId
                          ? "border-emerald-300 bg-emerald-50/50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <p className="text-sm font-bold text-slate-800">{displayTestName}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {departmentName || "Laboratory"} ·{" "}
                        {categoryName || test.testCode || "Routine Panel"}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${cfg.className}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
                          {cfg.label}
                        </span>
                        {isCritical && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-black text-red-600">
                            <AlertTriangle size={11} />
                            Critical
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleViewResult(test)}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-700"
                      >
                        <Eye size={13} />
                        View Result
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </RightDrawer>
  );
}

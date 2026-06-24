'use client';

import { useMemo, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  FileText,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { Table } from '@/components/ui';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useReportOrderResult, useReportResultDetail } from '@/app/Apis/Report/useReportEntry';
import type { ResultDetailData, ResultParameterRecord } from '@/app/Apis/Report/reportApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="label-refined text-[10px] tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-slate-800 break-words">
        {value || '—'}
      </p>
    </div>
  );
}

function formatReferenceRange(param: ResultParameterRecord) {
  if (param.referenceLow != null && param.referenceHigh != null) {
    return `${param.referenceLow} – ${param.referenceHigh}`;
  }
  if (param.referenceLow != null) return `≥ ${param.referenceLow}`;
  if (param.referenceHigh != null) return `≤ ${param.referenceHigh}`;
  return '—';
}

function getAbnormalFlag(param: ResultParameterRecord) {
  const flag = (param.abnormalFlag || '').toUpperCase();
  if (param.isCritical || flag === 'CRITICAL') return 'CRITICAL';
  if (flag === 'LOW' || flag === 'HIGH') return flag;
  if (flag === 'NORMAL') return 'NORMAL';
  return null;
}

function getResultStatusLabel(status: string, hasCritical: boolean) {
  if (hasCritical) return 'Critical';
  const key = (status || 'PENDING').toUpperCase();
  const map: Record<string, string> = {
    PENDING: 'Pending',
    DRAFT: 'Draft',
    COMPLETED: 'Completed',
    VERIFIED: 'Verified',
  };
  return map[key] ?? status;
}

function collectClinicalNotes(
  parameters: ResultParameterRecord[],
  detail?: ResultDetailData | null,
) {
  const notes = new Set<string>();
  for (const param of parameters) {
    if (param.clinicalInterpretation?.trim()) {
      notes.add(param.clinicalInterpretation.trim());
    }
    if (param.comments?.trim()) {
      notes.add(param.comments.trim());
    }
  }
  for (const entry of detail?.amendmentHistory ?? []) {
    if (entry.reason?.trim()) notes.add(entry.reason.trim());
  }
  return Array.from(notes).join(' ');
}

function formatDisplayDate(raw: string | null | undefined) {
  if (!raw) return '';
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return raw;
  return dt.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDisplayTime(raw: string | null | undefined) {
  if (!raw) return '';
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return raw;
  return dt.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function hasAbnormalFlag(parameters: ResultParameterRecord[]) {
  return parameters.some((p) => {
    const flag = (p.abnormalFlag || '').toUpperCase();
    return flag === 'LOW' || flag === 'HIGH' || flag === 'CRITICAL' || p.isCritical;
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = Number(searchParams.get('orderId')) || 0;
  const orderItemId = Number(searchParams.get('orderItemId')) || 0;
  const resultId = Number(searchParams.get('resultId')) || 0;

  const context = useMemo(
    () => ({
      patientName: searchParams.get('patientName') || '',
      patientId: searchParams.get('patientId') || '',
      gender: searchParams.get('gender') || '',
      age: searchParams.get('age') || '',
      dob: searchParams.get('dob') || '',
      orderNumber: searchParams.get('orderNumber') || '',
      testName: searchParams.get('testName') || '',
      departmentName: searchParams.get('departmentName') || '',
      categoryName: searchParams.get('categoryName') || '',
      sampleType: searchParams.get('sampleType') || '',
      collectionDate: searchParams.get('collectionDate') || '',
      collectionTime: searchParams.get('collectionTime') || '',
      priority: searchParams.get('priority') || '',
      expectedReport: searchParams.get('expectedReport') || '',
      actualReport: searchParams.get('actualReport') || '',
      isCritical: searchParams.get('isCritical') === 'true',
    }),
    [searchParams],
  );

  const {
    data: orderResult,
    isLoading: isOrderLoading,
    isFetching: isOrderFetching,
    isError: isOrderError,
    error: orderError,
  } = useReportOrderResult(orderId, { enabled: orderId > 0 });

  const {
    data: resultDetail,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
    isError: isDetailError,
    error: detailError,
  } = useReportResultDetail(resultId, { enabled: resultId > 0 });

  const detailData = resultDetail?.data;
  const detailResult = detailData?.result;

  const resolvedOrderItemId =
    orderItemId || detailResult?.orderItemId || 0;

  const isLoading =
    (resultId > 0 && isDetailLoading) || (orderId > 0 && isOrderLoading);
  const isFetching =
    (resultId > 0 && isDetailFetching) || (orderId > 0 && isOrderFetching);
  const isError =
    (resultId > 0 && isDetailError) ||
    (orderId > 0 && isOrderError && !detailResult);
  const error = detailError ?? orderError;

  const tests = orderResult?.data?.tests ?? [];

  const activeTest = useMemo(() => {
    if (!tests.length) return null;
    if (resolvedOrderItemId > 0) {
      return (
        tests.find((t) => t.orderItemId === resolvedOrderItemId) ?? tests[0]
      );
    }
    return tests[0];
  }, [tests, resolvedOrderItemId]);

  const parameters = useMemo(() => {
    const fromOrder = activeTest?.parameters ?? [];

    if (resultId > 0 && detailResult?.resultId) {
      if (fromOrder.length > 1) return fromOrder;

      const merged = fromOrder.some((p) => p.resultId === detailResult.resultId)
        ? fromOrder.map((p) =>
            p.resultId === detailResult.resultId ? detailResult : p,
          )
        : fromOrder.length > 0
          ? fromOrder
          : [detailResult];

      return merged.length > 0 ? merged : [detailResult];
    }

    return fromOrder;
  }, [activeTest?.parameters, detailResult, resultId]);
  const hasCritical = parameters.some(
    (p) => p.isCritical || (p.abnormalFlag || '').toUpperCase() === 'CRITICAL',
  );
  const abnormalCount = parameters.filter((p) => {
    const flag = (p.abnormalFlag || '').toUpperCase();
    return flag === 'LOW' || flag === 'HIGH' || flag === 'CRITICAL' || p.isCritical;
  }).length;

  const resolvedOrderNo =
    context.orderNumber || orderResult?.data?.orderNumber || '—';
  const resolvedPatient =
    context.patientName || orderResult?.data?.patientName || '—';
  const resolvedTestName =
    context.testName ||
    activeTest?.testName ||
    (parameters.length === 1 ? parameters[0].parameterName : '') ||
    '—';
  const resultStatus = getResultStatusLabel(
    activeTest?.resultStatus ?? detailResult?.resultStatus ?? 'PENDING',
    hasCritical || context.isCritical,
  );
  const clinicalNotes = collectClinicalNotes(parameters, detailData);

  const collectionDate =
    context.collectionDate || formatDisplayDate(detailResult?.enteredAt);
  const collectionTime =
    context.collectionTime || formatDisplayTime(detailResult?.enteredAt);
  const actualReport =
    context.actualReport ||
    formatDisplayDate(detailResult?.verifiedAt ?? detailResult?.enteredAt);

  const tableData = parameters.map((param) => ({
    ...param,
    'Parameter Name': param.parameterName,
    Result: param.resultValue,
    Unit: param.unit || '—',
    'Reference Range': formatReferenceRange(param),
    Interpretation: getAbnormalFlag(param),
  }));

  const columns = [
    {
      key: 'Parameter Name',
      label: 'Parameter',
      render: (value: string) => (
        <span className="font-semibold text-slate-700">{value}</span>
      ),
    },
    {
      key: 'Result',
      label: 'Result',
      render: (value: string, row: ResultParameterRecord & { Interpretation: string | null }) => {
        const flag = row.Interpretation;
        const valueClass =
          flag === 'CRITICAL'
            ? 'text-rose-700'
            : flag === 'LOW' || flag === 'HIGH'
              ? 'text-amber-700'
              : 'text-slate-800';

        return (
          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-black ${valueClass}`}>{value}</span>
            {flag === 'CRITICAL' && (
              <Badge variant="danger" size="sm" className="rounded-md normal-case tracking-normal font-bold">
                Critical
              </Badge>
            )}
            {(flag === 'LOW' || flag === 'HIGH') && (
              <Badge variant="warning" size="sm" className="rounded-md normal-case tracking-normal font-bold">
                {flag === 'LOW' ? 'Low' : 'High'}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'Unit',
      label: 'Unit',
      render: (value: string) => (
        <span className="font-semibold text-slate-600">{value}</span>
      ),
    },
    {
      key: 'Reference Range',
      label: 'Reference range',
      render: (value: string) => (
        <span className="font-semibold text-slate-600">{value}</span>
      ),
    },
    {
      key: 'Interpretation',
      label: 'Interpretation',
      render: (flag: string | null) => {
        if (!flag || flag === 'NORMAL') {
          return <span className="text-slate-400">—</span>;
        }
        if (flag === 'CRITICAL') {
          return (
            <Badge variant="danger" size="sm" className="rounded-md normal-case tracking-normal font-bold">
              Critical
            </Badge>
          );
        }
        return (
          <Badge variant="warning" size="sm" className="rounded-md normal-case tracking-normal font-bold">
            {flag === 'LOW' ? 'Low' : 'High'}
          </Badge>
        );
      },
    },
  ];

  if (!orderId && !resultId) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Card className="card-refined border-slate-200 py-8">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <AlertTriangle className="text-amber-500" size={28} />
            <p className="text-sm font-bold text-slate-700">
              Missing result information
            </p>
            <p className="text-xs text-slate-500">
              Open this page from a result entry with a valid result or order ID.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-2 font-bold"
              onClick={() => router.push('/reports/reportEntry')}
            >
              <ArrowLeft size={14} />
              Back to results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6 sm:py-6">
      {/* Breadcrumb & header */}
      <div className="space-y-3">
        <nav className="text-xs font-semibold text-slate-400">
          <span>Results</span>
          <span className="mx-1.5">/</span>
          <span className="text-slate-500">{resolvedOrderNo}</span>
          <span className="mx-1.5">/</span>
          <span className="text-slate-600">{resolvedTestName}</span>
        </nav>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto w-fit px-0 text-slate-600 hover:bg-transparent hover:text-emerald-700"
            onClick={() => router.push('/reports/reportEntry')}
          >
            <ArrowLeft size={15} />
            Back to order
          </Button>

          {(hasCritical || context.isCritical) && (
            <Badge variant="danger" size="md" className="w-fit rounded-full normal-case tracking-normal font-bold">
              Critical
            </Badge>
          )}
          {!hasCritical && hasAbnormalFlag(parameters) && (
            <Badge variant="warning" size="md" className="w-fit rounded-full normal-case tracking-normal font-bold">
              Abnormal
            </Badge>
          )}
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin text-emerald-600" />
          Loading result report...
        </div>
      ) : isError ? (
        <Card className="card-refined border-rose-200 py-6">
          <CardContent>
            <p className="text-sm font-semibold text-rose-600">
              {(error as Error)?.message || 'Unable to load result report.'}
            </p>
          </CardContent>
        </Card>
      ) : parameters.length === 0 ? (
        <Card className="card-refined border-slate-200 py-6">
          <CardContent>
            <p className="text-sm font-semibold text-slate-500">
              No result data found for this report.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Info cards */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="card-refined gap-3 border-slate-200 py-4">
              <CardHeader className="px-4 pb-0">
                <CardTitle className="text-sm font-black text-slate-800">
                  Patient information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2">
                <InfoField label="Patient" value={resolvedPatient} />
                <InfoField label="Patient code" value={context.patientId} />
                <InfoField label="Date of birth" value={context.dob} />
                <InfoField
                  label="Age"
                  value={context.age ? `${context.age} yrs` : '—'}
                />
                <InfoField label="Gender" value={context.gender} />
              </CardContent>
            </Card>

            <Card className="card-refined gap-3 border-slate-200 py-4">
              <CardHeader className="px-4 pb-0">
                <CardTitle className="text-sm font-black text-slate-800">
                  Order information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2">
                <InfoField label="Order #" value={resolvedOrderNo} />
                <InfoField label="Collection date" value={collectionDate} />
                <InfoField label="Collection time" value={collectionTime} />
                <InfoField label="Priority" value={context.priority} />
                <InfoField label="Expected report" value={context.expectedReport} />
                <InfoField label="Actual report" value={actualReport} />
              </CardContent>
            </Card>

            <Card className="card-refined gap-3 border-slate-200 py-4">
              <CardHeader className="px-4 pb-0">
                <CardTitle className="text-sm font-black text-slate-800">
                  Test information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2">
                <InfoField label="Test" value={resolvedTestName} />
                <InfoField
                  label="Department"
                  value={context.departmentName || 'Laboratory'}
                />
                <InfoField
                  label="Category"
                  value={context.categoryName || activeTest?.testCode || 'Routine Panel'}
                />
                <InfoField label="Sample type" value={context.sampleType} />
                <InfoField label="Result status" value={resultStatus} />
                <InfoField
                  label="Critical"
                  value={hasCritical || context.isCritical ? 'Yes' : 'No'}
                />
              </CardContent>
            </Card>
          </div>

          {/* Result table */}
          <Card className="card-refined gap-0 overflow-hidden border-slate-200 py-0">
            <CardHeader className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
              <CardTitle className="flex items-center gap-2 text-sm font-black text-slate-800">
                <FileText size={16} className="text-slate-500" />
                Result report
              </CardTitle>
              {abnormalCount > 0 && (
                <Badge
                  variant={hasCritical ? 'danger' : 'warning'}
                  size="md"
                  className="w-fit rounded-full normal-case tracking-normal font-bold"
                >
                  <AlertTriangle size={12} className="mr-1" />
                  {hasCritical ? 'Critical values flagged' : 'Abnormal values flagged'}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table
                columns={columns}
                data={tableData}
                className="rounded-none border-0 bg-white shadow-none"
              />
            </CardContent>
          </Card>

          {/* Clinical notes */}
          <Card className="card-refined gap-3 border-slate-200 py-4">
            <CardHeader className="px-4 pb-0 md:px-5">
              <CardTitle className="text-sm font-black text-slate-800">
                Clinical notes
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-5">
              <p className="text-sm leading-relaxed text-slate-600">
                {clinicalNotes || 'No clinical notes recorded for this test.'}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

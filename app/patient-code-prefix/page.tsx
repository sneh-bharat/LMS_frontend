'use client';

import { useEffect, useState } from 'react';
import { Hash, Loader2, Pencil, RefreshCw } from 'lucide-react';
import { Button, Badge, Input, Label } from '@/components/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RightDrawer } from '@/components/ui/right-drawer';
import {
  useTenantPatientCodeConfig,
  useUpdatePatientCodePrefix,
} from '@/app/Apis/tenant/useTenantPatientCodeConfig';
import type { PatientCodeTenantConfig } from '@/app/Apis/tenant/patientCodeTenantApi';

function queryErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || 'Failed to load tenant configuration';
}

function emptyConfig(): PatientCodeTenantConfig {
  return {
    tenantId: 1,
    isActive: true,
    patientCodePrefix: '',
    patientCodeSequence: 1,
  };
}

export default function PatientCodePrefixPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useTenantPatientCodeConfig();
  const updateMutation = useUpdatePatientCodePrefix();

  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<PatientCodeTenantConfig>(emptyConfig);

  const row = data?.data;

  useEffect(() => {
    if (editOpen && row) {
      setDraft({
        tenantId: row.tenantId,
        isActive: row.isActive,
        patientCodePrefix: row.patientCodePrefix ?? '',
        patientCodeSequence: Number(row.patientCodeSequence) || 1,
      });
    }
  }, [editOpen, row]);

  const openEdit = () => {
    if (row) {
      setDraft({
        tenantId: row.tenantId,
        isActive: row.isActive,
        patientCodePrefix: row.patientCodePrefix ?? '',
        patientCodeSequence: Number(row.patientCodeSequence) || 1,
      });
    } else {
      setDraft(emptyConfig());
    }
    setEditOpen(true);
  };

  const handleSave = async () => {
    const prefix = draft.patientCodePrefix.trim();
    if (!prefix) return;
    try {
      await updateMutation.mutateAsync({ patientCodePrefix: prefix });
      setEditOpen(false);
    } catch {
      /* toast handled in hook */
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-black tracking-tight text-slate-900">
            <span className="text-[#006D77]">Patient</span>{' '}
            <span className="text-highlight">Code Prefix</span>
          </h1>
          <p className="max-w-xl text-sm font-medium text-slate-500 md:text-base">
            Tenant configuration listing. Use <strong>Update</strong> to change the patient code
            prefix;
          </p>
          {data?.message && !isError && (
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#00AC80]">
              {data.message}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void refetch()}
          disabled={isPending || isFetching}
          className="h-12 gap-2 rounded-2xl border-slate-200/80 bg-white px-5 text-xs font-bold uppercase tracking-wider text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden />
          Refresh
        </Button>
      </div>

      <div className="glass overflow-hidden rounded-[2.5rem] border border-white/40 shadow-xl md:shadow-2xl">
        {isPending ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#006D77] border-t-transparent" />
            <p className="text-sm font-bold text-slate-500">Loading tenant configuration…</p>
          </div>
        ) : isError ? (
          <div className="px-8 py-16 text-center">
            <p className="text-sm font-bold text-rose-600">{queryErrorMessage(error)}</p>
            <Button variant="outline" className="mt-4" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Tenant ID
                </TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Patient code prefix
                </TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Sequence
                </TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Active
                </TableHead>
                <TableHead className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!row ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center text-sm font-medium text-slate-500">
                    No configuration returned from the server.
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow className="border-slate-100 transition-colors hover:bg-emerald-50/20">
                  <TableCell className="px-6 py-5 font-mono text-sm font-bold text-slate-800">
                    {row.tenantId}
                  </TableCell>
                  <TableCell className="px-6 py-5 font-bold text-slate-900">{row.patientCodePrefix}</TableCell>
                  <TableCell className="px-6 py-5 font-mono text-sm font-bold text-slate-700">
                    {row.patientCodeSequence}
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <Badge variant={row.isActive ? 'success' : 'secondary'} size="sm">
                      <span
                        className={`mr-1.5 inline-block size-1.5 rounded-full ${row.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
                      />
                      {row.isActive ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openEdit}
                      className="gap-2 rounded-xl border-[#006D77]/25 font-bold text-[#006D77] hover:bg-[#006D77]/5"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <RightDrawer
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Update patient code prefix"
        description="PUT /api/v1/tenant-config/patient-code-prefix"
        maxWidth="md"
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="gradient"
              onClick={() => void handleSave()}
              disabled={updateMutation.isPending || !draft.patientCodePrefix.trim()}
              className="min-w-[120px] gap-2"
            >
              {updateMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              Save
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 bg-white text-[#006D77] shadow-sm">
              <Hash className="size-6" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tenant</p>
              <p className="font-mono text-lg font-black text-slate-900">#{draft.tenantId}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="drawer-prefix" className="label-refined">
              Patient code prefix
            </Label>
            <Input
              id="drawer-prefix"
              value={draft.patientCodePrefix}
              onChange={(e) => setDraft((d) => ({ ...d, patientCodePrefix: e.target.value }))}
              maxLength={32}
              className="h-12 rounded-2xl border-slate-200/60 bg-white font-semibold focus-visible:border-[#006D77] focus-visible:ring-[#006D77]/20"
            />
          </div>

          <div className="space-y-2">
            <p className="label-refined">Patient code sequence</p>
            <div className="flex h-12 items-center rounded-2xl border border-slate-200/60 bg-slate-50 px-4 font-mono text-sm font-bold text-slate-700">
              {draft.patientCodeSequence}
            </div>
            <p className="text-xs font-medium text-slate-400">
              Read-only here; this API only updates the prefix.
            </p>
          </div>

          <div className="space-y-2">
            <p className="label-refined">Configuration active</p>
            <div className="flex h-12 items-center gap-2 rounded-2xl border border-slate-200/60 bg-slate-50 px-4">
              <Badge variant={draft.isActive ? 'success' : 'secondary'} size="sm">
                {draft.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-xs text-slate-500">From tenant config (GET)</span>
            </div>
          </div>
        </div>
      </RightDrawer>
    </div>
  );
}

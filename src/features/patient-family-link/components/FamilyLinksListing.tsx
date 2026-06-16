'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Link2,
  Loader,
  User,
  Users,
  Phone,
  UserPlus,
  RefreshCw,
  Database,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import type { Patient } from '@/app/Apis/Patients/Patient_Service_API';
import { sanitizeMiddleName } from '@/app/Apis/Patients/patientDisplayUtils';
import type { PatientFamilyLinkRow } from '\.\.\/services\/family\-link\.service';
import {
  useFamilyLinksByPatientId,
  usePatientForFamilyLinkHeader,
  useDeleteFamilyLink,
} from '\.\.\/services\/family\-link\.service';

function patientHeading(p: Patient | null): string {
  if (!p) return '';
  const parts = [p.firstName, sanitizeMiddleName(p.middleName), p.lastName].filter(Boolean);
  return parts.join(' ').trim() || p.patientCode;
}

export default function FamilyLinksListing() {
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get('patientId');

  const parsedPatientId = useMemo(() => {
    if (patientIdParam == null || patientIdParam === '') return null;
    const n = parseInt(patientIdParam, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [patientIdParam]);

  const linksQuery = useFamilyLinksByPatientId(parsedPatientId);
  const patientQuery = usePatientForFamilyLinkHeader(parsedPatientId);
  const deleteMutation = useDeleteFamilyLink();

  const [unlinkRow, setUnlinkRow] = useState<PatientFamilyLinkRow | null>(null);

  const hasPatient = parsedPatientId != null;
  const loadError =
    linksQuery.error instanceof Error
      ? linksQuery.error.message
      : patientQuery.error instanceof Error
        ? patientQuery.error.message
        : null;
  const listLoading = hasPatient && !loadError && (linksQuery.isPending || patientQuery.isPending);
  const refetching = linksQuery.isFetching || patientQuery.isFetching;

  const rows: PatientFamilyLinkRow[] = linksQuery.data?.rows ?? [];
  const listMessage = linksQuery.data?.message ?? null;
  const anchorPatient = patientQuery.data ?? null;

  const closeUnlinkDialog = () => {
    if (deleteMutation.isPending) return;
    setUnlinkRow(null);
  };

  const handleConfirmUnlink = () => {
    if (!unlinkRow) return;
    deleteMutation.mutate(
      { patientId: unlinkRow.patientId, familyMemberId: unlinkRow.familyMemberId },
      { onSuccess: () => setUnlinkRow(null) }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/register-patient" className='mb-10 block w-fit'>
        <Button variant="outline" size="sm" className="gap-2 shadow-sm px-6">
          <ArrowLeft size={16} />
          Back to Patients
        </Button>
      </Link>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

        <div className='space-y-2'>

          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Patient <span className="text-emerald-600">Family Links</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Open from <strong className="text-slate-700">Patient Registry</strong> using{' '}
            <strong className="text-slate-700">Family link</strong> on a row. Use{' '}
            <strong>Add family link</strong> to create a new relationship.
          </p>
        </div>
        {hasPatient ? (
          <Link href={`/patient-family-link?patientId=${parsedPatientId}&add=1`}>
            <Button variant="gradient" size="sm" className="gap-2 shadow-sm px-6">
              <UserPlus size={16} />
              Add family link
            </Button>
          </Link>
        ) : null}
      </div>

      {!hasPatient ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 md:p-12 flex flex-col items-center text-center gap-5 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Users size={32} aria-hidden />
          </div>
          <div className="space-y-2">
            <p className="text-slate-900 font-bold text-lg tracking-tight">Select a patient to continue</p>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Family links are listed per patient. Open the{' '}
              <strong className="text-slate-700">Patient Registry</strong>, find the patient you need, then
              use the <strong className="text-slate-700">Family link</strong> icon on their row to open this
              page with that patient selected.
            </p>
          </div>
          <Link href="/register-patient">
            <Button variant="gradient" size="sm" className="gap-2 shadow-sm px-8 min-w-[220px] justify-center">
              <User size={16} aria-hidden />
              Go to Patient Registry
            </Button>
          </Link>
        </div>
      ) : null}

      {hasPatient ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0">
                <User size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient</p>
                <p className="text-sm font-bold text-slate-900">
                  {patientQuery.isPending ? '…' : patientHeading(anchorPatient) || `ID ${parsedPatientId}`}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="secondary" className="px-2 py-0.5 border-slate-200 text-[9px] font-bold uppercase">
                    ID: {parsedPatientId}
                  </Badge>
                  {anchorPatient?.patientCode ? (
                    <span className="text-[10px] font-mono text-slate-500 font-bold">{anchorPatient.patientCode}</span>
                  ) : null}
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => {
                void linksQuery.refetch();
                void patientQuery.refetch();
              }}
              disabled={refetching}
            >
              <RefreshCw size={16} className={refetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </div>

          {loadError ? (
            <div className="p-6 text-sm font-semibold text-rose-700 bg-rose-50/80 border-b border-rose-100">
              {loadError}
            </div>
          ) : null}

          {!loadError && listLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4">
              <Loader className="text-slate-400 animate-spin" size={32} />
              <p className="text-slate-600 font-medium text-sm">Loading family links…</p>
            </div>
          ) : !loadError && rows.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <Link2 size={28} />
              </div>
              <p className="text-slate-900 font-semibold">No family links yet</p>
              <p className="text-slate-500 text-sm font-medium max-w-sm">
                {listMessage || 'There are no linked family members for this patient.'}
              </p>
              <Link href={`/patient-family-link?patientId=${parsedPatientId}&add=1`}>
                <Button variant="gradient" size="sm" className="gap-2 mt-2">
                  <UserPlus size={16} />
                  Add first link
                </Button>
              </Link>
            </div>
          ) : !loadError ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        Link ID
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Patient
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Family member
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                        Relation
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-5 align-top">
                          <Badge
                            variant="secondary"
                            className="px-2 py-0.5 border-slate-200 text-[9px] font-bold uppercase font-mono"
                          >
                            {row.id}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-emerald-700 transition-colors">
                            {row.patientName}
                          </div>
                          <div className="mt-1 space-y-0.5 text-[11px] text-slate-600 font-medium">
                            {row.patientUhid ? (
                              <div className="font-mono text-slate-500">{row.patientUhid}</div>
                            ) : null}
                            {row.patientMobile ? (
                              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                                <Phone size={10} className="text-emerald-500 shrink-0" />
                                {row.patientMobile}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-emerald-700 transition-colors">
                            {row.familyMemberName}
                          </div>
                          <div className="mt-1 space-y-0.5 text-[11px] text-slate-600 font-medium">
                            {row.familyMemberUhid ? (
                              <div className="font-mono text-slate-500">{row.familyMemberUhid}</div>
                            ) : null}
                            {row.familyMemberMobile ? (
                              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                                <Phone size={10} className="text-emerald-500 shrink-0" />
                                {row.familyMemberMobile}
                              </div>
                            ) : null}
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-0.5">
                              Member ID {row.familyMemberId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center align-top">
                          <Badge variant="success" className="px-2 py-0.5 text-[10px] font-bold uppercase">
                            {row.relation}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-center align-top">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 rounded-lg border-rose-200 font-bold text-rose-700 hover:bg-rose-50"
                            title="Unlink family member"
                            onClick={() => setUnlinkRow(row)}
                          >
                            <Trash2 size={12} aria-hidden />
                            Unlink
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">
                      {rows.length} Family link{rows.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="hidden xl:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Database size={12} aria-hidden />
                    Patient ID {parsedPatientId}
                  </div>
                </div>
                {listMessage ? (
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight text-right max-w-md">
                    {listMessage}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      <DeleteAlertDialog
        isOpen={Boolean(unlinkRow)}
        onClose={closeUnlinkDialog}
        onConfirm={handleConfirmUnlink}
        title="Unlink your family"
        description={
          unlinkRow
            ? `This removes the ${unlinkRow.relation} link between ${unlinkRow.patientName} and ${unlinkRow.familyMemberName}. Patient records are not deleted.`
            : 'Remove this family link? Patient records are not deleted.'
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

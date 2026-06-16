'use client';

/**
 * Referring doctors directory — layout matches Patient Registry / family-links theme.
 * List data: GET `/api/v1/referring-doctors` (paginated).
 */
import { useEffect, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import {
  Stethoscope,
  Search,
  Settings,
  UserPlus,
  ChevronDown,
  Filter,
  Phone,
  MapPin,
  Mail,
  Loader,
  RefreshCw,
  Database,
  AlertCircle,
  Eye,
  Percent,
  Pencil,
  Building2,
  Wallet,
  History,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { Input, Label } from '@/components/ui';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useReferringDoctorsList, useDeleteReferringDoctor } from '@/app/Apis/doctor/useReferringDoctors';
import type { ReferringDoctor } from '@/app/Apis/doctor/referringDoctorApi';
import AddDoctor from '../components/add_doctor';
import { DoctorDetails } from '../components/doctot-details';
import Commission from '../components/Commission';
import ActiveDepartment from '../components/ActiveDepartment';
import GetTestCommission from '../components/GetTestCommission';
import SpecificDateRange from '../components/SpecificDateRange';
import GetPaymentHistory from '../components/GetPaymentHistory';
import { fetchDoctorCommissions, type DoctorCommission } from '@/app/Apis/Commission/commissionPrice';
import { doctorCommissionQueryKeys } from '@/app/Apis/Commission/useDoctorCommission';
import PayDoctorCommission from '../components/PayDoctorCommission';

type CommissionDrawerState = {
  doctorId: number;
  doctorName: string;
  commissionId?: number | null;
  initialCommission?: DoctorCommission;
};

const PAGE_SIZE = 10;

function DoctorActions({
  row,
  hasCommission,
  onView,
  onDepartments,
  onCommissionCreate,
  onCommissionEdit,
  onTestCommissions,
  onCommissionPay,
  onPayCommission,
  onPaymentHistory,
}: {
  row: ReferringDoctor;
  hasCommission: boolean;
  onView: (row: ReferringDoctor) => void;
  onDepartments: (row: ReferringDoctor) => void;
  onCommissionCreate: (row: ReferringDoctor) => void;
  onCommissionEdit: (row: ReferringDoctor) => void;
  onTestCommissions: (row: ReferringDoctor) => void;
  /** Opens date-range commission calculation (`fetchDoctorCommissionPayByRange`). */
  onCommissionPay: (row: ReferringDoctor) => void;
  /** Opens mark-paid commission form. */
  onPayCommission: (row: ReferringDoctor) => void;
  onPaymentHistory: (row: ReferringDoctor) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            aria-label="Doctor actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={20} />
          </button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="min-w-52 p-1.5 rounded-2xl border-slate-100 shadow-2xl"
      >
        <DropdownMenuItem
          onClick={() => onView(row)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
        >
          <Eye size={14} />
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDepartments(row)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-sky-600 focus:bg-sky-50 focus:text-sky-700"
        >
          <Building2 size={14} />
          Departments
        </DropdownMenuItem>
        {!hasCommission ? (
          <DropdownMenuItem
            onClick={() => onCommissionCreate(row)}
            className="rounded-lg py-2.5 text-xs font-black uppercase text-amber-600 focus:bg-amber-50 focus:text-amber-700"
          >
            <Percent size={14} />
            Commission
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => onCommissionEdit(row)}
              className="rounded-lg py-2.5 text-xs font-black uppercase text-amber-600 focus:bg-amber-50 focus:text-amber-700"
            >
              <Pencil size={14} />
              Edit Commission %
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onTestCommissions(row)}
              className="rounded-lg py-2.5 text-xs font-black uppercase text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
            >
              <Percent size={14} />
              Test Commissions
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onCommissionPay(row)}
              className="rounded-lg py-2.5 text-xs font-black uppercase text-[#ff671f] focus:bg-violet-50 focus:text-violet-700"
            >
              <Wallet size={14} />
              Calculate to Commission 
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onPaymentHistory(row)}
              className="rounded-lg py-2.5 text-xs font-black uppercase text-indigo-600 focus:bg-indigo-50 focus:text-indigo-700"
            >
              <History size={14} />
              Payment History
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onPayCommission(row)}
              className="rounded-lg py-2.5 text-xs font-black uppercase text-indigo-600 focus:bg-indigo-50 focus:text-indigo-700"
            >
              <Wallet size={14} />
              Pay Commission
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DoctorsPage() {
  const [pageNo, setPageNo] = useState(0);
  const [branchIdInput, setBranchIdInput] = useState('');
  const [doctorDrawer, setDoctorDrawer] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });
  const [searchBy, setSearchBy] = useState<'Name' | 'Mobile'>('Name');
  const [searchText, setSearchText] = useState('');
  const [doctorToDelete, setDoctorToDelete] = useState<{ id: number; doctorName: string } | null>(null);
  const [detailsDoctorId, setDetailsDoctorId] = useState<number | null>(null);
  const [commissionDoctor, setCommissionDoctor] = useState<CommissionDrawerState | null>(null);
  const [payCommissionDoctor, setPayCommissionDoctor] = useState<{ id: number; doctorName: string } | null>(null);
  const [activeDeptDoctor, setActiveDeptDoctor] = useState<{ id: number; doctorName: string } | null>(null);
  const [testCommissionDoctor, setTestCommissionDoctor] = useState<{ id: number; doctorName: string } | null>(
    null
  );
  const openPayCommission = (doc: { id: number; doctorName: string }) => {
    setPayCommissionDoctor({ id: doc.id, doctorName: doc.doctorName });
  };
  const closePayCommission = () => setPayCommissionDoctor(null);
  const [commissionPayDoctor, setCommissionPayDoctor] = useState<{ id: number; doctorName: string } | null>(
    null
  );
  const [paymentHistoryDoctor, setPaymentHistoryDoctor] = useState<{ id: number; doctorName: string } | null>(
    null
  );

  const deleteMutation = useDeleteReferringDoctor();

  const branchIdForApi = useMemo(() => {
    const t = branchIdInput.trim();
    if (t === '') return undefined;
    const n = Number(t);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [branchIdInput]);

  useEffect(() => {
    setPageNo(0);
  }, [branchIdForApi]);

  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useReferringDoctorsList({
    pageNo,
    pageSize: PAGE_SIZE,
    branchId: branchIdForApi,
  });

  const [flashApiMessage, setFlashApiMessage] = useState<string | null>(null);

  useEffect(() => {
    const msg = data?.message?.trim();
    if (!msg || !dataUpdatedAt) return;
    setFlashApiMessage(msg);
    const timer = window.setTimeout(() => setFlashApiMessage(null), 2000);
    return () => window.clearTimeout(timer);
  }, [data?.message, dataUpdatedAt]);

  const page = data?.data;
  const rows = page?.content ?? [];

  const filteredRows = useMemo(() => {
    const t = searchText.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((d) => {
      if (searchBy === 'Mobile') {
        const digits = t.replace(/\D/g, '');
        const m = (d.doctorPhone ?? '').replace(/\D/g, '');
        return m.includes(digits) || (d.doctorPhone ?? '').includes(searchText.trim());
      }
      return d.doctorName.toLowerCase().includes(t);
    });
  }, [rows, searchText, searchBy]);

  const pageDoctorIds = useMemo(
    () => filteredRows.map((d) => d.id).filter((id) => id > 0),
    [filteredRows]
  );

  const commissionChecks = useQueries({
    queries: pageDoctorIds.map((id) => ({
      queryKey: doctorCommissionQueryKeys.byDoctor(id),
      queryFn: () => fetchDoctorCommissions(id),
      staleTime: 30_000,
      enabled: !isLoading && id > 0,
    })),
  });

  /** Doctors who already have at least one commission — hide create Commission button. */
  const doctorIdsWithCommission = useMemo(() => {
    const set = new Set<number>();
    commissionChecks.forEach((query, index) => {
      const id = pageDoctorIds[index];
      if (id && (query.data?.data?.length ?? 0) > 0) {
        set.add(id);
      }
    });
    return set;
  }, [commissionChecks, pageDoctorIds]);

  const openEdit = (doc: { id: number }) => {
    setDetailsDoctorId(null);
    setDoctorDrawer({ open: true, id: doc.id });
  };

  const openDetails = (doc: { id: number }) => {
    setDetailsDoctorId(doc.id);
  };

  const closeDetails = () => setDetailsDoctorId(null);

  const openCommissionCreate = (doc: { id: number; doctorName: string }) => {
    setCommissionDoctor({ doctorId: doc.id, doctorName: doc.doctorName, commissionId: null });
  };

  const openCommissionEdit = (doc: { id: number; doctorName: string }, commission: DoctorCommission) => {
    setCommissionDoctor({
      doctorId: doc.id,
      doctorName: doc.doctorName,
      commissionId: commission.id,
      initialCommission: commission,
    });
  };

  const openCommissionEditFromRow = (doc: ReferringDoctor) => {
    const index = pageDoctorIds.indexOf(doc.id);
    const rules = index >= 0 ? commissionChecks[index]?.data?.data : undefined;
    const first = rules?.[0];
    if (!first) {
      toast.error('No commission rule found for this doctor.');
      return;
    }
    openCommissionEdit({ id: doc.id, doctorName: doc.doctorName }, first);
  };

  const closeCommission = () => setCommissionDoctor(null);

  const openActiveDepartments = (doc: { id: number; doctorName: string }) => {
    setActiveDeptDoctor({ id: doc.id, doctorName: doc.doctorName });
  };

  const closeActiveDepartments = () => setActiveDeptDoctor(null);

  const openTestCommissions = (doc: { id: number; doctorName: string }) => {
    setTestCommissionDoctor({ id: doc.id, doctorName: doc.doctorName });
  };

  const closeTestCommissions = () => setTestCommissionDoctor(null);

  const openCommissionPay = (doc: { id: number; doctorName: string }) => {
    setCommissionPayDoctor({ id: doc.id, doctorName: doc.doctorName });
  };

  const closeCommissionPay = () => setCommissionPayDoctor(null);

  const openPaymentHistory = (doc: { id: number; doctorName: string }) => {
    setPaymentHistoryDoctor({ id: doc.id, doctorName: doc.doctorName });
  };

  const closePaymentHistory = () => setPaymentHistoryDoctor(null);

  const openAdd = () => setDoctorDrawer({ open: true, id: null });

  const closeDoctorDrawer = () => setDoctorDrawer({ open: false, id: null });

  const openDeleteDialog = (doc: { id: number; doctorName: string }) => {
    setDoctorToDelete({ id: doc.id, doctorName: doc.doctorName });
  };

  const closeDeleteDialog = () => {
    if (deleteMutation.isPending) return;
    setDoctorToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!doctorToDelete) return;
    const { id, doctorName } = doctorToDelete;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`Deleted: ${doctorName}`);
        setDoctorToDelete(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to delete doctor.');
      },
    });
  };

  const totalPages = page?.totalPages ?? 0;
  const totalElements = page?.totalElements ?? 0;
  const canPrev = pageNo > 0;
  const canNext = page ? !page.last : false;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Referring <span className="text-emerald-600">Doctors</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Manage referring physicians, login access, and marketing associations for your network.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="gradient" size="sm" className="gap-2 shadow-sm px-8" onClick={openAdd}>
            <UserPlus size={16} aria-hidden />
            New doctor
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div className="relative flex-1 group w-full min-w-0">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={18}
            aria-hidden
          />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={searchBy === 'Mobile' ? 'Search by mobile…' : 'Search by doctor name…'}
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
            aria-label="Search doctors"
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
          <div className="relative flex-1 sm:min-w-[140px] group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as 'Name' | 'Mobile')}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
              aria-label="Search field"
              disabled={isLoading}
            >
              <option value="Name">Name</option>
              <option value="Mobile">Mobile</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg p-2.5 border-slate-200 shrink-0"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            title="Refresh list"
          >
            <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
          </Button>
        </div>
        {flashApiMessage ? (
          <span className="text-xs font-medium text-emerald-700 ml-auto shrink-0 animate-in fade-in duration-300">
            {flashApiMessage}
          </span>
        ) : null}
      </div>

      {isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800">
          <AlertCircle size={18} className="shrink-0" aria-hidden />
          <span className="font-medium">{error instanceof Error ? error.message : 'Failed to load doctors.'}</span>
          <Button type="button" variant="outline" size="sm" className="ml-auto font-bold" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
          <Loader className="text-slate-400 animate-spin" size={32} />
          <p className="text-slate-600 font-medium">Loading referring doctors…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-600 font-medium">
          No referring doctors found for this filter or page.
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-14">
                    #
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Name, specialization & hospital
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobile</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    Branch
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500 font-medium text-sm">
                      No matches on this page for your search. Clear search or change page.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5 text-center">
                        <Badge variant="secondary" className="px-2 py-0.5 border-slate-200 text-[10px] font-bold font-mono">
                          {doc.id}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[#006D77] group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                            <Stethoscope size={18} aria-hidden />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-emerald-700 transition-colors">
                              {doc.doctorName}
                              {doc.specialization ? (
                                <span className="font-semibold text-slate-500 ml-2">{doc.specialization}</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 max-w-[200px]">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold truncate">
                          <Mail size={12} className="text-emerald-500 shrink-0" aria-hidden />
                          <span className="truncate">{doc.doctorEmail || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                          <Phone size={12} className="text-emerald-500 shrink-0" aria-hidden />
                          {doc.doctorPhone}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center text-xs font-mono font-bold text-slate-600">
                        {doc.branchName}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Badge
                          variant={doc.isActive ? 'default' : 'secondary'}
                          className={
                            doc.isActive
                              ? 'bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold'
                              : 'text-[10px] font-bold'
                          }
                        >
                          {doc.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <DoctorActions
                          row={doc}
                          hasCommission={doctorIdsWithCommission.has(doc.id)}
                          onView={openDetails}
                          onDepartments={openActiveDepartments}
                          onCommissionCreate={openCommissionCreate}
                          onCommissionEdit={openCommissionEditFromRow}
                          onTestCommissions={openTestCommissions}
                          onCommissionPay={openCommissionPay}
                          onPayCommission={openPayCommission}
                          onPaymentHistory={openPaymentHistory}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Database size={14} className="text-emerald-600 shrink-0" aria-hidden />
              <span>
                Page {pageNo + 1} of {Math.max(totalPages, 1)}
                <span className="text-slate-400 mx-2">·</span>
                {totalElements} total
              </span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-bold border-slate-200"
                disabled={!canPrev || isFetching}
                onClick={() => setPageNo((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-bold border-slate-200"
                disabled={!canNext || isFetching}
                onClick={() => setPageNo((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <DoctorDetails
        isOpen={detailsDoctorId != null}
        doctorId={detailsDoctorId}
        onClose={closeDetails}
        onEdit={(id) => {
          closeDetails();
          setDoctorDrawer({ open: true, id });
        }}
        onDelete={(id) => {
          const doc = rows.find((d) => d.id === id);
          closeDetails();
          if (doc) openDeleteDialog(doc);
        }}
      />

      <ActiveDepartment
        isOpen={activeDeptDoctor != null}
        doctorId={activeDeptDoctor?.id ?? null}
        doctorName={activeDeptDoctor?.doctorName}
        onClose={closeActiveDepartments}
        onAddCommission={() => {
          if (!activeDeptDoctor) return;
          const { id, doctorName } = activeDeptDoctor;
          closeActiveDepartments();
          setCommissionDoctor({ doctorId: id, doctorName, commissionId: null });
        }}
        onEditCommission={(commission) => {
          if (!activeDeptDoctor) return;
          const { id, doctorName } = activeDeptDoctor;
          closeActiveDepartments();
          openCommissionEdit({ id, doctorName }, commission);
        }}
        onViewTestCommissions={() => {
          if (!activeDeptDoctor) return;
          const { id, doctorName } = activeDeptDoctor;
          closeActiveDepartments();
          openTestCommissions({ id, doctorName });
        }}
      />

      <GetTestCommission
        isOpen={testCommissionDoctor != null}
        doctorId={testCommissionDoctor?.id ?? null}
        doctorName={testCommissionDoctor?.doctorName}
        onClose={closeTestCommissions}
      />

      <SpecificDateRange
        isOpen={commissionPayDoctor != null}
        doctorId={commissionPayDoctor?.id ?? null}
        doctorName={commissionPayDoctor?.doctorName}
        onClose={closeCommissionPay}
      />

      <GetPaymentHistory
        isOpen={paymentHistoryDoctor != null}
        doctorId={paymentHistoryDoctor?.id ?? null}
        doctorName={paymentHistoryDoctor?.doctorName}
        onClose={closePaymentHistory}
      />

      <Commission
        isOpen={commissionDoctor != null}
        doctorId={commissionDoctor?.doctorId ?? null}
        doctorName={commissionDoctor?.doctorName}
        commissionId={commissionDoctor?.commissionId ?? null}
        initialCommission={commissionDoctor?.initialCommission ?? null}
        onClose={closeCommission}
      />

      <AddDoctor
        isOpen={doctorDrawer.open}
        doctorId={doctorDrawer.id}
        onClose={closeDoctorDrawer}
        doctorsForDuplicateCheck={rows}
      />
      <PayDoctorCommission
          isOpen={payCommissionDoctor != null}
          onClose={closePayCommission}
          doctorId={payCommissionDoctor?.id ?? null}
          doctorName={payCommissionDoctor?.doctorName}
        />
      

      <DeleteAlertDialog
        isOpen={Boolean(doctorToDelete)}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete referring doctor"
        description={
          doctorToDelete
            ? `Remove "${doctorToDelete.doctorName}" from your referring doctors? This cannot be undone.`
            : 'Are you sure you want to delete this referring doctor?'
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

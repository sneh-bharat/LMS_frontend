'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
  Settings,
  ChevronDown,
  Zap,
  CheckCircle,
  Eye,
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import {
  fetchReflexRules,
  createReflexRule,
  deleteReflexRule,
  toggleReflexRuleStatus,
  type ReflexRule,
  type CreateReflexRuleInput,
} from '@/features/lab/services/lab.service';
import AddReflexRule from './add-reflex-rule';
import EditReflexRule from './edit-reflex-rule';
import ReflexRuleDetailsView from './view-details';

// ─── Components ───────────────────────────────────────────────────────────────
function ReflexRuleActions({
  rule,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  rule: ReflexRule;
  onView: (rule: ReflexRule) => void;
  onEdit: (rule: ReflexRule) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, isActive: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 224 + window.scrollX,
      });
    }
  }, [open]);

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-emerald-50 rounded-lg transition-all text-slate-400 hover:text-emerald-600 hover:shadow-sm"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <button
              onClick={() => {
                onView(rule);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              <Eye size={16} strokeWidth={2} />
              <span>View Details</span>
            </button>
            <button
              onClick={() => {
                onEdit(rule);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              <Edit2 size={16} strokeWidth={2} />
              <span>Edit Rule</span>
            </button>
            <button
              onClick={() => {
                onToggleStatus(rule.id, rule.isActive);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              <CheckCircle size={16} strokeWidth={2} />
              <span>{rule.isActive ? 'Deactivate' : 'Activate'}</span>
            </button>
            <div className="h-px bg-slate-100 my-1"></div>
            <button
              onClick={() => {
                onDelete(rule.id);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <Trash2 size={16} strokeWidth={2} />
              <span>Delete Rule</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ReflexRulePage() {
  const [rules, setRules] = useState<ReflexRule[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ReflexRule | null>(null);
  const [viewingRule, setViewingRule] = useState<ReflexRule | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);

  // Debounced loadRules function
  const loadRulesDebounced = useRef(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchTerm: string, page: number, status: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          loadRules(searchTerm, page, status);
        }, 300);
      };
    })()
  );

  const loadRules = async (
    searchTerm?: string,
    page?: number,
    status?: string
  ) => {
    setLoading(true);
    try {
      const currentSearch = searchTerm ?? search;
      const currentPageNum = page ?? currentPage;
      const currentStatus = status ?? statusFilter;

      const response = await fetchReflexRules(
        currentPageNum,
        pageSize,
        currentSearch || undefined,
        currentStatus
      );

      if (response?.data?.content) {
        setRules(response.data.content);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } else {
        setRules([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Failed to load reflex rules:', error);
      setRules([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial load only
  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      loadRules();
    }
  }, []);

  // Reload when page or status filter changes (not on initial render)
  useEffect(() => {
    if (!isFirstRender) {
      loadRules();
    }
  }, [currentPage, statusFilter]);

  // Debounced search
  useEffect(() => {
    if (isFirstRender) return;

    setCurrentPage(0);
    loadRulesDebounced.current(search, 0, statusFilter);
  }, [search]);

  const handleSearch = () => {
    setCurrentPage(0);
    loadRules();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSubmit = async (data: CreateReflexRuleInput) => {
    try {
      // Only create new rules here - edit is handled by EditReflexRule component
      await createReflexRule(data);
      handleCloseModal();
      loadRules();
    } catch (error) {
      console.error('Failed to create reflex rule:', error);
    }
  };

  const handleEdit = (rule: ReflexRule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleViewDetails = (rule: ReflexRule) => {
    setViewingRule(rule);
    setIsDetailsOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeletingRuleId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRuleId) return;

    setIsDeleting(true);
    try {
      await deleteReflexRule(deletingRuleId);
      loadRules();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete reflex rule:', error);
    } finally {
      setIsDeleting(false);
      setDeletingRuleId(null);
    }
  };

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      await toggleReflexRuleStatus(id, !isActive);
      loadRules();
    } catch (error) {
      console.error('Failed to toggle rule status:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
  };

  // Helper function to get condition badge variant
  const getConditionBadgeVariant = (conditionType: string) => {
    switch (conditionType) {
      case 'CRITICAL':
        return 'destructive';
      case 'ABOVE':
      case 'BELOW':
        return 'warning';
      case 'BETWEEN':
        return 'primary';
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
    if (rule.conditionType === 'ABOVE') {
      return `> ${rule.thresholdValue}`;
    }
    if (rule.conditionType === 'BELOW') {
      return `< ${rule.thresholdValue}`;
    }
    return rule.thresholdValue?.toString() || '-';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Reflex <span className="text-[#FF671F]">Rules</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Automated test ordering based on laboratory results. Configure rules for reflex testing workflows.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="gradient"
            size="sm"
            className="gap-2 shadow-sm px-8"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} /> Create Rule
          </Button>
        </div>
      </div>

      {/* ═══ CONTROL BAR ════════════════════════════════════════ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search rules..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-40 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg p-2.5 border-slate-200"
            onClick={handleSearch}
          >
            <Settings size={18} />
          </Button>
        </div>
      </div>

      {/* ═══ RULES TABLE ═══════════════════════════════════════ */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Priority
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Test Name
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Condition
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Threshold
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Reflex Test
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Logic
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Auto Order
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                      <span>Loading reflex rules...</span>
                    </div>
                  </td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Zap size={32} className="text-slate-300" />
                      <p>No reflex rules found. Create your first rule to automate test ordering.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {rule.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {rule.testName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {rule.testCode}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={getConditionBadgeVariant(rule.conditionType)}
                        className="text-[10px] font-bold"
                      >
                        {rule.conditionType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-slate-700 font-mono">
                        {formatThreshold(rule)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-900">
                          {rule.reflexTestName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {rule.reflexTestCode}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-700">
                        {rule.logicOperator}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {rule.autoOrder ? (
                        <span className="text-emerald-600">
                          <CheckCircle size={18} />
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={rule.isActive ? 'success' : 'secondary'}
                        className="text-[10px] font-bold"
                      >
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ReflexRuleActions
                        rule={rule}
                        onView={handleViewDetails}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ═══ FOOTER ═════════════════════════════════════════════ */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>
              Showing {rules.length} of {totalElements} Rules
            </span>
            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
            <span className="text-[#FF671F]">Reflex Rules v1.0</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="px-4 py-1 text-[10px]"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              Prev
            </Button>
            <span className="px-4 py-1 text-xs font-bold text-slate-600">
              Page {currentPage + 1} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="px-4 py-1 text-[10px]"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ CREATE RIGHT DRAWER ═══════════════════════════════════ */}
      <AddReflexRule
        isOpen={isModalOpen && !editingRule}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      {/* ═══ EDIT RIGHT DRAWER ═══════════════════════════════════ */}
      <EditReflexRule
        isOpen={isModalOpen && !!editingRule}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
          loadRules();
        }}
        editData={editingRule}
      />

      {/* ═══ VIEW DETAILS RIGHT DRAWER ═══════════════════════════════════ */}
      <ReflexRuleDetailsView
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setViewingRule(null);
        }}
        ruleData={viewingRule}
      />

      {/* ═══ DELETE CONFIRMATION DIALOG ═══════════════════════════════════ */}
      <DeleteAlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingRuleId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Reflex Rule"
        description="Are you sure you want to permanently delete this reflex rule? This action cannot be undone and will affect automated test ordering."
        isLoading={isDeleting}
      />
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
  Settings,
  LayoutGrid,
  ChevronDown,
  Eye,
  Building2,
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import {
  departmentApi,
  type Department,
  type CreateDepartmentInput,
} from '@/app/Apis/lab/departmentApi';
import AddDepartment from './new-department';
import { DepartmentDetails } from '../department/details-view';
// ─── Components ───────────────────────────────────────────────────────────────
function DepartmentActions({
  department,
  onView,
  onEdit,
  onDelete,
}: {
  department: Department;
  onView: (department: Department) => void;
  onEdit: (department: Department) => void;
  onDelete: (id: number) => void;
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
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          <div 
            className="fixed w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <button
              onClick={() => {
                onView(department);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-3 transition-colors"
            >
              <Eye size={16} strokeWidth={2} />
              <span>View Details</span>
            </button>
            <button
              onClick={() => {
                onEdit(department);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              <Edit2 size={16} strokeWidth={2} />
              <span>Edit Department</span>
            </button>
            <div className="h-px bg-slate-100 my-1"></div>
            <button
              onClick={() => {
                onDelete(department.id);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <Trash2 size={16} strokeWidth={2} />
              <span>Delete Department</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<number | null>(null);
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<CreateDepartmentInput>({
    departmentCode: '',
    departmentName: '',
    departmentNameShort: '',
    description: '',
    displayOrder: 1,
    isActive: true,
    branchId: 1,
    location: '',
    tenantId: 2,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDepartments();
  }, [currentPage, statusFilter]);

  // Auto-search when typing (debounce with 300ms)
  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    if (search && search.trim().length >= 2) {
      const timer = setTimeout(() => {
        setCurrentPage(0);
        loadDepartments();
      }, 300);
      setSearchDebounceTimer(timer);
    } else if (search === '' || search.trim().length === 0) {
      const timer = setTimeout(() => {
        setCurrentPage(0);
        loadDepartments();
      }, 300);
      setSearchDebounceTimer(timer);
    }

    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [search]);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      let response;
      
      if (search && search.trim()) {
        response = await departmentApi.getAllDepartments({
          pageNo: currentPage,
          pageSize: pageSize,
          search: search,
          status: statusFilter
        });
      } else if (statusFilter === 'Active') {
        // Use the active departments endpoint
        response = await departmentApi.getActiveDepartments({
          pageNo: currentPage,
          pageSize: pageSize
        });
      } else if (statusFilter === 'Inactive') {
        // Fetch all departments and filter inactive ones on client side
        response = await departmentApi.getAllDepartments({
          pageNo: currentPage,
          pageSize: 100 // Get more to filter client-side
        });
        // Filter to show only inactive departments
        const inactiveDepartments = response.data.content.filter(dept => !dept.isActive);
        setDepartments(inactiveDepartments);
        setTotalPages(response.data.totalPages);
        setTotalElements(inactiveDepartments.length);
        setLoading(false);
        return;
      } else {
        // Show all departments
        response = await departmentApi.getAllDepartments({
          pageNo: currentPage,
          pageSize: pageSize
        });
      }
      
      setDepartments(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadDepartments();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      departmentCode: department.departmentCode,
      departmentName: department.departmentName,
      departmentNameShort: department.departmentNameShort || '',
      description: department.description,
      displayOrder: department.displayOrder || 1,
      isActive: department.isActive,
      branchId: department.branchId,
      location: department.location || '',
      tenantId: department.tenantId,
    });
    setIsModalOpen(true);
  };

  const handleView = (department: Department) => {
    setViewingDepartment(department);
    setIsDetailsOpen(true);
  };

  const handleEditFromDetails = (department: Department) => {
    setIsDetailsOpen(false);
    setEditingDepartment(department);
    setFormData({
      departmentCode: department.departmentCode,
      departmentName: department.departmentName,
      departmentNameShort: department.departmentNameShort || '',
      description: department.description,
      displayOrder: department.displayOrder || 1,
      isActive: department.isActive,
      branchId: department.branchId,
      location: department.location || '',
      tenantId: department.tenantId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeletingDepartmentId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDepartmentId) return;
    
    try {
      await departmentApi.deleteDepartment(deletingDepartmentId);
      toast.success('Department deleted successfully!');
      loadDepartments();
      setIsDeleteDialogOpen(false);
      setDeletingDepartmentId(null);
    } catch (error: any) {
      console.error('Failed to delete department:', error);
      const errorMessage = error?.response?.data?.message || 
                          'Failed to delete department. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (data: CreateDepartmentInput) => {
    toast.success(editingDepartment ? 'Department updated successfully!' : 'Department created successfully!');
    loadDepartments();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
    setFormData({
      departmentCode: '',
      departmentName: '',
      departmentNameShort: '',
      description: '',
      displayOrder: 1,
      isActive: true,
      branchId: 1,
      location: '',
      tenantId: 2,
    });
    setErrors({});
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Departments
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Manage laboratory departments and organizational structure.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 px-6" suppressHydrationWarning>
            <LayoutGrid size={16} /> Department View
          </Button>
          <Button
            variant="gradient"
            size="sm"
            className="gap-2 shadow-sm px-8"
            onClick={() => setIsModalOpen(true)}
            suppressHydrationWarning
          >
            <Plus size={16} /> Create Department
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
            placeholder="Search departments..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
            suppressHydrationWarning
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-40 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
              suppressHydrationWarning
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
            suppressHydrationWarning
          >
            <Settings size={18} />
          </Button>
        </div>
      </div>

      {/* ═══ DEPARTMENTS TABLE ══════════════════════════════════ */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Code
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Department Name
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Short Name
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Description
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Branch ID
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Display Order
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
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                      <span>Loading departments...</span>
                    </div>
                  </td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No departments found. Create your first department to get started.
                  </td>
                </tr>
              ) : (
                departments.map((department) => (
                  <tr key={department.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600 font-mono hover:text-emerald-600 transition-colors">
                        {department.departmentCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm mb-0.5">
                            {department.departmentName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {department.departmentNameShort || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 line-clamp-1 max-w-xs">
                        {department.description || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {department.branchId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {department.displayOrder || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={department.isActive ? 'success' : 'secondary'}
                        className="text-[10px] font-bold"
                      >
                        {department.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <DepartmentActions
                        department={department}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ═══ FOOTER ═══════════════════════════════════════════ */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>
              Showing {departments.length} of {totalElements} Departments
            </span>
            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
            <span className="text-emerald-600">Laboratory Management</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="px-4 py-1 text-[10px]"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              suppressHydrationWarning
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
              suppressHydrationWarning
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ ADD/EDIT DEPARTMENT MODAL ══════════════════════════ */}
      <AddDepartment
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editData={editingDepartment}
      />

      {/* ═══ DEPARTMENT DETAILS DRAWER ═════════════════════════ */}
      <DepartmentDetails
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setViewingDepartment(null);
        }}
        department={viewingDepartment}
        onEdit={handleEditFromDetails}
      />

      {/* ═══ DELETE CONFIRMATION DIALOG ════════════════════════ */}
      <DeleteAlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingDepartmentId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        description="Are you sure you want to permanently delete this department? This action cannot be undone and all associated data will be lost."
      />
    </div>
  );
}

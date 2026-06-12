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
  LayoutGrid,
  ChevronDown,
  Eye,
  Tag,
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import {
  fetchTestCategories,
  fetchActiveTestCategories,
  searchTestCategoriesByName,
  createTestCategory,
  updateTestCategory,
  deleteTestCategory,
  toggleCategoryStatus,
  type TestCategory,
  type CreateCategoryInput,
} from '@/app/Apis/lab/TestCategories';
import AddCategory from './add-categories';

// ─── Components ───────────────────────────────────────────────────────────────
function CategoryActions({
  category,

  onEdit,
  onDelete,
}: {
  category: TestCategory;

  onEdit: (category: TestCategory) => void;
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
        left: rect.right - 224 + window.scrollX, // 224 = w-56 (14rem = 224px)
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
                onEdit(category);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              <Edit2 size={16} strokeWidth={2} />
              <span>Edit Category</span>
            </button>
            <div className="h-px bg-slate-100 my-1"></div>
            <button
              onClick={() => {
                onDelete(category.id);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <Trash2 size={16} strokeWidth={2} />
              <span>Delete Category</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function TestCategoriesPage() {
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TestCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    categoryCode: '',
    categoryName: '',
    description: '',
    departmentId: 1,
    displayOrder: 1,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isFirstRender = useRef(true);

  // Debounced loadCategories function
  const loadCategoriesDebounced = useRef(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchTerm: string, page: number, filter: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          loadCategories(searchTerm, page, filter);
        }, 300);
      };
    })()
  );

  const loadCategories = async (
    searchTerm?: string,
    page?: number,
    filter?: string
  ) => {
    setLoading(true);
    try {
      let response;
      const currentSearch = searchTerm ?? search;
      const currentPageNum = page ?? currentPage;
      const currentFilter = filter ?? statusFilter;
      
      // If search term exists, use search API
      if (currentSearch && currentSearch.trim().length >= 2) {
        response = await searchTestCategoriesByName(currentSearch, currentPageNum, pageSize, 'categoryId,asc');
      } else if (currentFilter === 'Active') {
        // Use active API endpoint for Active filter
        response = await fetchActiveTestCategories(currentPageNum, pageSize);
      } else if (currentFilter === 'Inactive') {
        // Use regular API with Inactive status filter
        response = await fetchTestCategories(currentPageNum, pageSize, 'Inactive');
      } else {
        // Use regular API for listing (All or no filter)
        response = await fetchTestCategories(currentPageNum, pageSize);
      }
      
      
      // Check if response has the expected structure
      if (response?.data?.content) {
        // Response structure: { data: { content: [], totalPages, totalElements }, message, status, ... }
        setCategories(response.data.content);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } else if ((response as any)?.content) {
        // Fallback: response might be directly the paginated data
        console.warn('Using direct content access');
        const paginatedData = response as any;
        setCategories(paginatedData.content || []);
        setTotalPages(paginatedData.totalPages || 0);
        setTotalElements(paginatedData.totalElements || 0);
      } else {
        // Empty or unexpected structure
        console.warn('Unexpected response structure:', response);
        setCategories([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial load only
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      loadCategories();
    }
  }, []);

  // Reload when page or status filter changes (not on initial render)
  useEffect(() => {
    if (!isFirstRender.current) {
      loadCategories();
    }
  }, [currentPage, statusFilter]);

  // Debounced search
  useEffect(() => {
    if (isFirstRender.current) return; // Skip on initial render

    // Reset to page 0 when searching
    setCurrentPage(0);
    loadCategoriesDebounced.current(search, 0, statusFilter);
  }, [search]);

  const handleSearch = () => {
    // Manual search button - just reload with current search term
    setCurrentPage(0);
    loadCategories();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors: Record<string, string> = {};
    
    if (!formData.categoryCode.trim()) {
      validationErrors.categoryCode = 'Category code is required';
    }
    
    if (!formData.categoryName.trim()) {
      validationErrors.categoryName = 'Category name is required';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (editingCategory) {
        await updateTestCategory(editingCategory.id, formData);
      } else {
        await createTestCategory(formData);
      }
      handleCloseModal();
      loadCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: TestCategory) => {
    setEditingCategory(category);
    setFormData({
      categoryCode: category.categoryCode,
      categoryName: category.categoryName,
      description: category.description,
      departmentId: category.departmentId,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
    });
    setIsModalOpen(true);
  };



  const handleDelete = (id: number) => {
    setDeletingCategoryId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategoryId) return;
    
    setIsDeleting(true);
    try {
      await deleteTestCategory(deletingCategoryId);
      loadCategories();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete category:', error);
    } finally {
      setIsDeleting(false);
      setDeletingCategoryId(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">                      
                        Test <span className="text-[#FF671F]">Categories</span>
          </h1> 
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Manage diagnostic test categories and departments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 px-6" suppressHydrationWarning>
            <LayoutGrid size={16} /> Category View
          </Button>
          <Button
            variant="gradient"
            size="sm"
            className="gap-2 shadow-sm px-8"
            onClick={() => {
              setIsModalOpen(true);
            }}
            suppressHydrationWarning
          >
            <Plus size={16} /> Create Category
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
            placeholder="Search categories..."
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
      {/* ═══ CATEGORIES TABLE ═══════════════════════════════════ */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Code
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Category Name
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Description
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Department
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
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                      <span>Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No categories found. Create your first category to get started.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600 font-mono hover:text-emerald-600 transition-colors">
                        {category.categoryCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          <Tag size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm mb-0.5">
                            {category.categoryName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 line-clamp-1">
                        {category.description}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-slate-900">
                          {category.departmentName || 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {category.departmentId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {category.displayOrder}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={category.isActive ? 'success' : 'secondary'}
                        className="text-[10px] font-bold"
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CategoryActions
                        category={category}
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

        {/* ═══ FOOTER ═════════════════════════════════════════════ */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>
              Showing {categories.length} of {totalElements} Categories
            </span>
            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
           
            <span className="text-[#FF671F]">Test Categories v1.0</span>
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

      {/* ═══ CREATE/EDIT RIGHT DRAWER ═══════════════════════════════════ */}
      <AddCategory
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={(data) => {
          loadCategories();
        }}
        editData={editingCategory}
      />

      {/* ═══ DELETE CONFIRMATION DIALOG ═══════════════════════════════════ */}
      <DeleteAlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingCategoryId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Test Category"
        description="Are you sure you want to permanently delete this test category? This action cannot be undone and all associated tests may be affected."
        isLoading={isDeleting}
      />
    </div>
  );
}
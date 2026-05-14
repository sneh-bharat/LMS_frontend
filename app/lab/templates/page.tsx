'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Settings, Trash2, FileText, ChevronDown, Search, Filter, LayoutGrid } from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
// ── Type Definitions ────────────────────────────────────────────────────────
interface Template {
  id: number;
  code: string;
  testName: string;
  department: string;
  category: string;
  isActive: boolean;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_TEMPLATES: Template[] = [
  {
    id: 1,
    code: 'WTFGRYHTR',
    testName: 'ASO TITRE (ASO)',
    department: 'Pathology',
    category: 'ALLERGY',
    isActive: true,
  },
  {
    id: 2,
    code: 'CBC001',
    testName: 'CBC - Complete Blood Count',
    department: 'Hematology',
    category: 'BLOOD',
    isActive: true,
  },
  {
    id: 3,
    code: 'LFT001',
    testName: 'Liver Function Test',
    department: 'Biochemistry',
    category: 'LIVER',
    isActive: false,
  },
];

// ── Main Component ──────────────────────────────────────────────────────────
export default function TemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [templates] = useState<Template[]>(MOCK_TEMPLATES);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const testIdParam = searchParams.get('testId');
  const parsedTestId = testIdParam ? Number(testIdParam) : NaN;
  const selectedTestId = Number.isFinite(parsedTestId) ? parsedTestId : undefined;
  const selectedTestName = searchParams.get('testName') || '';
  const selectedTestLabel = selectedTestName || (selectedTestId ? `Test ID ${selectedTestId}` : '');
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.testName.toLowerCase().includes(search.toLowerCase()) ||
      template.code.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = departmentFilter === 'All' || template.department === departmentFilter;
    const matchesCategory = categoryFilter === 'All' || template.category === categoryFilter;

    return matchesSearch && matchesDepartment && matchesCategory;
  });
  const activeTemplates = filteredTemplates.filter((template) => template.isActive).length;

  const handleAddTemplate = (template: Template) => {
    const params = new URLSearchParams({
      testId: String(selectedTestId ?? template.id),
      testName: selectedTestName || template.testName,
    });

    router.push(`/lab/templates/template_management?${params.toString()}`);
  };

  const handleConfigInterpretation = (testId: number) => {
    console.log('Configure interpretation for test:', selectedTestId ?? testId);
    // TODO: Open drawer/modal to configure interpretation
  };

  const handleDeleteTemplate = (templateId: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      console.log('Delete template:', templateId);
      // TODO: Call API to delete template
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            <span className="text-[#006D77]">Test</span> <span className="text-highlight">Templates</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            {selectedTestLabel
              ? `Manage test report templates and interpretations for ${selectedTestLabel}`
              : 'Manage test report templates and interpretations'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {selectedTestId && (
            <Badge variant="gradient" className="px-4 py-2 text-[10px]">
              Test ID: {selectedTestId}
            </Badge>
          )}
          <Button variant="outline" size="sm" className="gap-2 px-6" suppressHydrationWarning>
            <LayoutGrid size={16} /> Template View
          </Button>
          <Button variant="gradient" size="sm" className="gap-2 shadow-sm px-8" suppressHydrationWarning>
            <Plus size={16} /> Create Template
          </Button>
        </div>
      </div>

      {/* ═══ FILTER BAR ════════════════════════════════════════ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006D77] transition-colors"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
            suppressHydrationWarning
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-48 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
              suppressHydrationWarning
            >
              <option>All</option>
              <option>Biochemistry</option>
              <option>Hematology</option>
              <option>Microbiology</option>
              <option>Pathology</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
          </div>

          <div className="relative w-full sm:w-40 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
              suppressHydrationWarning
            >
              <option>All</option>
              <option>ALLERGY</option>
              <option>BLOOD</option>
              <option>LIVER</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* ═══ TEMPLATES TABLE ══════════════════════════════════════ */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Code
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Investigation Name
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Department
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Template
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Input
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <FileText size={28} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">No templates found</p>
                      <p className="text-xs font-medium text-slate-400">Try changing the search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600 font-mono group-hover:text-[#00AC80] transition-colors">
                        {template.code}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#006D77] group-hover:text-white transition-all">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-[#006D77] transition-colors text-sm mb-0.5">
                            {template.testName}
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-1">
                            {template.category} template setup
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="primary" className="px-2.5 py-1 text-[10px] font-bold">
                          {template.department}
                        </Badge>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {template.category}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleAddTemplate(template)}
                          className="px-3 py-2 border border-[#006D77]/20 text-[#006D77] rounded-lg text-xs font-bold hover:bg-[#006D77]/5 transition-colors flex items-center justify-center gap-2"
                          suppressHydrationWarning
                        >
                          <Plus size={14} />
                          Add Template
                        </button>
                        <button
                          onClick={() => handleConfigInterpretation(template.id)}
                          className="px-3 py-2 border border-emerald-500/30 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                          suppressHydrationWarning
                        >
                          <Settings size={14} />
                          Interpretation
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          suppressHydrationWarning
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-400">-</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={template.isActive}
                          onChange={() => {
                            console.log('Toggle status for template:', template.id);
                            // TODO: Toggle template status
                          }}
                          className="w-4 h-4 accent-[#006D77] border-slate-300 rounded focus:ring-[#006D77]"
                          suppressHydrationWarning
                        />
                        <Badge variant={template.isActive ? 'success' : 'secondary'} className="text-[10px] font-bold">
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>
              Showing {filteredTemplates.length} of {templates.length} Templates
            </span>
            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
            <span className="text-[#FF671F]">{activeTemplates} Active</span>
          </div>
          <div className="text-[10px] font-bold text-[#00AC80] uppercase tracking-widest">
            Template Management
          </div>
        </div>
      </div>
    </div>
  );
}

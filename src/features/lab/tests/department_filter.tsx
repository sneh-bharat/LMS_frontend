'use client';

import { useEffect, useState } from 'react';
import { Building2, ChevronDown, Loader2 } from 'lucide-react';
import { departmentApi, type Department } from '@/features/lab/services/lab.service';

export const ALL_DEPARTMENTS_VALUE = '';

interface DepartmentFilterProps {
  value: string;
  onChange: (departmentId: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function DepartmentFilter({
  value,
  onChange,
  className = '',
  disabled = false,
}: DepartmentFilterProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadDepartments = async () => {
      setLoading(true);
      try {
        const activeResponse = await departmentApi.getActiveDepartments({
          pageNo: 0,
          pageSize: 200,
        });
        if (!cancelled && activeResponse?.data?.content?.length) {
          setDepartments(activeResponse.data.content);
        } else {
          const response = await departmentApi.getAllDepartments({ pageNo: 0, pageSize: 200 });
          if (!cancelled && response?.data?.content) {
            setDepartments(response.data.content);
          }
        }
      } catch {
        try {
          const response = await departmentApi.getAllDepartments({ pageNo: 0, pageSize: 200 });
          if (!cancelled && response?.data?.content) {
            setDepartments(response.data.content);
          }
        } catch {
          if (!cancelled) setDepartments([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDepartments();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={`relative flex-1 lg:w-52 group ${className}`}>
      {loading ? (
        <Loader2
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
          size={14}
        />
      ) : (
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none disabled:opacity-60"
        suppressHydrationWarning
      >
        <option value={ALL_DEPARTMENTS_VALUE}>All Departments</option>
        {departments.map((dept) => (
          <option key={dept.id} value={String(dept.id)}>
            {dept.departmentName}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
        size={14}
      />
    </div>
  );
}

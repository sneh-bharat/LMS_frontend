'use client';

import {
    Building2,
    MapPin,
    Info,
    LayoutList,
    CheckCircle2,
    XCircle,
    Hash,
    Loader2
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Department } from '@/app/Apis/lab/departmentApi';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';
import { useState, useEffect } from 'react';

interface DepartmentDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    department: Department | null;
    onEdit?: (department: Department) => void;
}

export function DepartmentDetails({ isOpen, onClose, department, onEdit }: DepartmentDetailsProps) {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(false);

    useEffect(() => {
        const loadBranches = async () => {
            if (isOpen) {
                setLoadingBranches(true);
                try {
                    const response = await branchApi.getAllBranches({
                        pageNo: 0,
                        pageSize: 100,
                    });
                    setBranches(response.data.content);
                } catch (error) {
                    console.error('Failed to load branches:', error);
                    setBranches([]);
                } finally {
                    setLoadingBranches(false);
                }
            } else {
                setBranches([]);
            }
        };

        loadBranches();
    }, [isOpen]);

    // Find the branch name for the current department
    const currentBranch = department?.branchId 
        ? branches.find(b => b.id === department.branchId)
        : null;
    const branchName = currentBranch?.branchName || null;
    const branchExists = department?.branchId 
        ? branches.some(b => b.id === department.branchId)
        : false;

    if (!department) return null;

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <Building2 className="text-white" size={24} />
                    <span>Department <span className="text-emerald-200">Details</span></span>
                </div>
            }
            description={`Code: ${department.departmentCode}`}
            footer={
                <div className="flex gap-3 w-full">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Close
                    </Button>
                    <Button
                        variant="gradient"
                        onClick={() => department && onEdit?.(department)}
                        className="flex-1 gap-2"
                    >
                        <Edit size={18} />
                        Edit Department
                    </Button>
                </div>
            }
            maxWidth="xl"
        >
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Header Section */}
                <div className="flex items-start justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-50">
                            <Building2 size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {department.departmentName}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge variant={department.isActive ? 'success' : 'secondary'}>
                                    {department.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                {department.departmentNameShort && (
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                                        {department.departmentNameShort}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Department ID</div>
                        <div className="text-xl font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 inline-block">
                            #{department.id}
                        </div>
                    </div>
                </div>

                {/* Basic Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Hash size={10} /> Department Code
                        </label>
                        <p className="text-sm font-bold text-slate-900 font-mono tracking-tight">{department.departmentCode}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <LayoutList size={10} /> Display Order
                        </label>
                        <p className="text-sm font-bold text-slate-900">{department.displayOrder ?? 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Building2 size={10} /> Branch Name
                        </label>
                        {loadingBranches ? (
                            <div className="flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin text-slate-400" />
                                <p className="text-sm text-slate-400">Loading...</p>
                            </div>
                        ) : branchExists ? (
                            <p className="text-sm font-bold text-slate-900">
                                {branchName || 'Unknown Branch'}
                            </p>
                        ) : (
                            <p className="text-sm text-slate-400 italic">
                                Branch not found (ID: {department.branchId})
                            </p>
                        )}
                    </div>
                   
                </div>

                {/* Description Section */}
                {department.description && (
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <Info size={14} className="text-emerald-500" />
                            Description
                        </h4>
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                {department.description}
                            </p>
                        </div>
                    </div>
                )}

                {/* Location Section */}
                {department.location && (
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={14} className="text-emerald-500" />
                            Location
                        </h4>
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3">
                            <MapPin size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                {department.location}
                            </p>
                        </div>
                    </div>
                )}

                {/* Status Section */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        {department.isActive ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                        ) : (
                            <XCircle size={14} className="text-slate-400" />
                        )}
                        Department Status
                    </h4>
                    <div className={`p-6 rounded-xl border ${department.isActive ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="flex items-center gap-3">
                            {department.isActive ? (
                                <CheckCircle2 size={24} className="text-emerald-600" />
                            ) : (
                                <XCircle size={24} className="text-slate-400" />
                            )}
                            <div>
                                <p className="text-sm font-bold text-slate-900">
                                    {department.isActive ? 'Department is Active' : 'Department is Inactive'}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {department.isActive 
                                        ? 'This department is currently operational and available for use.' 
                                        : 'This department is currently not operational.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer/Meta Section */}
                <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info size={14} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Department ID: <span className="text-slate-900">#{department.id}</span>
                        </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Branch: {department.branchId || 'N/A'}
                    </span>
                </div>
            </div>
        </RightDrawer>
    );
}

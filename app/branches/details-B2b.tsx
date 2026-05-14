'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  User,
  Users,
  CheckCircle2,
  XCircle,
  Copy,
  Edit,
} from 'lucide-react';
import { Button, Badge, RightDrawer } from '@/components/ui';
import { branchApi, type BranchDetails } from '@/app/Apis/branch/branchApi';
import { toast } from 'sonner';

interface BranchDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: number | null;
  onEdit?: (branch: any) => void;
}

export default function BranchDetailsDrawer({ isOpen, onClose, branchId, onEdit }: BranchDetailsDrawerProps) {
  const [branch, setBranch] = useState<BranchDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && branchId) {
      loadBranchDetails();
    }
  }, [isOpen, branchId]);

  const loadBranchDetails = async () => {
    if (!branchId) return;
    
    setLoading(true);
    try {
      const response = await branchApi.getBranchById(branchId);
      setBranch(response.data);
    } catch (error: any) {
      console.error('Failed to load branch details:', error);
      toast.error(error?.response?.data?.message || 'Failed to load branch details');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusBadge = (status: string) => {
    const isActive = status === 'ACTIVE';
    return (
      <Badge variant={isActive ? 'success' : 'secondary'} size="lg">
        {isActive ? <CheckCircle2 size={16} className="mr-1" /> : <XCircle size={16} className="mr-1" />}
        {status}
      </Badge>
    );
  };

  if (!isOpen) {
    return null;
  }

  if (loading) {
    return (
      <RightDrawer
        isOpen={isOpen}
        onClose={onClose}
        title="Branch Details"
        description="Loading branch information..."
        maxWidth="xl"
      >
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Loading branch details...</p>
          </div>
        </div>
      </RightDrawer>
    );
  }

  if (!branch) {
    return (
      <RightDrawer
        isOpen={isOpen}
        onClose={onClose}
        title="Branch Not Found"
        description="The requested branch does not exist"
      >
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Building2 size={64} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">No branch details available</p>
          </div>
        </div>
      </RightDrawer>
    );
  }

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={branch.branchName}
      description={`Branch Code: ${branch.branchCode}`}
      footer={
        <div className="flex w-full gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="gradient" 
            className="flex-1 gap-2"
            onClick={() => {
              if (branch && onEdit) {
                onEdit({
                  id: branch.id,
                  branchName: branch.branchName,
                  branchType: branch.branchType,
                  address: branch.address || '',
                  city: branch.city || '',
                  state: branch.state || '',
                  country: '', // Not in BranchDetails, will be empty
                  postalCode: branch.postalCode || '',
                  contactEmail: branch.contactEmail || '',
                  contactPhone: branch.contactPhone || '',
                });
                onClose();
              }
            }}
          >
            <Edit size={18} />
            Edit Branch
          </Button>
        </div>
      }
    >

      <div className="space-y-6">
        {/* Status & Branch Type */}
        <div className="flex items-center gap-3">
          {getStatusBadge(branch.status)}
          <Badge variant="secondary" size="md">{branch.branchType}</Badge>
        </div>

        {/* Branch Information */}
        <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-200/50">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Building2 size={18} />
            Branch Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">Tenant ID</p>
              <p className="text-base font-bold text-slate-900 font-mono">{branch.tenantId}</p>
            </div>

            {/* Address */}
            {(branch.address || branch.city || branch.state) && (
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-2">
                  <MapPin size={14} />
                  Address
                </p>
                <p className="text-sm font-bold text-slate-900">{branch.address}</p>
                <p className="text-sm font-bold text-slate-600">
                  {[branch.city, branch.state, branch.postalCode].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-200/50">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Mail size={18} />
            Contact Information
          </h3>
          <div className="space-y-3">
            {/* Email */}
            {branch.contactEmail && (
              <div className="p-4 rounded-xl bg-white border border-slate-200/50 group hover:border-green-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                    <Mail size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-500 mb-1">Email</p>
                    <p className="text-sm font-bold text-slate-900 break-all">{branch.contactEmail}</p>
                  </div>
                  <Copy
                    size={16}
                    className="text-slate-400 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    onClick={() => copyToClipboard(branch.contactEmail!, 'Email')}
                  />
                </div>
              </div>
            )}

            {/* Phone */}
            {branch.contactPhone && (
              <div className="p-4 rounded-xl bg-white border border-slate-200/50 group hover:border-green-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                    <Phone size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-500 mb-1">Phone</p>
                    <p className="text-sm font-bold text-slate-900">{branch.contactPhone}</p>
                  </div>
                  <Copy
                    size={16}
                    className="text-slate-400 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    onClick={() => copyToClipboard(branch.contactPhone!, 'Phone')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Branch Manager */}
        {(branch.branchManagerName || branch.branchManagerEmail) && (
          <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-200/50">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={18} />
              Branch Manager
            </h3>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl">
                  {branch.branchManagerName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  {branch.branchManagerName && (
                    <p className="text-base font-black text-slate-900 mb-1">{branch.branchManagerName}</p>
                  )}
                  {branch.branchManagerEmail && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <p className="text-sm font-bold text-slate-700">{branch.branchManagerEmail}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Statistics */}
        <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-200/50">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Users size={18} />
            User Statistics
          </h3>
          <div className="space-y-4">
            {/* Max Users */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50">
              <p className="text-xs font-bold text-slate-500 mb-1">Maximum Users</p>
              <p className="text-3xl font-black text-purple-600">{branch.maxUsers}</p>
            </div>

            {/* Total Users */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/50">
              <p className="text-xs font-bold text-slate-500 mb-1">Total Users</p>
              <p className="text-3xl font-black text-blue-600">{branch.totalUsers}</p>
            </div>

            {/* Active Users */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50">
              <p className="text-xs font-bold text-slate-500 mb-1">Active Users</p>
              <p className="text-3xl font-black text-green-600">{branch.activeUsers}</p>
            </div>           
          </div>
        </div>
      </div>
    </RightDrawer>
  );
}
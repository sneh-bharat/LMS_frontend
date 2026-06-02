'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  AtSign,
  BadgeCheck,
  Building2,
  Eye,
  History,
  Mail,
  Phone,
  Shield,
  Stethoscope,
  User,
} from 'lucide-react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { getStoredDoctorId, fetchUserProfile } from '@/app/Apis/Auth/doctorProfileApi';
import GetPaymentHistory from '@/app/doctor/GetPaymentHistory';
import type { UserProfileData } from '@/app/Apis/Auth/doctorProfileApi';

function specializationLabel(specialization: string | null): string {
  if (!specialization?.trim()) return 'General Practice';
  if (/specialist$/i.test(specialization.trim())) return specialization.trim();
  return `${specialization.trim()} Specialist`;
}

function DetailField({
  label,
  value,
  icon: Icon,
  mono,
  href,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  mono?: boolean;
  href?: string;
}) {
  const linkClass = [
    'text-sm font-bold text-[#006D77] hover:text-[#00AC80] transition-colors break-all',
    mono ? 'font-mono' : '',
  ].join(' ');

  const textClass = [
    'text-sm font-bold text-slate-900 break-all',
    mono ? 'font-mono tracking-tight' : '',
  ].join(' ');

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
        {Icon && <Icon size={10} className="text-[#00AC80]" aria-hidden={true} />}
        {label}
      </label>
      {href && value !== '—' && value !== 'N/A' ? (
        <a href={href} className={linkClass}>
          {value}
        </a>
      ) : (
        <p className={textClass}>{value}</p>
      )}
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
        {Icon ? <Icon size={16} className="text-[#006D77]" aria-hidden /> : null}
        <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

// Skeleton loader
function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 bg-slate-200 rounded w-48" />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 bg-white rounded-xl border border-slate-200 h-96" />
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 h-44" />
          <div className="bg-white rounded-xl border border-slate-200 h-32" />
        </div>
      </div>
    </div>
  );
}

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentHistoryOpen, setPaymentHistoryOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile()
      .then((res) => setProfile(res.data))
      .catch(() => setError('Failed to load profile. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ProfileSkeleton />;

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-sm font-semibold text-red-500">
          {error ?? 'Profile not available.'}
        </p>
      </div>
    );
  }

  // Field mapping: UserProfileData → display values
  const doctorId = getStoredDoctorId() ?? profile.id;
  const doctorName = profile.fullName;
  const email = profile.email;
  const phone = profile.phone;
  const role = profile.role;
  const spec = profile.specialization;
  const branch = profile.branchName?.trim() || '—';
  const tenantName = profile.tenantName;
  const companyName = profile.companyName;
  const licenseNumber= profile.licenseNumber;
  const isVerified = profile.isVerified;
  const isActive = profile.isActive;
  const tenantCode = profile.tenantCode;
  const tenantStatus = profile.tenantStatus;

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Doctor <span className="text-[#006D77]">Profile</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-xl">
              View-only preview of your account details and organization settings.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
              onClick={() => setPaymentHistoryOpen(true)}
            >
              <History size={16} aria-hidden={true} />
              Payment History
            </Button>
            <Badge
              variant="outline"
              className="border-[#006D77]/25 bg-[#006D77]/5 text-[#006D77] text-[10px] font-bold uppercase tracking-widest gap-1.5 px-4 py-2"
            >
              <Eye size={14} aria-hidden />
              View only
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left card — avatar + summary */}
          <section className="xl:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-28 custom-gradient2 relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-6 w-16 h-16 border border-white/40 rotate-45 rounded-lg" />
                <div className="absolute bottom-2 left-8 w-10 h-10 border border-white/30 rounded-full" />
              </div>
            </div>

            <div className="px-6 pb-8 -mt-14 flex flex-col items-center text-center relative z-10">
              <div className="w-28 h-28 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-[#006D77] mb-4">
                <Stethoscope size={48} strokeWidth={1.5} aria-hidden />
              </div>

              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{doctorName}</h2>
              <p className="text-sm font-semibold text-[#006D77] mt-1">
                {specializationLabel(spec)}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                {isVerified && (
                  <Badge
                    variant="outline"
                    className="border-[#00AC80]/30 bg-[#00AC80]/10 text-[#006D77] text-[10px] font-bold gap-1.5 px-3 py-1"
                  >
                    <BadgeCheck size={12} aria-hidden />
                    Verified
                  </Badge>
                )}
                {isActive && (
                  <Badge className="bg-[#00AC80] hover:bg-[#00AC80] text-white text-[10px] font-bold gap-1.5 px-3 py-1">
                    <span className="w-2 h-2 rounded-full bg-white" aria-hidden />
                    Active
                  </Badge>
                )}
              </div>

              <div className="mt-6 w-full pt-5 border-t border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
                  Role
                </div>
                <div className="text-sm font-black text-[#006D77] bg-[#006D77]/5 px-3 py-1.5 rounded-lg border border-[#006D77]/15 inline-block uppercase tracking-wide">
                  {role}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-6 w-full gap-2 font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                onClick={() => setPaymentHistoryOpen(true)}
              >
                <History size={16} aria-hidden />
                Payment History
              </Button>
            </div>
          </section>

          {/* Right cards */}
          <div className="xl:col-span-2 space-y-6">
            <SectionCard title="Personal Information" icon={User}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DetailField label="Full Name" value={doctorName} icon={User} />
                <DetailField
                  label="Email"
                  value={email}
                  icon={Mail}
                  href={`mailto:${email}`}
                />
                <DetailField label="Phone" value={phone} icon={Phone} />
                <DetailField label="Role" value={role} icon={Shield} />
                <DetailField
                  label="Specialization"
                  value={spec ?? 'N/A'}
                  icon={Activity}
                />
                <DetailField label="License No." value={licenseNumber ?? '—'} icon={BadgeCheck} />
              </div>
            </SectionCard>
            <SectionCard title="Organization Details" icon={Building2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DetailField label="Tenant Name" value={tenantName} icon={Building2} />
                <DetailField label="Branch Name" value={branch} icon={Building2} />
                {/* <DetailField label='Company Name' value={companyName} icon={Building2} /> */}
                <DetailField label="Tenant Code" value={tenantCode} icon={Building2} />
                <DetailField label="Tenant Status" value={tenantStatus} icon={Building2} />
                
                
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      <GetPaymentHistory
        isOpen={paymentHistoryOpen}
        onClose={() => setPaymentHistoryOpen(false)}
        doctorId={doctorId}
        doctorName={doctorName}
      />
    </>
  );
}
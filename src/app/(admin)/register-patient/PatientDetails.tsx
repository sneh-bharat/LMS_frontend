'use client';

import {
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Shield,
    Activity,
    Info,
    Clock,
    Heart,
    AlertTriangle
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import { Patient, fetchPatientImage } from '@/app/Apis/Patients/Patient_Service_API';
import { sanitizeMiddleName } from '@/app/Apis/Patients/patientDisplayUtils';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getBase64ImageSource } from '@/app/functions/getBase64';
import Button from '@/components/ui/button';
import { Trash2, Receipt } from 'lucide-react';

interface PatientDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    onDelete?: (patientId: number) => void;
    onViewInvoices?: () => void;
}

export function PatientDetails({ isOpen, onClose, patient, onDelete, onViewInvoices }: PatientDetailsProps) {
    const [patientImage, setPatientImage] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);

    useEffect(() => {
        const getPatientImage = async () => {
            if (isOpen && patient?.id) {
                setImageLoading(true);
                try {
                    const response = await fetchPatientImage(patient.id);
                    if (response.response && response.data) {
                        setPatientImage(getBase64ImageSource(response.data));
                    } else {
                        setPatientImage(null);
                    }
                } catch (error) {
                    console.error('Error fetching patient image:', error);
                    setPatientImage(null);
                } finally {
                    setImageLoading(false);
                }
            } else {
                setPatientImage(null);
            }
        };

        getPatientImage();
    }, [isOpen, patient?.id]);

    if (!patient) return null;

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <User className="text-white" size={24} />
                    <span>Patient <span className="text-emerald-200">Full Profile</span></span>
                </div>
            }
            description={`UHID: ${patient.patientCode || 'N/A'}`}
            footer={
                <div className="flex flex-wrap gap-3 w-full">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onViewInvoices?.()}
                        className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex items-center gap-2"
                    >
                        <Receipt size={16} />
                        View Invoices
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => patient?.id && onDelete?.(patient.id)}
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        Delete Patient Record
                    </Button>
                </div>
            }
            maxWidth="xl"
        >
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Header Section */}
                <div className="flex items-start justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 overflow-hidden border-2 border-emerald-50">
                            {imageLoading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : patientImage ? (
                                <img
                                    src={patientImage}
                                    alt={`${patient.firstName}'s profile`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User size={32} />
                            )}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {patient.firstName} {sanitizeMiddleName(patient.middleName) || ''} {patient.lastName}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge variant={patient.isActive ? 'success' : 'secondary'}>
                                    {patient.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                    <Clock size={12} /> Registered: {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Recently'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Blood Group</div>
                        <div className="text-xl font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 inline-block">
                            {patient.bloodGroup?.replace('_POS', '+').replace('_NEG', '-') || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Calendar size={10} /> Date of Birth
                        </label>
                        <p className="text-sm font-bold text-slate-900">{patient.dateOfBirth || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Activity size={10} /> Gender
                        </label>
                        <p className="text-sm font-bold text-slate-900 capitalize">{patient.gender?.toLowerCase() || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Phone size={10} /> Primary Mobile
                        </label>
                        <p className="text-sm font-bold text-slate-900 font-mono tracking-tight">{patient.mobilePrimary}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Mail size={10} /> Email Address
                        </label>
                        <p className="text-sm font-bold text-slate-900 italic lowercase">{patient.email || 'N/A'}</p>
                    </div>
                </div>

                {/* Addresses Section */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={14} className="text-emerald-500" />
                        Address Information
                    </h4>
                    <div className="space-y-3">
                        {patient.addresses && patient.addresses.length > 0 ? (
                            patient.addresses.map((addr, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded">
                                            {addr.addressType || 'Primary'}
                                        </span>
                                        {addr.isPrimary && (
                                            <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 uppercase">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                        {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''},<br />
                                        {addr.city}, {addr.district}, {addr.state} - <span className="font-bold text-slate-900">{addr.pinCode}</span>
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 italic">No addresses recorded.</p>
                        )}
                    </div>
                </div>

                {/* Allergies Section */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Heart size={14} className="text-rose-500" />
                        Clinical Allergies
                    </h4>
                    <div className="space-y-3">
                        {patient.allergies && patient.allergies.length > 0 ? (
                            patient.allergies.map((allergy, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-rose-100 bg-rose-50/20 flex gap-4">
                                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 flex-shrink-0">
                                        <AlertTriangle size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-slate-900">{allergy.allergyName}</span>
                                            <span
                                                className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded ${
                                                    allergy.severity === 'HIGH' ? 'bg-rose-600 text-white' :
                                                    allergy.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}
                                            >
                                                {allergy.severity === 'HIGH'
                                                    ? 'High'
                                                    : allergy.severity === 'MEDIUM'
                                                      ? 'Medium'
                                                      : 'Low'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-normal">{allergy.remarks || 'No specific remarks noted.'}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center">
                                <Shield className="mx-auto text-slate-200 mb-2" size={32} />
                                <p className="text-sm text-slate-400 font-medium">No allergies documented.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer/Meta Section */}
                <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info size={14} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Patient Category: <span className="text-slate-900">{patient.patientCategory || 'REGULAR'}</span>
                        </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Clinic ID: {patient.clinicId || '1'}
                    </span>
                </div>
            </div>
        </RightDrawer>
    );
}


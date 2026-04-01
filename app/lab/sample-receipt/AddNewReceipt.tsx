'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Barcode,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Thermometer,
  Package,
  Droplets,
  FileText,
  ChevronDown,
  Info
} from 'lucide-react';
import {
  Input,
  Button,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui';
import { RightDrawer } from '@/components/ui/right-drawer';

// ─── Types ──────────────────────────────────────────────────────────────────────
export interface ReceiptFormData {
  sampleId: string;
  receivedDate: string;
  receivedTime: string;
  receivedBy: string;
  
  // Condition Checks
  properlyLabelled: boolean | null;
  correctTube: boolean | null;
  sufficientVolume: boolean | null;
  notHaemolysed: boolean | null;
  notClotted: boolean | null;
  notLeaked: boolean | null;
  
  // Temperature
  temperatureOnArrival: '' | 'Ambient' | 'Cold (2–8°C)' | 'Frozen';
  
  // Decision
  acceptanceDecision: 'Accepted' | 'Conditionally Accepted' | 'Rejected';
  rejectionReason: string;
  rejectionReasonText: string;
  rejectionAction: 'Recollect Sample' | 'Process with Disclaimer' | 'Cancel Order';
  
  // Department & Processing
  departmentRouting: string;
  aliquotingRequired: boolean;
  numberOfAliquots: number;
  storageLocation: string;
  
  // Remarks
  remarks: string;
  
  // Patient & Test Info (from initial data)
  patientName: string;
  tests: string[];
  sampleType: string;
  collectedAt: string;
}

export interface ReceiptInitialData {
  sampleId?: string;
  patientName?: string;
  tests?: string[];
  sampleType?: string;
  collectedAt?: string;
  department?: string;
}

export const DEPARTMENTS = [
  'Haematology',
  'Biochemistry',
  'Microbiology',
  'Immunology',
  'Pathology',
  'Serology',
  'Coagulation',
  'Urine Analysis',
  'CSF Analysis',
];

export const REJECTION_REASONS = [
  'Insufficient Volume',
  'Haemolysed',
  'Clotted',
  'Wrong Tube',
  'Unlabelled',
  'Expired Transport',
  'Leaked',
  'Patient ID Mismatch',
];

export const STORAGE_LOCATIONS = [
  'Rack A1',
  'Rack A2',
  'Rack B1',
  'Rack B2',
  'Centrifuge Bay 1',
  'Centrifuge Bay 2',
  'Refrigerator 1',
  'Refrigerator 2',
  'Freezer Unit 1',
  'Processing Area',
];

const BLANK_FORM: ReceiptFormData = {
  sampleId: '',
  receivedDate: '',
  receivedTime: '',
  receivedBy: 'Current User',
  
  properlyLabelled: null,
  correctTube: null,
  sufficientVolume: null,
  notHaemolysed: null,
  notClotted: null,
  notLeaked: null,
  
  temperatureOnArrival: '',
  acceptanceDecision: 'Accepted',
  rejectionReason: '',
  rejectionReasonText: '',
  rejectionAction: 'Recollect Sample',
  
  departmentRouting: '',
  aliquotingRequired: false,
  numberOfAliquots: 2,
  storageLocation: '',
  
  remarks: '',
  
  patientName: '',
  tests: [],
  sampleType: '',
  collectedAt: '',
};

interface AddNewReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReceiptFormData) => void;
  initial?: ReceiptInitialData | null;
}

export default function AddNewReceipt({
  isOpen, onClose, onSave, initial,
}: AddNewReceiptProps) {
  const [form, setForm] = useState<ReceiptFormData>({ ...BLANK_FORM });
  const [errors, setErrors] = useState<Partial<Record<keyof ReceiptFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const set = (key: keyof ReceiptFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }));

  const setBoolean = (key: keyof ReceiptFormData) => (value: boolean) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const setToggle = (key: keyof ReceiptFormData) => () => {
    setForm(f => ({ ...f, [key]: !f[key] }));
  };

  // Check if any condition check failed
  const hasConditionFailures = 
    form.properlyLabelled === false ||
    form.correctTube === false ||
    form.sufficientVolume === false ||
    form.notHaemolysed === false ||
    form.notClotted === false ||
    form.notLeaked === false;

  useEffect(() => {
    if (!isOpen) return;
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    setErrors({});
    setIsEditMode(!!initial);

    if (initial) {
      // EDIT MODE: Pre-populate with existing data
      setForm({
        ...BLANK_FORM,
        receivedDate: dateStr,
        receivedTime: timeStr,
        sampleId: initial.sampleId || '',
        patientName: initial.patientName || '',
        tests: initial.tests || [],
        sampleType: initial.sampleType || '',
        collectedAt: initial.collectedAt || '',
        departmentRouting: initial.department || DEPARTMENTS[0],
      });
    } else {
      // ADD MODE: Start with blank form
      setForm({
        ...BLANK_FORM,
        receivedDate: dateStr,
        receivedTime: timeStr,
        departmentRouting: DEPARTMENTS[0],
      });
    }
  }, [isOpen, initial]);

  useEffect(() => {
    if (hasConditionFailures && form.acceptanceDecision !== 'Rejected') {
      setForm(f => ({ ...f, acceptanceDecision: 'Rejected' }));
    }
  }, [hasConditionFailures, form.acceptanceDecision]);

  const validate = (): boolean => {
    const e: Partial<Record<keyof ReceiptFormData, string>> = {};
    
    if (!form.sampleId.trim()) e.sampleId = 'Sample ID required';
    if (!form.patientName.trim()) e.patientName = 'Patient name required';
    
    // All condition checks must be answered
    if (form.properlyLabelled === null) e.properlyLabelled = 'Required';
    if (form.correctTube === null) e.correctTube = 'Required';
    if (form.sufficientVolume === null) e.sufficientVolume = 'Required';
    if (form.notHaemolysed === null) e.notHaemolysed = 'Required';
    if (form.notClotted === null) e.notClotted = 'Required';
    if (form.notLeaked === null) e.notLeaked = 'Required';
    
    if (!form.acceptanceDecision) e.acceptanceDecision = 'Required';
    
    // If rejected, reason is mandatory
    if (form.acceptanceDecision === 'Rejected' && !form.rejectionReason) {
      e.rejectionReason = 'Required';
    }
    
    if (form.acceptanceDecision === 'Conditionally Accepted' && !form.rejectionReasonText.trim()) {
      e.rejectionReasonText = 'Comment required';
    }
    
    if (!form.departmentRouting) e.departmentRouting = 'Required';
    if (!form.storageLocation) e.storageLocation = 'Required';
    
    if (form.aliquotingRequired && (form.numberOfAliquots < 2 || form.numberOfAliquots > 5)) {
      e.numberOfAliquots = 'Must be 2-5';
    }
    
    if (form.remarks.length > 500) e.remarks = 'Max 500 characters';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      onSave(form);
      setSubmitting(false);
      onClose();
    }, 800);
  };

  const footer = (
    <div className="flex items-center gap-3 w-full">
      <Button variant="outline" onClick={onClose} className="flex-1 rounded-lg py-2.5 font-bold uppercase text-xs tracking-wider">
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={submitting}
        variant={form.acceptanceDecision === 'Rejected' ? 'destructive' : form.acceptanceDecision === 'Conditionally Accepted' ? 'secondary' : 'gradient'}
        className="flex-[2] rounded-lg py-2.5 font-bold uppercase text-xs tracking-wider shadow-sm"
      >
        {submitting ? 'Processing...' : 
         isEditMode ? (
           form.acceptanceDecision === 'Rejected' ? 'Update & Reject' :
           form.acceptanceDecision === 'Conditionally Accepted' ? 'Update with Conditions' : 'Update Sample'
         ) : (
           form.acceptanceDecision === 'Rejected' ? 'Create & Reject' :
           form.acceptanceDecision === 'Conditionally Accepted' ? 'Create with Conditions' : 'Create Sample'
         )}
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          {isEditMode ? 'Edit ' : 'New '} Sample <span className="text-emerald-200">Receipt & Acceptance</span>
        </>
      }
      description={isEditMode ? "Update sample receipt and acceptance details" : "Receive and inspect incoming samples"}
      footer={footer}
       maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Section 1: Sample Identification */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Barcode size={18} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Sample Identification</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                <Barcode size={12} className="text-blue-500" />
                Sample ID (Scan Barcode) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                <input 
                  value={form.sampleId} 
                  onChange={set('sampleId')}
                  disabled={isEditMode}
                  placeholder="Scan or enter sample ID"
                  className={`input-refined w-full pl-10 py-2.5 font-bold border-blue-200 focus:ring-2 focus:ring-blue-400 ${isEditMode ? 'bg-blue-100 text-slate-600' : ''}`}
                />
              </div>
              {errors.sampleId && <p className="text-[10px] text-red-500 font-semibold">{errors.sampleId}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Patient Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                <input 
                  value={form.patientName} 
                  onChange={set('patientName')}
                  placeholder="Enter patient name"
                  className="input-refined w-full pl-10 py-2.5 font-bold border-blue-200 focus:ring-2 focus:ring-blue-400"
                />
              </div>
              {errors.patientName && <p className="text-[10px] text-red-500 font-semibold">{errors.patientName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Received Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={14} />
                <input 
                  type="date"
                  value={form.receivedDate} 
                  disabled
                  className="input-refined w-full pl-10 py-2.5 font-bold bg-blue-100 border-blue-200 text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Received Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={14} />
                <input 
                  type="text"
                  value={form.receivedTime} 
                  disabled
                  className="input-refined w-full pl-10 py-2.5 font-bold bg-blue-100 border-blue-200 text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Received By</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={14} />
                <input 
                  value={form.receivedBy} 
                  disabled
                  className="input-refined w-full pl-10 py-2.5 font-bold bg-blue-100 border-blue-200 text-slate-600"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Sample Condition Check */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-emerald-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sample Condition Check <span className="text-red-500">*</span></span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            {[
              { key: 'properlyLabelled', label: 'Properly Labelled', icon: <FileText size={16} /> },
              { key: 'correctTube', label: 'Correct Tube Type', icon: <Droplets size={16} /> },
              { key: 'sufficientVolume', label: 'Sufficient Volume', icon: <Package size={16} /> },
              { key: 'notHaemolysed', label: 'Not Haemolysed', icon: <AlertTriangle size={16} /> },
              { key: 'notClotted', label: 'Not Clotted', icon: <AlertTriangle size={16} /> },
              { key: 'notLeaked', label: 'Not Leaked', icon: <AlertTriangle size={16} /> },
            ].map((check) => (
              <div key={check.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400">{check.icon}</div>
                  <span className="text-sm font-bold text-slate-700">{check.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBoolean(check.key as keyof ReceiptFormData)(true)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                      form[check.key as keyof ReceiptFormData] === true
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-slate-400 border border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <CheckCircle size={14} /> Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoolean(check.key as keyof ReceiptFormData)(false)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                      form[check.key as keyof ReceiptFormData] === false
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-white text-slate-400 border border-slate-200 hover:border-rose-300'
                    }`}
                  >
                    <XCircle size={14} /> No
                  </button>
                </div>
              </div>
            ))}
            {errors.properlyLabelled && <p className="text-[10px] text-rose-500 font-semibold">All condition checks are required</p>}
          </div>
        </section>

        {/* Section 3: Temperature & Storage */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer size={18} className="text-amber-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Temperature & Storage Conditions</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Temperature on Arrival</label>
              <select
                value={form.temperatureOnArrival}
                onChange={set('temperatureOnArrival')}
                className="input-refined w-full py-2.5 font-bold appearance-none border-slate-200"
              >
                <option value="">Select Temperature</option>
                <option value="Ambient">Ambient</option>
                <option value="Cold (2–8°C)">Cold (2–8°C)</option>
                <option value="Frozen">Frozen</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Storage Location <span className="text-red-500">*</span></label>
              <select
                value={form.storageLocation}
                onChange={set('storageLocation')}
                className="input-refined w-full py-2.5 font-bold appearance-none border-slate-200"
              >
                <option value="">Select Location</option>
                {STORAGE_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              {errors.storageLocation && <p className="text-[10px] text-rose-500 font-semibold">{errors.storageLocation}</p>}
            </div>
          </div>
        </section>

        {/* Section 4: Acceptance Decision */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className={form.acceptanceDecision === 'Accepted' ? 'text-emerald-600' : form.acceptanceDecision === 'Rejected' ? 'text-rose-600' : 'text-amber-600'} />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Acceptance Decision <span className="text-red-500">*</span></span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'Accepted', label: 'Accepted', color: 'emerald', icon: <CheckCircle size={16} /> },
                { value: 'Conditionally Accepted', label: 'Conditionally Accepted', color: 'amber', icon: <AlertTriangle size={16} /> },
                { value: 'Rejected', label: 'Rejected', color: 'rose', icon: <XCircle size={16} /> },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setForm(f => ({ ...f, acceptanceDecision: option.value as any }))}
                  className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    form.acceptanceDecision === option.value
                      ? option.color === 'emerald'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg'
                        : option.color === 'amber'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-lg'
                        : 'bg-rose-600 text-white border-rose-600 shadow-lg'
                      : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={form.acceptanceDecision === option.value ? 'text-white' : `text-${option.color}-600`}>
                    {option.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tight text-center">{option.label}</span>
                </button>
              ))}
            </div>

            {/* Rejection Reason */}
            {(form.acceptanceDecision === 'Rejected' || form.acceptanceDecision === 'Conditionally Accepted') && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.rejectionReason}
                    onChange={set('rejectionReason')}
                    className="input-refined w-full py-2.5 font-bold appearance-none border-slate-200"
                  >
                    <option value="">Select Reason</option>
                    {REJECTION_REASONS.map(reason => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                  {errors.rejectionReason && <p className="text-[10px] text-rose-500 font-semibold">{errors.rejectionReason}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Additional Comments
                  </label>
                  <textarea
                    value={form.rejectionReasonText}
                    onChange={set('rejectionReasonText')}
                    placeholder="Provide additional details..."
                    rows={3}
                    className="input-refined w-full py-2.5 font-bold border-slate-200 resize-none"
                  />
                  {errors.rejectionReasonText && <p className="text-[10px] text-rose-500 font-semibold">{errors.rejectionReasonText}</p>}
                </div>

                {form.acceptanceDecision === 'Rejected' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Rejection Action <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.rejectionAction}
                      onChange={set('rejectionAction')}
                      className="input-refined w-full py-2.5 font-bold appearance-none border-slate-200"
                    >
                      <option value="Recollect Sample">Recollect Sample</option>
                      <option value="Process with Disclaimer">Process with Disclaimer</option>
                      <option value="Cancel Order">Cancel Order</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Section 5: Department Routing & Processing */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Package size={18} className="text-purple-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Department Routing & Processing</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <Info size={12} className="text-slate-400" />
                Department Routing (Auto-determined) <span className="text-red-500">*</span>
              </label>
              <select
                value={form.departmentRouting}
                onChange={set('departmentRouting')}
                className="input-refined w-full py-2.5 font-bold appearance-none border-slate-200"
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.departmentRouting && <p className="text-[10px] text-rose-500 font-semibold">{errors.departmentRouting}</p>}
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <Droplets size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">Aliquoting Required</span>
              </div>
              <button
                type="button"
                onClick={setToggle('aliquotingRequired')}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  form.aliquotingRequired ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  form.aliquotingRequired ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            {form.aliquotingRequired && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Number of Aliquots <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={2}
                    max={5}
                    value={form.numberOfAliquots}
                    onChange={(e) => setForm(f => ({ ...f, numberOfAliquots: parseInt(e.target.value) || 2 }))}
                    className="input-refined w-full py-2.5 font-bold border-slate-200 text-center"
                  />
                </div>
                {errors.numberOfAliquots && <p className="text-[10px] text-rose-500 font-semibold">{errors.numberOfAliquots}</p>}
              </div>
            )}
          </div>
        </section>

        {/* Section 6: Remarks */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-slate-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Remarks</span>
          </div>

          <div className="space-y-1.5">
            <textarea
              value={form.remarks}
              onChange={set('remarks')}
              placeholder="Additional notes or observations (max 500 characters)"
              rows={3}
              className="input-refined w-full py-2.5 font-bold border-slate-200 resize-none"
            />
            <div className="flex justify-end">
              <span className={`text-[10px] font-semibold ${form.remarks.length > 500 ? 'text-rose-500' : 'text-slate-400'}`}>
                {form.remarks.length}/500
              </span>
            </div>
            {errors.remarks && <p className="text-[10px] text-rose-500 font-semibold">{errors.remarks}</p>}
          </div>
        </section>
      </div>
    </RightDrawer>
  );
}
'use client';

import { useState } from 'react';
import { InlineButton as Button, InlineInput as Input, InlineFormGroup as FormGroup, InlineModal as Modal, InlineTable as Table } from '@/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Branch {
  id: number;
  branchCode: string;
  branchName: string;
  type: 'Branch' | 'B2B' | 'Franchise';
  contactPerson: string;
  mobile: string;
  email: string;
  address: string;
  status: 'Active' | 'Inactive';
}

interface PatientRegistration {
  title: string;
  patientName: string;
  country: string;
  mobile: string;
  age: string;
  month: string;
  day: string;
  gender: string;
  email: string;
  nationality: string;
  documentType: string;
  documentNumber: string;
  address: string;
  preExistingDiseases: string[];
  drugAllergy: string;
  paymentMode: string;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const INITIAL_BRANCHES: Branch[] = [
  {
    id: 1,
    branchCode: 'BR-001',
    branchName: 'Delhi Main Branch',
    type: 'Branch',
    contactPerson: 'Rajesh Kumar',
    mobile: '9876543210',
    email: 'delhi@thinklab.com',
    address: 'Sector 15, New Delhi',
    status: 'Active',
  },
  {
    id: 2,
    branchCode: 'B2B-001',
    branchName: 'Mumbai Diagnostic Center',
    type: 'B2B',
    contactPerson: 'Priya Sharma',
    mobile: '9123456789',
    email: 'mumbai@diagnostic.com',
    address: 'MG Road, Mumbai',
    status: 'Active',
  },
  {
    id: 3,
    branchCode: 'FR-001',
    branchName: 'Ahmedabad Franchise',
    type: 'Franchise',
    contactPerson: 'Amit Patel',
    mobile: '9988776655',
    email: 'ahmedabad@franchise.com',
    address: 'CG Road, Ahmedabad',
    status: 'Active',
  },
];

const BRANCH_COLS = [
  { key: 'branchCode', label: 'Branch Code' },
  { key: 'branchName', label: 'Branch Name' },
  { key: 'type', label: 'Type' },
  { key: 'contactPerson', label: 'Contact Person' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'status', label: 'Status' },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'];
const COUNTRIES = [
  { code: '+91', name: 'IND' },
  { code: '+1', name: 'USA' },
  { code: '+44', name: 'UK' },
  { code: '+61', name: 'AUS' },
  { code: '+971', name: 'UAE' },
];
const NATIONALITIES = ['IND-India', 'USA-United States', 'UK-United Kingdom', 'UAE-UAE', 'AUS-Australia'];
const DOCUMENT_TYPES = ['Aadhar Card', 'PAN Card', 'Passport', 'Voter ID', 'Driving License'];
const GENDERS = ['Male', 'Female', 'Other'];
const PRE_EXISTING_DISEASES = ['Diabetes', 'Hypertension', 'Anaemia', 'Thyroid', 'Arthritis', 'Asthma'];
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

// ─── Add Branch Modal ─────────────────────────────────────────────────────────
function AddBranchModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (b: Branch) => void;
}) {
  const [form, setForm] = useState({
    branchName: '',
    type: 'Branch' as 'Branch' | 'B2B' | 'Franchise',
    contactPerson: '',
    mobile: '',
    email: '',
    address: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const handleAdd = () => {
    if (!form.branchName.trim()) return;
    const prefix = form.type === 'Branch' ? 'BR' : form.type === 'B2B' ? 'B2B' : 'FR';
    const newBranch: Branch = {
      id: Date.now(),
      branchCode: `${prefix}-${String(Date.now()).slice(-3)}`,
      branchName: form.branchName,
      type: form.type,
      contactPerson: form.contactPerson,
      mobile: form.mobile,
      email: form.email,
      address: form.address,
      status: form.status,
    };
    onAdd(newBranch);
    setForm({ branchName: '', type: 'Branch', contactPerson: '', mobile: '', email: '', address: '', status: 'Active' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Branch/B2B">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 20 }}>
        <FormGroup label="Branch Type" style={{ gridColumn: '1 / -1' }}>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
            style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 10px', fontSize: 13, color: '#444', outline: 'none' }}>
            <option>Branch</option>
            <option>B2B</option>
            <option>Franchise</option>
          </select>
        </FormGroup>
        <FormGroup label="Branch Name" style={{ gridColumn: '1 / -1' }}>
          <Input value={form.branchName} onChange={e => setForm(f => ({ ...f, branchName: e.target.value }))} placeholder="Enter branch name" />
        </FormGroup>
        <FormGroup label="Contact Person">
          <Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="Contact person" />
        </FormGroup>
        <FormGroup label="Mobile Number">
          <Input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="Mobile number" />
        </FormGroup>
        <FormGroup label="Email">
          <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" type="email" />
        </FormGroup>
        <FormGroup label="Status">
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
            style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 10px', fontSize: 13, color: '#444', outline: 'none' }}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </FormGroup>
        <FormGroup label="Address" style={{ gridColumn: '1 / -1' }}>
          <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Enter address" />
        </FormGroup>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e8edf3', paddingTop: 16 }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleAdd}>Add Branch</Button>
      </div>
    </Modal>
  );
}

// ─── Patient Registration Modal ───────────────────────────────────────────────
function PatientRegistrationModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (p: PatientRegistration) => void;
}) {
  const [form, setForm] = useState<PatientRegistration>({
    title: 'Ms.',
    patientName: '',
    country: '+91',
    mobile: '',
    age: '28',
    month: '2',
    day: '16',
    gender: 'Female',
    email: '',
    nationality: 'IND-India',
    documentType: '',
    documentNumber: '',
    address: '',
    preExistingDiseases: [],
    drugAllergy: '',
    paymentMode: 'Cash',
  });

  const toggleDisease = (disease: string) => {
    setForm(f => ({
      ...f,
      preExistingDiseases: f.preExistingDiseases.includes(disease)
        ? f.preExistingDiseases.filter(d => d !== disease)
        : [...f.preExistingDiseases, disease],
    }));
  };

  const handleSave = () => {
    if (!form.patientName.trim() || !form.mobile.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Registration">
      <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
        
        {/* Row 1: Title & Patient Name */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '16px', marginBottom: 16 }}>
          <FormGroup label="Title">
            <select value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 10px', fontSize: 13, color: '#444', outline: 'none' }}>
              {TITLES.map(t => <option key={t}>{t}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Patient name">
            <Input value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))} placeholder="Patient name" />
          </FormGroup>
        </div>

        {/* Row 2: Country, Mobile, Age, Month, Day, Gender */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: 16 }}>
          <FormGroup label="Country">
            <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
              style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 8px', fontSize: 13, color: '#444', outline: 'none' }}>
              {COUNTRIES.map(c => <option key={c.code}>{c.name} {c.code}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Mobile Number">
            <div style={{ display: 'flex', gap: '4px' }}>
              <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                style={{ border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 6px', fontSize: 13, color: '#444', outline: 'none', width: '70px' }}>
                {COUNTRIES.map(c => <option key={c.code}>{c.code}</option>)}
              </select>
              <Input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="Mobile" style={{ flex: 1 }} />
            </div>
          </FormGroup>
          <FormGroup label="Age 📅">
            <Input value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="Age" type="number" />
          </FormGroup>
          <FormGroup label="Month">
            <select value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
              style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 8px', fontSize: 13, color: '#444', outline: 'none' }}>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Day">
            <select value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
              style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 8px', fontSize: 13, color: '#444', outline: 'none' }}>
              {DAYS.map(d => <option key={d}>{d}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Gender">
            <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
              style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 8px', fontSize: 13, color: '#444', outline: 'none' }}>
              {GENDERS.map(g => <option key={g}>{g}</option>)}
            </select>
          </FormGroup>
        </div>

        {/* Row 3: Email & Nationality */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 16 }}>
          <FormGroup label="Email ID">
            <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" type="email" />
          </FormGroup>
          <FormGroup label="Nationality">
            <select value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
              style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 10px', fontSize: 13, color: '#444', outline: 'none' }}>
              {NATIONALITIES.map(n => <option key={n}>{n}</option>)}
            </select>
          </FormGroup>
        </div>

        {/* Row 4: Document Type & Document Number */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 16 }}>
          <FormGroup label="Document Type">
            <select value={form.documentType} onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))}
              style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 10px', fontSize: 13, color: '#444', outline: 'none' }}>
              <option>Please Select</option>
              {DOCUMENT_TYPES.map(dt => <option key={dt}>{dt}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Document Number">
            <Input value={form.documentNumber} onChange={e => setForm(f => ({ ...f, documentNumber: e.target.value }))} placeholder="Document Number" />
          </FormGroup>
        </div>

        {/* Row 5: Address */}
        <FormGroup label="Address" style={{ marginBottom: 16 }}>
          <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Address" />
        </FormGroup>

        {/* Row 6: Pre-existing Diseases */}
        <FormGroup label="Pre existing disease" style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {PRE_EXISTING_DISEASES.map(disease => (
              <label key={disease} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 13, color: '#444', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.preExistingDiseases.includes(disease)}
                  onChange={() => toggleDisease(disease)}
                  style={{ width: 16, height: 16, accentColor: '#2563eb', cursor: 'pointer' }}
                />
                {disease}
              </label>
            ))}
          </div>
        </FormGroup>

        {/* Row 7: Drug Allergy */}
        <FormGroup label="Drug Allergy" style={{ marginBottom: 16 }}>
          <Input 
            value={form.drugAllergy} 
            onChange={e => setForm(f => ({ ...f, drugAllergy: e.target.value }))} 
            placeholder="Please mention if you have any drug allergy" 
          />
        </FormGroup>

        {/* Row 8: Registration Charges */}
        <div style={{ 
          background: '#eef2ff', 
          border: '1px solid #c7d2fe', 
          borderRadius: 5, 
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 13, color: '#1a237e', fontWeight: 600, cursor: 'pointer' }}>
            <input
              type="checkbox"
              defaultChecked
              style={{ width: 16, height: 16, accentColor: '#2563eb', cursor: 'pointer' }}
            />
            Patient Registration Charges (Valid for 60 months): – 0
          </label>
          <select value={form.paymentMode} onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value }))}
            style={{ border: '1.5px solid #d1d5db', borderRadius: 5, padding: '6px 10px', fontSize: 13, color: '#444', outline: 'none' }}>
            <option>Cash</option>
            <option>Credit</option>
            <option>Card</option>
            <option>UPI</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e8edf3', paddingTop: 16, marginTop: 16 }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Register Patient</Button>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BranchB2BListPage() {
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [patientRegOpen, setPatientRegOpen] = useState(false);
  const [filterType, setFilterType] = useState<'All' | 'Branch' | 'B2B' | 'Franchise'>('All');

  const filtered = branches.filter(b => {
    const matchesSearch = b.branchName.toLowerCase().includes(search.toLowerCase()) ||
                         b.branchCode.toLowerCase().includes(search.toLowerCase()) ||
                         b.contactPerson.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'All' || b.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleRegisterPatient = (patientData: PatientRegistration) => {
    console.log('Patient registered:', patientData);
    // Here you would typically save to backend
  };

  return (
    <>
      {/* Add Branch Modal */}
      <AddBranchModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={b => setBranches(prev => [...prev, b])}
      />

      {/* Patient Registration Modal */}
      <PatientRegistrationModal
        isOpen={patientRegOpen}
        onClose={() => setPatientRegOpen(false)}
        onSave={handleRegisterPatient}
      />

      {/* Page card */}
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

        {/* ── Header ─ */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid #e8edf3',
          flexWrap: 'wrap',
          gap: 10,
        }}>
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2">
              <path d="M3 21l18 0"/>
              <path d="M5 21v-14l8 -4l8 4v14"/>
              <path d="M9 10a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/>
            </svg>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>Branch & B2B List</h1>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Register Patient Button */}
            <Button variant="success" size="sm"
              onClick={() => setPatientRegOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Register New Patient
            </Button>

            {/* Add Branch */}
            <Button variant="primary" size="sm"
              onClick={() => setAddOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Branch
            </Button>

            {/* Search */}
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search branches..."
              style={{ width: 200, fontSize: 13 }}
            />
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 20px',
          borderBottom: '1px solid #e8edf3',
          background: '#f8fafc',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Filter by Type:</span>
          {(['All', 'Branch', 'B2B', 'Franchise'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '5px 14px',
                borderRadius: 5,
                fontSize: 13,
                fontWeight: filterType === type ? 600 : 500,
                background: filterType === type ? '#2563eb' : '#fff',
                color: filterType === type ? '#fff' : '#374151',
                border: `1.5px solid ${filterType === type ? '#2563eb' : '#d1d5db'}`,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* ── Table ─ */}
        <div style={{ padding: '20px', overflowX: 'auto' }}>
          <Table
            columns={BRANCH_COLS}
            data={filtered as any}
            emptyMessage="No branches found."
          />
        </div>
      </div>
    </>
  );
}

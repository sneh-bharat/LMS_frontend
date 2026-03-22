'use client';

import { useState } from 'react';

const CENTRES = [
  'Select Centre Code',
  'Cash',
  'Credit',
  'Credit Franchise',
  'HO(IP)',
  'sv prasad hospital',
  'Wallet',
  'wallet flexibility',
];

interface CollectorForm {
  name: string;
  address: string;
  mobile: string;
  centre: string;
  status: string;
  priceShow: string;
}

interface AddCollectorModalProps {
  onClose: () => void;
  onSave: (form: CollectorForm) => void;
  initialData?: CollectorForm;
}

export default function AddCollectorModal({ onClose, onSave, initialData }: AddCollectorModalProps) {
  const [form, setForm] = useState<CollectorForm>(
    initialData ?? {
      name: '',
      address: '',
      mobile: '',
      centre: 'Select Centre Code',
      status: 'Active',
      priceShow: 'Yes',
    }
  );

  const set = (k: keyof CollectorForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const isEdit = !!initialData;

  return (
    /* ── Backdrop ── */
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      {/* ── Modal box ── */}
      <div
        style={{
          background: '#fff',
          width: 380,
          maxWidth: '95vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 6,
          boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Modal header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px 14px',
            borderBottom: '1px solid #e8e8e8',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
            {isEdit ? 'Edit Collector' : 'Add Collector'}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              color: '#888',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0 2px',
              fontFamily: 'inherit',
            }}
          >
            ×
          </button>
        </div>

        {/* ── Form body ── */}
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <Field label="Name">
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder=""
            />
          </Field>

          {/* Address */}
          <Field label="Address">
            <Input
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder=""
            />
          </Field>

          {/* Mobile */}
          <Field label="Mobile">
            <Input
              value={form.mobile}
              onChange={(e) => set('mobile', e.target.value)}
              placeholder=""
            />
            <p style={{ margin: '5px 0 0', fontSize: 11.5, color: '#666' }}>
              Use same number during user creation for Blood Collector login.
            </p>
          </Field>

          {/* Associated Centre */}
          <Field label="Associated Centre">
            <Select
              value={form.centre}
              onChange={(e) => set('centre', e.target.value)}
            >
              {CENTRES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <p style={{ margin: '5px 0 0', fontSize: 11.5, color: '#666' }}>
              This will consider for Blood Collector Login.
            </p>
          </Field>

          {/* Status */}
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              <option>Active</option>
              <option>Inactive</option>
            </Select>
          </Field>

          {/* Price Show */}
          <Field label="Price Show">
            <Select
              value={form.priceShow}
              onChange={(e) => set('priceShow', e.target.value)}
            >
              <option>Yes</option>
              <option>No</option>
            </Select>
          </Field>

        </div>

        {/* ── Footer ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            padding: '12px 20px 18px',
            borderTop: '1px solid #f0f0f0',
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: '#757575',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '8px 22px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave?.(form); onClose(); }}
            style={{
              background: '#1565c0',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '8px 22px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Tiny helpers ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 700,
          color: '#222',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
}

function Input({ value, onChange, placeholder, type = 'text' }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: 'block',
        width: '100%',
        border: `1px solid ${focused ? '#1565c0' : '#c8c8c8'}`,
        borderRadius: 4,
        padding: '8px 10px',
        fontSize: 13,
        color: '#222',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        background: '#fff',
        transition: 'border-color 0.15s',
      }}
    />
  );
}

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}

function Select({ value, onChange, children }: SelectProps) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: 'block',
        width: '100%',
        border: `1px solid ${focused ? '#1565c0' : '#c8c8c8'}`,
        borderRadius: 4,
        padding: '8px 10px',
        fontSize: 13,
        color: '#222',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        background: '#fff',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
    >
      {children}
    </select>
  );
}
'use client';

import { useState } from 'react';
import {
  InlineButton as Button,
  InlineInput as Input,
  InlineFormGroup as FormGroup,
} from '@/components/ui';
import { Referrer } from './types';

interface AddReferrerProps {
  onAdd: (referrer: Referrer) => void;
  onClose: () => void;
}

export default function AddReferrer({ onAdd, onClose }: AddReferrerProps) {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    address: '',
    centre: 'HO(IP)',
    marketingAssociate: '',
    status: 'Active' as 'Active' | 'Inactive',
    showOnPrint: 'Hide All' as 'Hide All' | 'Show All',
  });

  const handleAdd = () => {
    if (!form.name.trim()) {
      alert('Please enter a name');
      return;
    }
    onAdd({ id: Date.now(), ...form });
  };

  return (
    <div>
      {/* Content */}
      <div style={{ display: 'grid', gap: 16 }}>
        <FormGroup label="Name">
          <Input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Enter referrer name"
          />
        </FormGroup>

        <FormGroup label="Mobile Number">
          <Input
            value={form.mobile}
            onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
            placeholder="10-digit mobile number"
          />
        </FormGroup>

        <FormGroup label="Address">
          <Input
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            placeholder="Enter address"
          />
        </FormGroup>

        <FormGroup label="Associated Centre">
          <select
            value={form.centre}
            onChange={e => setForm(f => ({ ...f, centre: e.target.value }))}
            style={{
              width: '100%',
              border: '1.5px solid #d1d5db',
              borderRadius: 5,
              padding: '8px 10px',
              fontSize: 13,
              color: '#444',
              outline: 'none',
            }}
          >
            <option>HO(IP)</option>
            <option>HO(OP)</option>
            <option>Branch A</option>
          </select>
        </FormGroup>

        <FormGroup label="Marketing Associate">
          <select
            value={form.marketingAssociate}
            onChange={e => setForm(f => ({ ...f, marketingAssociate: e.target.value }))}
            style={{
              width: '100%',
              border: '1.5px solid #d1d5db',
              borderRadius: 5,
              padding: '8px 10px',
              fontSize: 13,
              color: '#444',
              outline: 'none',
            }}
          >
            <option value="">Select Associate</option>
            <option>Associate 1</option>
            <option>Associate 2</option>
          </select>
        </FormGroup>

        <FormGroup label="Status">
          <select
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
            style={{
              width: '100%',
              border: '1.5px solid #d1d5db',
              borderRadius: 5,
              padding: '8px 10px',
              fontSize: 13,
              color: '#444',
              outline: 'none',
            }}
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </FormGroup>

        <FormGroup label="Show on Print">
          <select
            value={form.showOnPrint}
            onChange={e => setForm(f => ({ ...f, showOnPrint: e.target.value as any }))}
            style={{
              width: '100%',
              border: '1.5px solid #d1d5db',
              borderRadius: 5,
              padding: '8px 10px',
              fontSize: 13,
              color: '#444',
              outline: 'none',
            }}
          >
            <option>Hide All</option>
            <option>Show All</option>
          </select>
        </FormGroup>
      </div>
    </div>
  );
}
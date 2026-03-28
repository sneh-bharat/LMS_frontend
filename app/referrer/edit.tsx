'use client';

import { useState, useEffect } from 'react';
import {
  InlineButton as Button,
  InlineInput as Input,
  InlineFormGroup as FormGroup,
} from '@/components/ui';
import { Referrer } from './types';

interface EditReferrerProps {
  referrer: Referrer;
  onUpdate: (referrer: Referrer) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export default function EditReferrer({
  referrer,
  onUpdate,
  onDelete,
  onClose,
}: EditReferrerProps) {
  const [form, setForm] = useState<Referrer>(referrer);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setForm(referrer);
  }, [referrer]);

  const handleUpdate = () => {
    if (!form.name.trim()) {
      alert('Please enter a name');
      return;
    }
    onUpdate(form);
  };

  const handleDelete = () => {
    onDelete(form.id);
    onClose();
  };

  return (
    <>
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

        <div style={{
          marginTop: 20,
          paddingTop: 20,
          borderTop: '1px solid #e8edf3',
        }}>
          <div style={{
            backgroundColor: '#fef2f2',
            padding: 12,
            borderRadius: 6,
            border: '1px solid #fee2e2',
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: 13,
              fontWeight: 600,
              color: '#991b1b',
            }}>
              Danger Zone
            </h3>
            <p style={{
              margin: '0 0 12px 0',
              fontSize: 12,
              color: '#7f1d1d',
            }}>
              Once you delete this referrer, there is no going back. Please be certain.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              style={{ width: '100%' }}
            >
              Delete Referrer
            </Button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 24,
            maxWidth: 400,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: 16,
              fontWeight: 600,
              color: '#1a1a2e',
            }}>
              Delete Referrer?
            </h3>
            <p style={{
              margin: '0 0 20px 0',
              fontSize: 14,
              color: '#666',
            }}>
              Are you sure you want to delete "{form.name}"? This action cannot be undone.
            </p>
            <div style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'flex-end',
            }}>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
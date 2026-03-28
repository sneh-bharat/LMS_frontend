'use client';
import { useState } from 'react';
import {
  InlineButton as Button,
  InlineInput as Input,
  InlineFormGroup as FormGroup,
  InlineTable as Table,
} from '@/components/ui';
import { Referrer } from './types';

interface CommissionConfigProps {
  referrer: Referrer;
  referrers: Referrer[];
  onClose: () => void;
}

interface CommissionRecord {
  id: string;
  category: string;
  investigation: string;
  mrp: number;
  commission: number;
  value: number;
}

const COMMISSION_COLUMNS = [
  { key: 'category', label: 'Category' },
  { key: 'investigation', label: 'Investigation' },
  { key: 'mrp', label: 'MRP' },
  { key: 'commission', label: 'Comm (%)' },
  { key: 'value', label: 'Value' },
  { key: 'action', label: 'Action' },
];

export default function CommissionConfig({
  referrer,
  referrers,
  onClose,
}: CommissionConfigProps) {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [copyFrom, setCopyFrom] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    investigation: '',
    mrp: '',
    commission: '',
  });

  const handleCopyCommission = () => {
    if (!copyFrom) {
      alert('Please select a referrer');
      return;
    }
    alert(`Copying commissions from ${copyFrom}`);
    setCopyFrom('');
  };

  const handleAddCommission = () => {
    if (!formData.category.trim() || !formData.investigation.trim() || !formData.mrp || !formData.commission) {
      alert('Please fill all fields');
      return;
    }

    const mrp = parseFloat(formData.mrp);
    const comm = parseFloat(formData.commission);
    const value = (mrp * comm) / 100;

    const newRecord: CommissionRecord = {
      id: Date.now().toString(),
      category: formData.category,
      investigation: formData.investigation,
      mrp,
      commission: comm,
      value,
    };

    setCommissions([...commissions, newRecord]);
    setFormData({ category: '', investigation: '', mrp: '', commission: '' });
    setShowAddForm(false);
  };

  const handleDeleteCommission = (id: string) => {
    setCommissions(commissions.filter(c => c.id !== id));
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{
        padding: 16,
        backgroundColor: '#f0f4f8',
        borderRadius: 6,
      }}>
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: 13,
          fontWeight: 600,
          color: '#1a1a2e',
        }}>
          Copy Commission from Another Referrer
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={copyFrom}
            onChange={e => setCopyFrom(e.target.value)}
            style={{
              flex: 1,
              border: '1.5px solid #d1d5db',
              borderRadius: 5,
              padding: '8px 10px',
              fontSize: 13,
              color: '#444',
              outline: 'none',
            }}
          >
            <option value="">Select a referrer</option>
            {referrers.filter(r => r.id !== referrer.id).map(r => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={handleCopyCommission}
            style={{ flexShrink: 0 }}
          >
            Copy
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div style={{
          padding: 16,
          backgroundColor: '#f9fafb',
          borderRadius: 6,
          border: '1px solid #e8edf3',
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: 13,
            fontWeight: 600,
            color: '#1a1a2e',
          }}>
            Add New Commission
          </h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <FormGroup label="Category">
              <Input
                value={formData.category}
                onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                placeholder="e.g., General, Premium"
              />
            </FormGroup>
            <FormGroup label="Investigation">
              <Input
                value={formData.investigation}
                onChange={e => setFormData(f => ({ ...f, investigation: e.target.value }))}
                placeholder="Investigation name"
              />
            </FormGroup>
            <FormGroup label="MRP">
              <Input
                value={formData.mrp}
                onChange={e => setFormData(f => ({ ...f, mrp: e.target.value }))}
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </FormGroup>
            <FormGroup label="Commission (%)">
              <Input
                value={formData.commission}
                onChange={e => setFormData(f => ({ ...f, commission: e.target.value }))}
                placeholder="0"
                type="number"
                step="0.1"
              />
            </FormGroup>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ category: '', investigation: '', mrp: '', commission: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddCommission}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <h3 style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            color: '#1a1a2e',
          }}>
            Commission Records
          </h3>
          {!showAddForm && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddForm(true)}
            >
              Add Commission
            </Button>
          )}
        </div>

        {commissions.length === 0 ? (
          <div style={{
            padding: '32px 20px',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            borderRadius: 6,
            border: '1px dashed #e8edf3',
          }}>
            <p style={{ margin: 0, fontSize: 13, color: '#999' }}>
              No commission records found. Add one to get started.
            </p>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12,
            backgroundColor: '#fff',
            borderRadius: 6,
            border: '1px solid #e8edf3',
            overflow: 'hidden',
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e8edf3',
              }}>
                {COMMISSION_COLUMNS.map(col => (
                  <th
                    key={col.key}
                    style={{
                      padding: '10px 12px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#64748b',
                      fontSize: 12,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commissions.map((commission, idx) => (
                <tr
                  key={commission.id}
                  style={{
                    borderBottom: '1px solid #e8edf3',
                    backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb',
                  }}
                >
                  <td style={{ padding: '10px 12px', color: '#1a1a2e' }}>
                    {commission.category}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#666' }}>
                    {commission.investigation}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#666' }}>
                    ₹{commission.mrp.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#666' }}>
                    {commission.commission}%
                  </td>
                  <td style={{ padding: '10px 12px', color: '#22a06b', fontWeight: 500 }}>
                    ₹{commission.value.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCommission(commission.id)}
                      style={{
                        padding: '2px 6px',
                        fontSize: 11,
                        color: '#dc2626',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
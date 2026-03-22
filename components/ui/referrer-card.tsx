import React from 'react';

interface Referrer {
  id: number;
  name: string;
  mobile: string;
  address: string;
  centre: string;
  marketingAssociate: string;
  status: 'Active' | 'Inactive';
  showOnPrint: 'Hide All' | 'Show All';
}

interface ReferrerCardProps {
  referrer: Referrer;
  onEdit: () => void;
  onCommission: () => void;
}

export default function ReferrerCard({ 
  referrer, 
  onEdit, 
  onCommission 
}: ReferrerCardProps) {
  return (
    <div style={{ 
      padding: '16px', 
      position: 'relative' as const, 
      background: '#fff', 
      borderRadius: 8, 
      boxShadow: '0 1px 4px rgba(0,0,0,0.10)', 
      border: '1px solid #e8edf3' 
    }}>
      {/* Centre label */}
      <p style={{ margin: '0 0 4px', fontSize: 12, color: '#666' }}>{referrer.centre}</p>

      {/* Status badge */}
      <div style={{ position: 'absolute', top: 14, right: 14 }}>
        <span style={{ 
          display: 'inline-block', 
          padding: '2px 10px', 
          borderRadius: 20, 
          fontSize: 11, 
          fontWeight: 600, 
          background: referrer.status === 'Active' ? '#dcfce7' : '#fee2e2', 
          color: referrer.status === 'Active' ? '#16a34a' : '#dc2626' 
        }}>
          {referrer.status}
        </span>
      </div>

      {/* Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        {/* Referrer icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a6bb5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{referrer.name}</span>
      </div>

      {/* Address */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4, minHeight: 18 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" style={{ marginTop: 2, flexShrink: 0 }}>
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span style={{ fontSize: 12, color: '#555' }}>{referrer.address || ''}</span>
      </div>

      {/* Mobile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" style={{ flexShrink: 0 }}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 12, color: '#555' }}>{referrer.mobile}</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button 
          onClick={onEdit}
          style={{ 
            border: 'none', 
            borderRadius: 5, 
            cursor: 'pointer', 
            fontWeight: 500, 
            padding: '5px 12px', 
            fontSize: 12,
            background: '#16a34a', 
            color: '#fff',
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 5 
          }}
        >
          Edit
        </button>
        <button 
          onClick={onCommission}
          style={{ 
            border: 'none', 
            borderRadius: 5, 
            cursor: 'pointer', 
            fontWeight: 500, 
            padding: '5px 12px', 
            fontSize: 12,
            background: '#16a34a', 
            color: '#fff',
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 5 
          }}
        >
          Commission
        </button>
      </div>
    </div>
  );
}

import React from 'react';

interface InlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function InlineModal({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: InlineModalProps) {
  if (!isOpen) return null;
  
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: 'rgba(0,0,0,0.45)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 1000 
    }}>
      <div style={{ 
        background: '#fff', 
        borderRadius: 8, 
        width: 580, 
        maxWidth: '92vw', 
        padding: 24, 
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)', 
        maxHeight: '90vh', 
        overflowY: 'auto' as const 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 20 
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1a1a2e' }}>{title}</h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: 22, 
              color: '#666', 
              lineHeight: 1 
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

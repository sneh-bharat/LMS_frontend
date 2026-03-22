import React from 'react';

interface InlineFormGroupProps {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function InlineFormGroup({ 
  label, 
  children, 
  style = {} 
}: InlineFormGroupProps) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column' as const, 
      gap: 5, 
      ...style 
    }}>
      <label style={{ 
        fontSize: 12, 
        fontWeight: 600, 
        color: '#374151' 
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

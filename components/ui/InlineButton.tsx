import React from 'react';

interface InlineButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export default function InlineButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  style = {} 
}: InlineButtonProps) {
  const base: React.CSSProperties = {
    border: 'none', 
    borderRadius: 5, 
    cursor: 'pointer', 
    fontWeight: 500,
    padding: size === 'sm' ? '5px 12px' : '7px 18px',
    fontSize: size === 'sm' ? 12 : 13,
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: 5,
  };
  
  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: '#2563eb', color: '#fff' },
    secondary: { background: '#5a6474', color: '#fff' },
    success:   { background: '#16a34a', color: '#fff' },
    danger:    { background: '#dc2626', color: '#fff' },
    ghost:     { background: 'none', color: '#2563eb', padding: 0 },
  };
  
  return (
    <button 
      onClick={onClick} 
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

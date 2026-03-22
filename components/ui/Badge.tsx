import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'secondary' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  style = {}
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-xl font-black uppercase tracking-widest';

  const variantStyles = {
    success: 'bg-emerald-100 text-emerald-700',
    danger: 'bg-rose-100 text-rose-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-sky-100 text-sky-700',
    primary: 'bg-blue-600 text-white shadow-lg shadow-blue-500/20',
    secondary: 'bg-slate-100 text-slate-500 border border-slate-200',
    gradient: 'custom-gradient text-white shadow-md shadow-green-500/10',
  };

  const sizeStyles = {
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[10px] px-3 py-1',
    lg: 'text-[11px] px-4 py-1.5',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

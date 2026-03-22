import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'secondary';
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
  const baseStyles = 'inline-flex items-center px-3 py-1 rounded-full font-semibold';
  
  const variantStyles = {
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-200 text-gray-800',
  };
  
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm',
    lg: 'text-base px-4 py-1.5',
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

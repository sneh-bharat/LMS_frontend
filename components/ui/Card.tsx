import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Card({ children, className = '', style = {} }: CardProps) {
  const baseStyles = 'bg-white rounded-lg shadow-md border border-gray-100';
  
  return (
    <div 
      className={`${baseStyles} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

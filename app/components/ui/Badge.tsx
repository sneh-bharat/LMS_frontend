'use client';

import React from 'react';

interface BadgeProps {
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'gradient' | 'info';
    className?: string;
    children: React.ReactNode;
}

export default function Badge({
    variant = 'primary',
    className = '',
    children,
}: BadgeProps) {
    const variants = {
        primary: 'bg-blue-50 text-blue-700 border-blue-100',
        secondary: 'bg-slate-100 text-slate-600 border-slate-200',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border-amber-100',
        danger: 'bg-rose-50 text-rose-700 border-rose-100',
        info: 'bg-cyan-50 text-cyan-700 border-cyan-100',
        gradient: 'custom-gradient2 text-white border-transparent'
    };

    const baseClass = 'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors uppercase tracking-tight';
    const variantClass = variants[variant] || variants.primary;

    return <span className={`${baseClass} ${variantClass} ${className}`}>{children}</span>;
}
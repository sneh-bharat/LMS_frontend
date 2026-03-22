'use client';

import React from 'react';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'gradient' | 'ghost';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    fullWidth?: boolean;
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    disabled = false,
    type = 'button',
    fullWidth = false,
    className = '',
    children,
    onClick,
}: ButtonProps) {
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700',
        danger: 'bg-rose-600 text-white hover:bg-rose-700',
        warning: 'bg-amber-500 text-white hover:bg-amber-600',
        outline: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm',
        gradient: 'custom-gradient text-white shadow-md active:scale-[0.98]',
        ghost: 'text-slate-500 hover:bg-slate-100'
    };

    const sizes = {
        xs: 'px-2.5 py-1.5 text-[10px]',
        sm: 'px-3 py-2 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    const baseClass = 'inline-flex items-center justify-center font-bold transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider';
    const variantClass = variants[variant] || variants.primary;
    const sizeClass = sizes[size] || sizes.md;
    const fullWidthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            type={type}
            className={`${baseClass} ${variantClass} ${sizeClass} ${fullWidthClass} ${className}`.trim()}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
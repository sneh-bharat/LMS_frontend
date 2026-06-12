import React from 'react';

interface FormGroupProps {
    label: string;
    children: React.ReactNode;
    error?: string;
}

export default function FormGroup({ label, children, error }: FormGroupProps) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            {children}
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}

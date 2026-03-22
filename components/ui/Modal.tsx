// app/components/ui/Modal.tsx

import React from 'react';
import Button from '@/components/ui/button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onSave?: () => void;
    onCancel?: () => void;
    size?: 'sm' | 'md' | 'lg';
    showFooter?: boolean;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    onSave,
    onCancel,
    size = 'md',
    showFooter = true,
}: ModalProps) {
    if (!isOpen) return null;

    const sizeStyles = {
        sm: { maxWidth: '400px' },
        md: { maxWidth: '600px' },
        lg: { maxWidth: '800px' },
    };

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}
            />

            {/* Modal */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-modal)',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    zIndex: 1001,
                    ...sizeStyles[size],
                    width: '90%',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--spacing-lg)',
                        borderBottom: '1px solid var(--border-light)',
                        background: 'var(--bg-card)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{title}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: 0,
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: 'var(--spacing-lg)' }}>{children}</div>

                {/* Footer */}
                {showFooter && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 'var(--spacing-md)',
                            padding: 'var(--spacing-lg)',
                            borderTop: '1px solid var(--border-light)',
                            background: 'var(--bg-page)',
                            position: 'sticky',
                            bottom: 0,
                            zIndex: 10,
                        }}
                    >
                        <Button
                            variant="secondary"
                            onClick={onCancel || onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={onSave}
                        >
                            Save
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}
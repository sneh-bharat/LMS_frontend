interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    fullWidth?: boolean;
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    className = '',
    children,
    onClick,
}: ButtonProps) {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const fullWidthClass = fullWidth ? 'btn-block' : '';

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${fullWidthClass} ${className}`.trim()}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
interface BadgeProps {
    variant?: 'primary' | 'success' | 'warning' | 'danger';
    withStatus?: boolean;
    children: React.ReactNode;
}

export default function Badge({
    variant = 'primary',
    withStatus = false,
    children,
}: BadgeProps) {
    const baseClass = withStatus ? 'badge badge-status' : 'badge';
    const variantClass = `badge-${variant}`;

    return <span className={`${baseClass} ${variantClass}`}>{children}</span>;
}
interface CardProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    action?: React.ReactNode;
}

export default function Card({
    title,
    subtitle,
    children,
    footer,
    action,
}: CardProps) {
    return (
        <div className="card">
            {(title || action) && (
                <div className="card-header">
                    <div>
                        {title && <h3 className="font-semibold">{title}</h3>}
                        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
                    </div>
                    {action}
                </div>
            )}

            <div className="card-body">{children}</div>

            {footer && <div className="card-footer">{footer}</div>}
        </div>
    );
}
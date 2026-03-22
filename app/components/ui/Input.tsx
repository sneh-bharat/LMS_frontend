interface InputProps {
    type?: 'text' | 'email' | 'number' | 'password';
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    error?: string;
    readOnly?: boolean;
}

export default function Input({
    type = 'text',
    placeholder,
    value,
    onChange,
    disabled,
    error,
    readOnly,
}: InputProps) {
    return (
        <div className="form-group">
            <input
                type={type}
                className={`input-field ${error ? 'input-error' : ''}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                readOnly={readOnly}
            />
            {error && <span className="text-danger text-sm">{error}</span>}
        </div>
    );
}
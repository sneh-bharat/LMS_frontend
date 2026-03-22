import React from 'react';

interface InlineInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  type?: string;
}

const InlineInput = React.forwardRef<HTMLInputElement, InlineInputProps>(
  ({ value, onChange, placeholder = '', style = {}, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        style={{ 
          border: '1.5px solid #d1d5db', 
          borderRadius: 5, 
          padding: '6px 10px', 
          fontSize: 13, 
          color: '#444', 
          outline: 'none', 
          width: '100%', 
          boxSizing: 'border-box', 
          ...style 
        }}
        {...props}
      />
    );
  }
);

InlineInput.displayName = 'InlineInput';

export default InlineInput;

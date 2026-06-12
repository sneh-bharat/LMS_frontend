import React from 'react';

type InlineInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const InlineInput = React.forwardRef<HTMLInputElement, InlineInputProps>(
  ({ style = {}, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        style={{
          border: '1.5px solid #d1d5db',
          borderRadius: 5,
          padding: '6px 10px',
          fontSize: 13,
          color: '#444',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          ...style,
        }}
      />
    );
  }
);

InlineInput.displayName = 'InlineInput';

export default InlineInput;
import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { label, id, name, type = 'text', error, helperText, className = '', containerStyle = {}, ...props },
  ref
) {
  const inputId = id || name;

  return (
    <div style={{ marginBottom: '1rem', ...containerStyle }}>
      {label && (
        <label htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        className={`${error ? 'error' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="form-error">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p style={{ fontSize: '0.825rem', color: '#6b7280', marginTop: '0.25rem' }}>
          {helperText}
        </p>
      )}
    </div>
  );
});

